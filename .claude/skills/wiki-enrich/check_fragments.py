"""보강 티켓 초안의 조각을 사본과 대조한다.

python3 -B check_fragments.py [--content <폴더>] [--terms <용어 표기 결정>] <사본 폴더> <티켓 초안>...

조각은 줄 끝에 [`<약칭>` (<위치>) “<인용>”; …] 블록을 단 줄이다. 인용마다 사본
`<사본 폴더>/<약칭>.txt`에서 인용을 찾고, 위치의 쪽이나 절 번호가 그 자리를 담는지 본다.
글은 NFKC, 공백 하나, 소문자로 견주고, …나 ...로 끊은 인용은 조각이 차례로 있으면 된다.

- 쪽: `n쪽`은 그 번호만 적힌 줄(쪽 번호)이 있는 쪽, 없으면 n번째 쪽이다. `PDF n쪽`은
  n번째 쪽이다. 쪽은 폼 피드(pdftotext의 쪽 경계)로 센다.
- 절: 줄머리의 번호(`3.3`, `B.2`, `Annex B`)가 제목이다. 절은 다음 같은 층이나 윗층의
  번호(3.3이면 3.4, 4)나 다른 Annex 제목에서 끝난다. 숫자 하나만 있는 줄(쪽 번호)과
  점 지시선으로 끝나는 줄(목차)은 제목으로 보지 않는다.
- 위치가 여럿이면 하나만 인용을 담으면 된다. 쪽도 절 번호도 없는 위치(`Overview`)는
  인용이 사본에 있는지만 본다.

조각 글의 약어 풀이(`<약어>(<풀이>)`, `<이름>(<약어>: <풀이>)`)는 줄의 인용 안에
있는지(대소문자, 공백, 기호 무시) 보고, `content/`의 같은 약어 풀이와 글자가 다르면 알린다.
용어 표기 결정에 풀이 결정이 있는 약어는 그 결정과만 견주고, `풀이: 통일하지 않음`인
약어는 `content/`와 견주지 않는다.

알림을 한 줄씩 `<초안>:<줄>: …`로 내고, 알림이 있으면 1로 끝난다.
"""

import argparse
import os
import re
import sys
import unicodedata

OPEN_QUOTE, CLOSE_QUOTE = "“", "”"


def normalize(text):
    """대조용 글. NFKC, 따옴표 통일, 공백 하나, 소문자."""
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("‘", "'").replace("’", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", text).strip().lower()


def split_top(text, separator):
    """괄호와 “” 밖의 separator로 나눈다."""
    parts, depth, quoted, start = [], 0, 0, 0
    for index, char in enumerate(text):
        if char == OPEN_QUOTE:
            quoted += 1
        elif char == CLOSE_QUOTE:
            quoted = max(quoted - 1, 0)
        elif not quoted and char == "(":
            depth += 1
        elif not quoted and char == ")":
            depth = max(depth - 1, 0)
        elif not quoted and depth == 0 and char == separator:
            parts.append(text[start:index])
            start = index + 1
    parts.append(text[start:])
    return parts


def parse_citation(item):
    """`<약칭>` (<위치>) “<인용>” 하나를 읽는다. 약칭이 없으면 None."""
    match = re.match(r"\s*`([^`]+)`", item)
    if not match:
        return None
    rest = item[match.end() :]
    location, quotes, depth, start, quoted, opened = None, [], 0, None, 0, None
    for index, char in enumerate(rest):
        if char == OPEN_QUOTE:
            quoted += 1
            opened = index + 1 if quoted == 1 else opened
        elif quoted and char == CLOSE_QUOTE:
            quoted -= 1
            if not quoted:
                quotes.append(rest[opened:index])
        elif quoted:
            continue
        elif char == "(":
            if depth == 0 and location is None:
                start = index + 1
            depth += 1
        elif char == ")" and depth:
            depth -= 1
            if depth == 0 and location is None:
                location = rest[start:index]
    return {"abbreviation": match.group(1), "location": location or "", "quotes": quotes}


def quotes_in(text):
    """글의 바깥 “” 인용. 안에 겹친 “”는 바깥 인용의 일부다."""
    quotes, depth, opened = [], 0, None
    for index, char in enumerate(text):
        if char == OPEN_QUOTE:
            depth += 1
            opened = index + 1 if depth == 1 else opened
        elif depth and char == CLOSE_QUOTE:
            depth -= 1
            if not depth:
                quotes.append(text[opened:index])
    return quotes


def citation_block(line):
    """줄 끝의 인용 블록과 그 앞의 글. 블록이 없으면 None."""
    stripped = line.rstrip()
    if not stripped.endswith("]"):
        return None
    for index in [m.start() for m in re.finditer(r"\[`", stripped)][::-1]:
        items = [parse_citation(item) for item in split_top(stripped[index + 1 : -1], ";")]
        if items and all(items):
            return stripped[:index], items
    return None


def citation_blocks(line):
    """줄 끝에 이어 단 인용 블록들의 인용과 그 앞의 조각 글. 블록이 없으면 None."""
    text, citations = line, []
    while True:
        block = citation_block(text)
        if not block:
            break
        text, items = block
        citations = items + citations
    return (text, citations) if citations else None


def fragments(path):
    """초안의 (줄 번호, 조각 글, 인용 목록, 줄의 모든 인용 글)."""
    with open(path, encoding="utf-8") as f:
        for number, line in enumerate(f, 1):
            block = citation_blocks(line)
            if block:
                yield number, block[0], block[1], quotes_in(line)


class Copy:
    """사본 하나. 대조용 글(flat)과, 줄마다 flat에서의 시작 자리, 글, 쪽(폼 피드로 센다)."""

    def __init__(self, text):
        self.lines, offset, page = [], 0, 1
        for raw in text.split("\n"):
            for index, segment in enumerate(raw.split("\f")):
                page += 1 if index else 0
                line = normalize(segment)
                if line:
                    self.lines.append((offset, line, page))
                    offset += len(line) + 1
        self.flat = " ".join(line for _, line, _ in self.lines)
        self.headings = [(index, heading(line)) for index, (_, line, _) in enumerate(self.lines) if heading(line)]

    def find(self, quote):
        """인용이 시작하는 자리들. …나 ...로 끊은 인용은 조각이 차례로 있어야 한다."""
        parts = [normalize(part) for part in re.split(r"\.\.\.|…", quote) if normalize(part)]
        starts = []
        for match in re.finditer(re.escape(parts[0]) if parts else r"(?!)", self.flat):
            position = match.end()
            for part in parts[1:]:
                position = self.flat.find(part, position)
                if position < 0:
                    break
                position += len(part)
            else:
                starts.append(match.start())
        return starts

    def end(self, index):
        """index번째 줄 뒤 글의 끝 자리."""
        return self.lines[index][0] if index < len(self.lines) else len(self.flat)

    def section_spans(self, section):
        """절 제목 줄마다 그 절이 끝나는 곳까지의 (시작, 끝)."""
        spans = []
        for order, (index, found) in enumerate(self.headings):
            if found != section:
                continue
            ends = [after for after, other in self.headings[order + 1 :] if ends_section(section, other)]
            spans.append((self.lines[index][0], self.end(ends[0]) if ends else len(self.flat)))
        return spans

    def page_spans(self, number, printed):
        """쪽의 (시작, 끝). 인쇄된 쪽은 쪽 번호 줄이 있는 쪽, 없으면 n번째 쪽이다."""
        pages = {page for _, line, page in self.lines if printed and PAGE_NUMBER.fullmatch(line) and int(PAGE_NUMBER.fullmatch(line).group(1)) == number}
        pages = pages or {number}
        spans = []
        for page in pages:
            indexes = [index for index, (_, _, p) in enumerate(self.lines) if p == page]
            if indexes:
                spans.append((self.lines[indexes[0]][0], self.end(indexes[-1] + 1)))
        return spans


ANNEX = re.compile(r"(?:annex|appendix|부속서)\s+([a-z0-9]+(?:\.\d+)*)(?=$|[\s.,:)])")
NUMBER = re.compile(r"([a-z](?:\.\d+)+|\d+(?:\.\d+)*)(?=$|[\s.,:)])")
PAGE = re.compile(r"(pdf\s*)?(\d+)(?:\s*(?:–|-|\\?~)\s*(\d+))?\s*쪽")
TOC = re.compile(r"(?:\.\s*){4,}\d+$|…+\s*\d+$")
PAGE_NUMBER = re.compile(r"(?:page\s+)?-?\s*(\d+)\s*-?(?:\s+of\s+\d+)?")


def heading(line):
    """줄머리의 절 번호. 숫자 하나만 있는 줄은 쪽 번호일 수 있고, 점 지시선으로 끝나는 줄은
    목차라 절로 보지 않는다."""
    if TOC.search(line):
        return None
    match = ANNEX.match(line)
    if match:
        return ("annex", match.group(1))
    match = NUMBER.match(line)
    if match and not (line.strip(" .") == match.group(1) and match.group(1).isdigit()):
        return ("number", match.group(1))
    return None


def successors(name):
    """번호 절 다음에 올 수 있는 같은 층이나 윗층의 절 번호."""
    parts, result = name.split("."), set()
    for depth in range(len(parts), 0, -1):
        last = parts[depth - 1]
        if last.isdigit():
            following = str(int(last) + 1)
        elif len(last) == 1 and last.isalpha():
            following = chr(ord(last) + 1)
        else:
            continue
        result.add(".".join(parts[: depth - 1] + [following]))
    return result


def ends_section(section, other):
    """other 제목이 section을 끝내는가."""
    kind, name = section
    if other[0] == "annex":
        return other != section
    return kind == "number" and other[1] in successors(name)


def locations(location):
    """위치 글에서 절과 쪽. 쉼표로 나눈 부분마다 머리의 것 하나를 읽는다."""
    result = []
    for part in split_top(normalize(location), ","):
        part = part.strip()
        page = PAGE.match(part)
        if page:
            first = int(page.group(2))
            result += [("page", number, not page.group(1)) for number in range(first, int(page.group(3) or first) + 1)]
            continue
        section = heading(part)
        if section:
            result.append(section)
    return result


WIKILINK = re.compile(r"\[\[([^|\]]*)(?:\|([^\]]*))?\]\]")
EXPANSION = re.compile(r"(?<![A-Za-z0-9])([A-Za-z0-9][A-Za-z0-9/&.+-]*)\(([^()]*)\)")


def expansions(text):
    """글의 `<약어>(<풀이>)`와 `<이름>(<약어>: <풀이>)`. 약어는 대문자가 둘 이상이고, 풀이는
    한글 없이 글자로 시작한다. 위키링크 하나뿐이거나 약어 자신이 든 괄호는 풀이가 아니다."""
    for match in EXPANSION.finditer(text):
        abbreviation, expansion = match.group(1), match.group(2).strip()
        inner = re.fullmatch(r"([A-Za-z0-9][A-Za-z0-9/&.+-]*):\s+(.+)", expansion)
        if inner:
            abbreviation, expansion = inner.groups()
        if WIKILINK.fullmatch(expansion) or re.search(rf"(?<![A-Za-z0-9]){re.escape(abbreviation)}(?![A-Za-z0-9])", expansion):
            continue
        expansion = WIKILINK.sub(lambda link: link.group(2) or link.group(1), expansion)
        if (
            sum(char.isupper() for char in abbreviation) >= 2
            and re.match(r"[A-Za-z]", expansion)
            and not re.search(r"[가-힣]", expansion)
            and len(expansion) > len(abbreviation)
        ):
            yield abbreviation, re.sub(r"\s+", " ", expansion)


def letters(text):
    """견줄 글자. 소문자로, 글자와 숫자만."""
    return re.sub(r"[^0-9a-z]", "", normalize(text))


def content_expansions(folder):
    """content/의 약어마다 {풀이: [파일]}."""
    result = {}
    for root, _, files in os.walk(folder):
        for name in sorted(files):
            if name.endswith(".md"):
                path = os.path.join(root, name)
                with open(path, encoding="utf-8") as f:
                    for abbreviation, expansion in expansions(f.read()):
                        paths = result.setdefault(abbreviation, {}).setdefault(expansion, [])
                        if os.path.relpath(path) not in paths:
                            paths.append(os.path.relpath(path))
    return result


def term_decisions(path):
    """용어 표기 결정의 약어 풀이. ({약어: 풀이}, 풀이를 통일하지 않는 약어)."""
    decided, open_ = {}, set()
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for line in f:
                match = re.match(r"- (.+?) 풀이(?: (.+?))?: ", line)
                if match and match.group(2):
                    decided[match.group(1)] = match.group(2)
                elif match:
                    open_.add(match.group(1))
    return decided, open_


def check(copies, drafts, content, terms):
    findings = []
    cache = {}
    existing = content_expansions(content)
    decided, open_ = term_decisions(terms)
    for draft in drafts:
        for number, text, citations, line_quotes in fragments(draft):
            quoted = " ".join(letters(quote) for quote in line_quotes)
            for abbreviation, expansion in expansions(text):
                label = f"{draft}:{number}: {abbreviation}({expansion})"
                if abbreviation in decided:
                    if expansion != decided[abbreviation]:
                        findings.append(f"{label}: 용어 표기 결정의 풀이와 다르다: {decided[abbreviation]}")
                    continue
                if letters(expansion) not in quoted:
                    findings.append(f"{label}: 풀이가 인용에 없다")
                known = {} if abbreviation in open_ else existing.get(abbreviation, {})
                if known and expansion not in known:
                    others = "; ".join(f"{other} ({', '.join(paths)})" for other, paths in sorted(known.items()))
                    findings.append(f"{label}: content/의 풀이와 다르다: {others}")
            for citation in citations:
                abbreviation = citation["abbreviation"]
                where = f"{draft}:{number}: `{abbreviation}` ({citation['location']})"
                if abbreviation not in cache:
                    path = os.path.join(copies, f"{abbreviation}.txt")
                    cache[abbreviation] = None
                    if os.path.exists(path):
                        with open(path, encoding="utf-8") as f:
                            cache[abbreviation] = Copy(f.read())
                copy = cache[abbreviation]
                if copy is None:
                    findings.append(f"{where}: 사본 {abbreviation}.txt가 없다")
                    continue
                places, spans = locations(citation["location"]), []
                for place in places:
                    spans += copy.page_spans(place[1], place[2]) if place[0] == "page" else copy.section_spans(place)
                for quote in citation["quotes"]:
                    starts = copy.find(quote)
                    if not starts:
                        findings.append(f"{where}: 인용이 사본에 없다 “{quote}”")
                    elif places and not spans:
                        findings.append(f"{where}: 위치의 절이나 쪽을 사본에서 찾지 못했다 “{quote}”")
                    elif spans and not any(a <= start < b for start in starts for a, b in spans):
                        findings.append(f"{where}: 인용이 위치 밖에 있다 “{quote}”")
    return findings


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--content", default="content")
    parser.add_argument("--terms", default="docs/wiki-terms.md")
    parser.add_argument("copies")
    parser.add_argument("drafts", nargs="+")
    args = parser.parse_args()
    findings = check(args.copies, args.drafts, args.content, args.terms)
    for finding in findings:
        print(finding)
    print(f"알림 {len(findings)}건")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
