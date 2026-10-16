"""초안 에이전트의 brief-part.md들을 브리프의 `## 현행판 표`와 `## 사본 목록`에 합친다.

python3 -B merge_brief.py <브리프> <brief-part.md>...

절은 줄머리의 `## ` 제목으로만 자르고, 코드 울타리(```, ~~~) 안의 줄은 제목으로
보지 않는다. 지시 블록이 글 가운데 `## 현행판 표`를 적어도 자르지 않는다. 두 절 밖의
글은 그대로 두고, 브리프는 그 자리에서 고쳐 쓴다.

현행판 표의 머리(구분 줄까지)는 브리프나 첫 조각의 것 하나만 두고, 줄과 사본 목록의
항목은 글자가 같은 것을 한 번만 둔다. 첫 칸(이름)이 같은데 글자가 다른 줄은 모두 두고,
그 이름과 줄을 낸 조각을 출력한다.
"""

import os
import re
import sys

EDITIONS = "## 현행판 표"
COPIES = "## 사본 목록"
FENCE = re.compile(r"\s*(`{3,}|~{3,})")
SEPARATOR = re.compile(r"\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?")


def split_sections(text):
    """머리(첫 제목 앞의 줄)와 [제목, 본문 줄] 목록으로 나눈다."""
    head, sections, fence = [], [], None
    for line in text.splitlines():
        opening = FENCE.match(line)
        if fence is None and opening:
            fence = opening.group(1)
        elif fence is not None and re.fullmatch(rf"\s*{re.escape(fence[0])}{{{len(fence)},}}\s*", line):
            fence = None
        elif fence is None and line.startswith("## "):
            sections.append([line, []])
            continue
        (sections[-1][1] if sections else head).append(line)
    return head, sections


def entries(lines):
    """절 본문에서 빈 줄을 뺀 줄."""
    return [line for line in lines if line.strip()]


def split_table(lines):
    """표 절의 줄을 머리(구분 줄까지)와 나머지 줄로 나눈다. 구분 줄이 없으면 머리가 없다."""
    for index, line in enumerate(lines):
        if SEPARATOR.fullmatch(line.strip()):
            return lines[: index + 1], lines[index + 1 :]
    return [], lines


def bodies(text, title):
    """글에서 그 제목의 절 본문 줄."""
    return [entries(lines) for t, lines in split_sections(text)[1] if t == title]


def merge(brief_text, parts):
    """parts는 (이름, 글) 목록이다. 합친 브리프와, 이름이 같은 표준의 {이름: [(출처, 줄)]}을 낸다."""
    head, sections = split_sections(brief_text)
    for title in (EDITIONS, COPIES):
        if not any(t == title for t, _ in sections):
            sections.append([title, []])
    header, rows = split_table(sum(bodies(brief_text, EDITIONS), []))
    copies = sum(bodies(brief_text, COPIES), [])
    # 브리프의 줄도 조각에 있으면 조각 이름을 붙인다. 다시 돌려도 어느 에이전트의 줄인지 보이게 한다.
    origin = dict.fromkeys(rows, "브리프")
    for name, text in parts:
        for body in bodies(text, EDITIONS):
            part_header, part_rows = split_table(body)
            header = header or part_header
            for row in part_rows:
                if row not in rows:
                    rows.append(row)
                if origin.get(row, "브리프") == "브리프":
                    origin[row] = name
        for body in bodies(text, COPIES):
            copies += [line for line in body if line not in copies]
    merged = {EDITIONS: header + rows, COPIES: copies}
    out = head[:]
    for title, lines in sections:
        out.append(title)
        out += ["", *merged[title], ""] if title in merged else lines
    return "\n".join(out).rstrip("\n") + "\n", same_names(rows, origin)


def same_names(rows, origin):
    """첫 칸이 같은데 글자가 다른 줄을 모은다."""
    found = {}
    for row in rows:
        name = row.strip().strip("|").split("|")[0].strip()
        found.setdefault(name, []).append((origin[row], row))
    return {name: rows for name, rows in found.items() if len(rows) > 1}


def main(argv):
    brief, *paths = argv
    with open(brief) as f:
        text = f.read()
    parts = []
    for path in paths:
        with open(path) as f:
            parts.append((os.path.basename(path), f.read()))
    merged, same = merge(text, parts)
    with open(brief, "w") as f:
        f.write(merged)
    if same:
        print(f"이름이 같은 표준 {len(same)}개:")
        for name, rows in same.items():
            print(f"- {name}")
            for source, row in rows:
                print(f"  - {source}: {row}")


if __name__ == "__main__":
    main(sys.argv[1:])
