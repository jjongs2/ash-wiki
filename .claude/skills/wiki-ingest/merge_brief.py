"""초안 에이전트의 brief-part.md들을 브리프의 `## 현행판 표`와 `## 사본 목록`에 합친다.

python3 -B merge_brief.py <브리프> <brief-part.md>...

절은 줄머리의 `## ` 제목으로만 자르고, 코드 울타리(```, ````) 안의 줄은 제목으로
보지 않는다. 지시 블록이 글 가운데 `## 현행판 표`를 적어도 자르지 않는다. 두 절 밖의
글은 그대로 두고, 브리프는 그 자리에서 고쳐 쓴다.
"""

import os
import sys

SECTIONS = ("## 현행판 표", "## 사본 목록")


def split_sections(text):
    """머리(첫 제목 앞의 줄)와 [제목, 본문 줄] 목록으로 나눈다."""
    head, sections, fence = [], [], None
    for line in text.splitlines():
        marker = line.lstrip()[:3]
        if fence is None and marker in ("```", "~~~"):
            fence = line.lstrip()[: len(line.lstrip()) - len(line.lstrip().lstrip(marker[0]))]
        elif fence is not None and line.strip().startswith(fence) and not line.strip().strip(fence[0]):
            fence = None
        elif fence is None and line.startswith("## "):
            sections.append([line, []])
            continue
        (sections[-1][1] if sections else head).append(line)
    return head, sections


def entries(lines):
    """절 본문에서 빈 줄을 뺀 줄."""
    return [line for line in lines if line.strip()]


def merge(brief_text, parts):
    """parts는 (이름, 글) 목록이다. 합친 브리프와, 이름이 같은 표준의 {이름: [(출처, 줄)]}을 낸다."""
    head, sections = split_sections(brief_text)
    merged, origin = {}, {}
    for title in SECTIONS:
        own = [lines for t, lines in sections if t == title]
        if not own:
            sections.append([title, []])
        merged[title] = entries(own[0]) if own else []
        origin.update((line, "브리프") for line in merged[title])
    for name, text in parts:
        for title, lines in split_sections(text)[1]:
            if title not in merged:
                continue
            for line in entries(lines):
                if line not in merged[title]:
                    merged[title].append(line)
                if origin.get(line, "브리프") == "브리프":
                    origin[line] = name
    out = head[:]
    for title, lines in sections:
        out.append(title)
        if title in merged:
            out += ["", *merged[title], ""]
        else:
            out += lines
    return "\n".join(out).rstrip("\n") + "\n", same_names(merged[SECTIONS[0]], origin)


def same_names(table, origin):
    """표의 머리 줄과 구분 줄을 빼고, 첫 칸이 같은데 줄이 다른 것을 모은다."""
    rows = {}
    for line in table:
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if not line.startswith("|") or cells[0] == "이름" or set(cells[0]) <= set(":- "):
            continue
        rows.setdefault(cells[0], []).append((origin[line], line))
    return {name: found for name, found in rows.items() if len(found) > 1}


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
        print(f"이름이 같은 표준 {len(same)}개. 메인 세션이 하나로 정해 브리프의 줄을 고친다.")
        for name, found in same.items():
            print(f"- {name}")
            for source, line in found:
                print(f"  - {source}: {line}")


if __name__ == "__main__":
    main(sys.argv[1:])
