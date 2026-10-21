"""NHTSA 리콜 평면 파일로 리콜 문턱(대수, 새 결함 유형)을 센다.

python3 -B recall.py <평면 파일> <캠페인 번호>...
python3 -B recall.py <평면 파일> --category <부품 분류> --date <YYYY-MM-DD>

평면 파일은 https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip 이고, 받은 zip이나 푼 txt를 준다.
필드는 https://static.nhtsa.gov/odi/ffdd/rcl/RCL.txt 에 있다. 문턱과 소프트웨어 리콜의 정의는 소식 조사
6단계(SKILL.md)가 정본이고, 여기서는 그 정의를 필드로 옮긴다.

- 대수는 `POTAFF`, 접수일은 `RCDATE`다. 캠페인의 행마다 같다.
- 부품 분류는 `COMPNAME`의 첫 `:` 앞이다. 캠페인의 행마다 다를 수 있어 모두 모은다. NHTSA API는 행마다
  분류를 하나만 보여 주므로 이 셈에 쓰지 않는다.
- 소프트웨어 리콜은 `RCLTYPECD`가 `V`(차량)이고, 결함 요약 `DESC_DEFECT`에 낱말 software가 있거나
  `COMPNAME`에 `SOFTWARE`가 든 행이 하나라도 있는 캠페인이다.
- 접수일 전 12개월은 그 전해 같은 날부터 접수일 전날까지다.
- 6단계의 소프트웨어 리콜은 차량 리콜만 센다. 4단계가 싣는 장비 리콜은 이 정의 밖으로 나온다.

--category와 --date는 NHTSA 밖의 리콜에 쓴다. 가장 가까운 NHTSA 부품 분류와 그 리콜의 날짜를 주면, 그 날 전
12개월의 소프트웨어 리콜을 센다.
"""

import argparse
import io
import re
import sys
import zipfile
from collections import defaultdict

CAMPNO, COMPNAME, RCLTYPECD, POTAFF, RCDATE, DESC_DEFECT = 1, 6, 10, 11, 15, 19
SOFTWARE_WORD = re.compile(r"\bsoftware\b", re.IGNORECASE)
FIELDS = 29
THRESHOLD = 100_000


def read_rows(path):
    """평면 파일의 행. zip이면 그 안의 txt 하나를 읽는다."""
    if path.endswith(".zip"):
        with zipfile.ZipFile(path) as archive:
            name = next(n for n in archive.namelist() if n.endswith(".txt"))
            stream = io.TextIOWrapper(archive.open(name), encoding="utf-8", errors="replace", newline="")
            return [split(line) for line in stream]
    with open(path, encoding="utf-8", errors="replace", newline="") as f:
        return [split(line) for line in f]


def split(line):
    row = line.rstrip("\r\n").split("\t")
    return row + [""] * (FIELDS - len(row))


def category(row):
    return row[COMPNAME].split(":")[0].strip()


def is_software(row):
    return row[RCLTYPECD] == "V" and bool(SOFTWARE_WORD.search(row[DESC_DEFECT]) or "SOFTWARE" in row[COMPNAME])


class Campaign:
    def __init__(self, number, rows):
        self.number = number
        self.date = rows[0][RCDATE]
        self.units = int(rows[0][POTAFF] or 0)
        self.categories = sorted({category(row) for row in rows})
        self.software = any(is_software(row) for row in rows)


def campaigns(rows):
    grouped = defaultdict(list)
    for row in rows:
        if row[CAMPNO]:
            grouped[row[CAMPNO]].append(row)
    return {number: Campaign(number, rows) for number, rows in grouped.items()}


def year_before(date):
    """YYYYMMDD의 전해 같은 날. 2월 29일은 2월 28일로 본다."""
    day = date[4:]
    return f"{int(date[:4]) - 1:04d}{'0228' if day == '0229' else day}"


def prior(all_campaigns, name, date, exclude=None):
    """date(YYYYMMDD) 전 12개월에 접수한, 분류 name이 든 소프트웨어 리콜. 접수일 순이다."""
    start = year_before(date)
    found = [
        c
        for c in all_campaigns.values()
        if c.number != exclude and c.software and start <= c.date < date and name in c.categories
    ]
    return sorted(found, key=lambda c: (c.date, c.number))


def short(number):
    return number[:-3] if len(number) == 9 and number.endswith("000") else number


def full(number):
    number = number.strip().upper()
    return number + "000" if len(number) == 6 else number


def iso(date):
    return f"{date[:4]}-{date[4:6]}-{date[6:]}"


def counted(name, found):
    return f"{name}: {len(found)}건" + (f"({', '.join(short(c.number) for c in found)})" if found else "")


def report(all_campaigns, number):
    c = all_campaigns[number]
    kind = "소프트웨어 리콜(6단계 정의)" if c.software else "6단계 소프트웨어 리콜 정의 밖"
    lines = [f"{short(number)}: 접수일 {iso(c.date)}, 대수 {c.units:,}, {kind}"]
    lines.append(f"  접수일 전 12개월({iso(year_before(c.date))}부터) 같은 분류의 소프트웨어 리콜")
    new = []
    for name in c.categories:
        found = prior(all_campaigns, name, c.date, exclude=number)
        lines.append(f"  - {counted(name, found)}")
        if not found:
            new.append(name)
    verdict = f"새 결함 유형임({', '.join(new)})" if new else "새 결함 유형 아님"
    units = "대수 10만 대 이상" if c.units >= THRESHOLD else "대수 10만 대 미만"
    passed = "문턱을 넘음" if new or c.units >= THRESHOLD else "문턱을 넘지 않음"
    lines.append(f"  → {verdict}, {units}: {passed}")
    return "\n".join(lines)


def main(argv):
    parser = argparse.ArgumentParser(description="NHTSA 리콜 평면 파일로 리콜 문턱을 센다")
    parser.add_argument("flat_file")
    parser.add_argument("campaigns", nargs="*")
    parser.add_argument("--category")
    parser.add_argument("--date")
    args = parser.parse_args(argv)
    if bool(args.category) != bool(args.date) or bool(args.category) == bool(args.campaigns):
        parser.error("캠페인 번호를 주거나, --category와 --date를 함께 준다")

    all_campaigns = campaigns(read_rows(args.flat_file))
    if args.category:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.date):
            parser.error(f"--date는 YYYY-MM-DD로 준다: {args.date}")
        date = args.date.replace("-", "")
        found = prior(all_campaigns, args.category, date)
        print(f"{args.date} 전 12개월({iso(year_before(date))}부터)의 소프트웨어 리콜")
        print(counted(args.category, found))
        return 0

    missing = [n for n in args.campaigns if full(n) not in all_campaigns]
    if missing:
        print(f"평면 파일에 없는 캠페인: {', '.join(missing)}", file=sys.stderr)
        return 1
    print("\n".join(report(all_campaigns, full(n)) for n in args.campaigns))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
