"""NHTSA 리콜의 게시일로 캠페인을 주차에 나눈다.

python3 -B posted.py <평면 파일> <주차>... [--access <접속 기록 파일>]

게시일과 리콜 그룹이 고르는 범위는 소식 조사 4단계(SKILL.md)의 리콜이 정본이고, 여기서는 그 정의를 필드로
옮긴다.

- 평면 파일(recall.py와 같은 파일)에서 차량 리콜(`RCLTYPECD` V)과 장비 리콜(E) 가운데, 접수일 `RCDATE`가 맡은
  주차의 첫 주와 그 전 4주부터 끝 주의 일요일까지인 캠페인을 뽑는다.
- 캠페인마다 `https://api.nhtsa.gov/safetyIssues/byNhtsaId?nhtsaId=<번호>`를 열어, 파일 이름이 `RCLRPT`로
  시작하는 문서의 가장 이른 `loadDate`를 한국 시각으로 바꾼 날을 게시일로 본다.
- API가 실패한(응답이 없거나 `RCLRPT` 문서가 없는) 캠페인은 접수일로 판정하고, 실패를 따로 낸다. `--access`를
  주면 그 실패를 `failed`에 담은 NHTSA 리콜의 접속 기록 한 줄을 그 파일 끝에 더한다(researcher.md의 접속 기록).

--api-dir은 API 대신 `<폴더>/<번호>.json`을 읽는다(테스트). 파일이 없으면 API가 실패한 것으로 본다.
"""

import argparse
import datetime
import json
import os
import re
import sys
import time
import urllib.request

from recall import CAMPNO, RCDATE, RCLTYPECD, read_rows, short

API = "https://api.nhtsa.gov/safetyIssues/byNhtsaId?nhtsaId="
# 매체 목록의 접속 절이 정한 브라우저 User-Agent와 요청 간격(outlets.md).
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
INTERVAL = 1.0
TYPES = ("V", "E")
EARLIER_WEEKS = 4
KST = datetime.timezone(datetime.timedelta(hours=9))
SOURCE = "NHTSA 리콜"


def week_days(week):
    """주차(`2026-w46`)의 월요일과 일요일."""
    year, number = re.fullmatch(r"(\d{4})-w(\d{2})", week).groups()
    monday = datetime.date.fromisocalendar(int(year), int(number), 1)
    return monday, monday + datetime.timedelta(days=6)


def iso_week(day):
    year, number, _ = day.isocalendar()
    return f"{year}-w{number:02d}"


def received(row):
    value = row[RCDATE]
    return datetime.date(int(value[:4]), int(value[4:6]), int(value[6:8]))


def posted_date(response):
    """API 응답에서 `RCLRPT` 문서의 가장 이른 loadDate(한국 시각의 날). 없으면 None."""
    loads = [
        doc["loadDate"]
        for result in response.get("results") or []
        for recall in result.get("recalls") or []
        for doc in recall.get("associatedDocuments") or []
        if doc.get("fileName", "").startswith("RCLRPT") and doc.get("loadDate")
    ]
    if not loads:
        return None
    moment = min(datetime.datetime.fromisoformat(load.replace("Z", "+00:00")) for load in loads)
    return moment.astimezone(KST).date()


def fetch(number):
    request = urllib.request.Request(API + number, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def lookup(number, api_dir):
    """(게시일, 실패 까닭). 둘 가운데 하나만 있다."""
    try:
        if api_dir:
            path = os.path.join(api_dir, f"{number}.json")
            if not os.path.exists(path):
                return None, "응답 없음"
            with open(path, encoding="utf-8") as f:
                response = json.load(f)
        else:
            response = fetch(number)
    except Exception as error:  # 네트워크, HTTP, JSON 오류를 모두 실패로 적는다
        return None, f"{type(error).__name__}: {error}"
    date = posted_date(response)
    return (date, None) if date else (None, "RCLRPT 문서 없음")


def main(argv):
    parser = argparse.ArgumentParser(description="NHTSA 리콜의 게시일로 캠페인을 주차에 나눈다")
    parser.add_argument("flat_file")
    parser.add_argument("weeks", nargs="+")
    parser.add_argument("--access")
    parser.add_argument("--api-dir")
    args = parser.parse_args(argv)
    for week in args.weeks:
        if not re.fullmatch(r"\d{4}-w\d{2}", week):
            parser.error(f"주차는 YYYY-wNN으로 준다: {week}")

    first = min(week_days(w)[0] for w in args.weeks)
    last = max(week_days(w)[1] for w in args.weeks)
    start = first - datetime.timedelta(weeks=EARLIER_WEEKS)
    campaigns = {}
    for row in read_rows(args.flat_file):
        if row[CAMPNO] and row[RCLTYPECD] in TYPES and start <= received(row) <= last:
            campaigns.setdefault(row[CAMPNO], row)

    by_week = {w: [] for w in args.weeks}
    failed = []
    for i, (number, row) in enumerate(sorted(campaigns.items())):
        if i and not args.api_dir:
            time.sleep(INTERVAL)
        name = short(number)
        date, error = lookup(name, args.api_dir)
        if error:
            failed.append(f"{name}: {error}, 접수일로 판정")
            line = f"{name}\t접수일 {received(row)}(게시일 API 실패)"
            week = iso_week(received(row))
        else:
            line = f"{name}\t게시일 {date}\t접수일 {received(row)}"
            week = iso_week(date)
        if week in by_week:
            by_week[week].append(f"{line}\t{row[RCLTYPECD]}")

    print(f"평면 파일에서 접수일 {start}~{last}인 차량·장비 캠페인 {len(campaigns)}건을 봄")
    for week in args.weeks:
        print(f"{week}: 게시일(API가 실패하면 접수일)이 이 주인 캠페인 {len(by_week[week])}건")
        for line in by_week[week]:
            print(line)
    print(f"\n게시일 API 실패 {len(failed)}건(PR 본문의 열지 못한 곳에 오른다)")
    for line in failed:
        print(f"- {line}")

    if args.access:
        record = {
            "source": SOURCE,
            "week": "",
            "opened": True,
            "how": "평면 파일, 게시일 API(posted.py)",
            "seen": sum(len(lines) for lines in by_week.values()),
            "reason": "",
            "shallow": "",
            "differs": "",
            "failed": failed,
        }
        ends_open = False
        if os.path.exists(args.access) and os.path.getsize(args.access):
            with open(args.access, "rb") as f:
                f.seek(-1, os.SEEK_END)
                ends_open = f.read(1) != b"\n"
        with open(args.access, "a", encoding="utf-8") as f:
            f.write(("\n" if ends_open else "") + json.dumps(record, ensure_ascii=False) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
