"""보강 티켓 초안의 조각을 사본과 대조한다.

python3 -B check_fragments.py [--content <폴더>] [--terms <용어 표기 결정>] <사본 폴더> <티켓 초안>...

조각은 줄 끝에 [`<약칭>` (<위치>) “<인용>”; …] 블록을 단 줄이다. 인용마다 사본
`<사본 폴더>/<약칭>.txt`에서 인용을 찾고, 위치의 쪽이나 절 번호가 그 자리를 담는지 본다.
글은 NFKC, 공백 하나, 소문자로 견주고, …나 ...로 끊은 인용은 조각이 차례로 있으면 된다.

- 쪽: 쪽은 폼 피드(pdftotext의 쪽 경계)로 센다. `n쪽`은 인쇄된 쪽 번호가 n인 쪽이다. 쪽마다
  처음과 끝 다섯 줄의 번호만 적힌 줄로 인쇄된 번호와 몇 번째 쪽인지의 차이를 정하고(여러 쪽이
  같은 차이를 보일 때만), 차이가 없으면 n번째 쪽이다. 표 칸이나 비트 번호처럼 숫자만 있는 본문
  줄은 쪽 번호로 치지 않는다. `PDF n쪽`은 n번째 쪽이다. `n–m쪽`은 그 사이 쪽 모두다.
- 절: 줄머리의 번호(`3.3`, `B.2`, `Annex B`)가 제목 후보다. 번호 뒤 첫 낱말이 단위(`3.3 V`)인
  줄, 숫자 하나 뒤가 대문자나 한글로 시작하지 않는 줄(`8 channels`), 숫자 하나만 있는
  줄(쪽 번호), 점 지시선으로 끝나는 줄(목차)은 후보가 아니다. 번호 후보 가운데 번호가 글 차례대로
  줄지 않는 가장 무거운 열(글이 붙은 줄 4, 번호만 있는 줄 1)만 제목으로 쓰고, 그 열을 벗어난
  줄(장 안의 번호 목록 `6. Repeat …`, 표 값 `5.5`)은 버린다. 절은 다음 제목 가운데 그 절 안이
  아닌 번호 제목(3.3이면 3.4, 4)이나 다른 Annex 제목에서 끝난다.
- 위치 글은 쉼표나 쌍반점으로 나눈 부분마다 머리의 절 번호(`§3.2`, `2절 …`, `19장 …`, `1(Scope)`, `B3.5`)와
  어디든 있는 쪽(`인쇄 22쪽(PDF 42쪽)`, `Definitions(2쪽)`, `p.4`)을 읽는다. 위치가 여럿이면
  하나만 인용을 담으면 된다. 쪽도 절 번호도 없는 위치(`Overview`, `Table 3`, `Art. 3(5)`)는 인용이
  사본에 있는지만 보고, `§`, `절`, `장`, `쪽`이 있는데 읽지 못한 부분(`제2절`)은 알린다.

조각 글의 약어 풀이(`<약어>(<풀이>)`, `[[<슬러그>|<약어>]](<풀이>)`, `**<약어>**(<풀이>)`, `<이름>(<약어>: <풀이>)`,
`<풀이>(<약어>)`, `**<풀이>**(<약어>)`)는 그 낱말들이 줄의 인용
하나에 이어서 있는지(대소문자, 기호, 영어 복수 꼴 무시) 보고, `content/`의 같은 약어 풀이와 글자가
다르면 알린다. 용어 표기 결정에 풀이 결정이 있는 약어(`CAN CC`처럼 앞 낱말을 붙인 것
포함)는 그 결정과만 견주고, `풀이: 통일하지 않음`인 약어는 `content/`와 견주지 않는다.

알림을 한 줄씩 `<초안>:<줄>: …`로 내고, 알림이 있으면 1로 끝난다.
"""

import argparse
import os
import re
import sys
import unicodedata

OPEN_QUOTE, CLOSE_QUOTE = "“", "”"
UNITS = set("V mV kV A mA µA W mW Hz kHz MHz GHz s ms µs us ns ps bps kbps Mbps Gbps kbit/s Mbit/s Gbit/s B KB kB MB GB bit bits byte bytes Ω kΩ °C K % m mm cm km g kg".split())

ANNEX = re.compile(r"(?:annex|appendix|부속서)\s+([a-z0-9]+(?:\.\d+)*)(?=$|[\s.,:)])", re.I)
SECTION_NUMBER = r"[A-Z]\d*(?:\.\d+)+|\d+(?:\.\d+)*"
NUMBER = re.compile(rf"({SECTION_NUMBER})(?=$|[\s.,:)])")
CITED_NUMBER = re.compile(rf"§?\s*({SECTION_NUMBER})(?:\s*[절장])?(?=$|[\s.,:)]|\([^\W\d_]{{2}})")
PAGE = re.compile(r"(?<![\d.])(pdf\s*)?(\d+)(?:\s*(?:–|-|\\?~)\s*(\d+))?\s*쪽|(?<![a-z])()pp?\.\s*(\d+)(?:\s*(?:–|-|\\?~)\s*(\d+))?")
LOCATION_LIKE = re.compile(r"§|\d\s*[절장쪽]")
TOC = re.compile(r"(?:\.\s*){4,}\d+$|…+\s*\d+$")
PAGE_NUMBER = re.compile(r"(?:page\s+)?-?\s*(\d+)\s*-?(?:\s+of\s+\d+)?")
EDGE = 5
TITLED, BARE = 4, 1
WIKILINK = re.compile(r"\[\[([^|\]]*)(?:\|([^\]]*))?\]\]")
ABBREVIATION = r"[A-Za-z0-9][A-Za-z0-9/&.+-]*"
EXPANSION = re.compile(rf"(?<![A-Za-z0-9])({ABBREVIATION})(?:\]\]|\*\*)?\(([^()]*)\)")
REVERSE = re.compile(rf"(?<![A-Za-z0-9'/-])((?:[A-Za-z0-9][A-Za-z0-9'/-]* )*[A-Za-z0-9][A-Za-z0-9'/-]*) ?\(({ABBREVIATION})\)")
BOLD_REVERSE = re.compile(rf"\*\*([^*\n]+)\*\* ?\(({ABBREVIATION})\)")


def clean(text):
    """NFKC, 따옴표 통일, 공백 하나."""
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("‘", "'").replace("’", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", text).strip()


def normalize(text):
    """대조용 글. clean에 소문자."""
    return clean(text).lower()


def words(text):
    """견줄 낱말. 소문자로, 글자와 숫자만."""
    return re.findall(r"[0-9a-z]+", normalize(text))


def scan(text):
    """글자마다 (자리, 글자, “” 안인가). 겹친 “”도 센다. 따옴표 자신은 안으로 친다."""
    depth = 0
    for index, char in enumerate(text):
        if char == OPEN_QUOTE:
            depth += 1
            yield index, char, True
        elif char == CLOSE_QUOTE and depth:
            depth -= 1
            yield index, char, True
        else:
            yield index, char, depth > 0


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


def split_top(text, separator):
    """괄호와 “” 밖의 separator로 나눈다."""
    parts, depth, start = [], 0, 0
    for index, char, quoted in scan(text):
        if quoted:
            continue
        if char == "(":
            depth += 1
        elif char == ")":
            depth = max(depth - 1, 0)
        elif depth == 0 and char == separator:
            parts.append(text[start:index])
            start = index + 1
    parts.append(text[start:])
    return parts


def parse_citation(item):
    """`<약칭>` (<위치>) “<인용>” 하나를 읽는다. 위치는 “” 밖의 첫 괄호다. 약칭이 없으면 None."""
    match = re.match(r"\s*`([^`]+)`", item)
    if not match:
        return None
    rest = item[match.end() :]
    location, depth, start = "", 0, None
    for index, char, quoted in scan(rest):
        if quoted:
            continue
        if char == "(":
            start = index + 1 if depth == 0 else start
            depth += 1
        elif char == ")" and depth:
            depth -= 1
            if depth == 0:
                location = rest[start:index]
                break
    return {"abbreviation": match.group(1), "location": location, "quotes": quotes_in(rest)}


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


def heading(line):
    """줄머리의 절. ("annex"|"number", 소문자 이름) 또는 None. 모듈 머리 설명의 절 줄을 따른다."""
    if TOC.search(line):
        return None
    match = ANNEX.match(line)
    if match:
        return ("annex", match.group(1).lower())
    match = NUMBER.match(line)
    if not match:
        return None
    rest = line[match.end() :].lstrip(" .:)")
    if not rest:
        return None if match.group(1).isdigit() else ("number", match.group(1).lower())
    first = rest.split()[0]
    if first in UNITS or (match.group(1).isdigit() and not (first[0].isupper() or "가" <= first[0] <= "힣")):
        return None
    return ("number", match.group(1).lower())


def cited_section(part):
    """위치 글 한 부분의 머리에 있는 절. 숫자 하나(`5`)도 장 번호로 읽는다. `§`와 `절`, `장`은 뗀다."""
    match = ANNEX.match(part)
    if match:
        return ("annex", match.group(1).lower())
    match = CITED_NUMBER.match(part)
    return ("number", match.group(1).lower()) if match else None


def outline_key(name):
    """번호 절의 차례. 숫자 층은 글자 층(`B.2`, `B3.5`)보다 앞이다."""
    return tuple((0, int(part), "") if part.isdigit() else (1, part[0], int(part[1:] or -1)) for part in name.split("."))


def outline(entries):
    """번호 제목 (차례, 무게) 가운데 차례가 줄지 않는 가장 무거운 열의 자리들. 본문의 제목은
    차례대로 늘고, 표 값이나 번호 목록 줄은 그 차례를 벗어나 빠진다."""
    ranks = {key: rank for rank, key in enumerate(sorted({key for key, _ in entries}), 1)}
    tree, best = [(0, -1)] * (len(ranks) + 1), []
    for index, (key, weight) in enumerate(entries):
        rank, before = ranks[key], (0, -1)
        while rank:
            before, rank = max(before, tree[rank]), rank & (rank - 1)
        best.append((before[0] + weight, before[1]))
        rank = ranks[key]
        while rank < len(tree):
            tree[rank], rank = max(tree[rank], (best[index][0], index)), rank + (rank & -rank)
    chosen, index = set(), max(range(len(best)), key=lambda i: best[i][0], default=-1)
    while index >= 0:
        chosen.add(index)
        index = best[index][1]
    return chosen


def inside(section, other):
    """other 제목이 번호 절 section 자신이나 그 아래 층인가."""
    return other[0] == "number" and (other[1] == section[1] or other[1].startswith(section[1] + "."))


def locations(location):
    """위치 글에서 절과 쪽. 쉼표나 쌍반점으로 나눈 부분마다 머리의 절과 어디든 있는 쪽을 읽는다. 쪽은
    ("page", n, 인쇄된 쪽인가)."""
    return [place for part in location_parts(location) for place in part[1]]


def location_parts(location):
    """위치 글의 부분마다 (글, 읽은 절과 쪽)."""
    result = []
    for part in [piece for chunk in split_top(clean(location), ";") for piece in split_top(chunk, ",")]:
        part, places = part.strip(), []
        section = cited_section(part)
        if section:
            places.append(section)
        for page in PAGE.finditer(part.lower()):
            first, last = int(page.group(2) or page.group(5)), page.group(3) or page.group(6)
            places += [("page", number, not page.group(1)) for number in range(first, int(last or first) + 1)]
        result.append((part, places))
    return result


def unread(location):
    """절이나 쪽처럼 보이는데 읽지 못한 위치 부분들."""
    return [part for part, places in location_parts(location) if not places and LOCATION_LIKE.search(part)]


def page_offsets(lines):
    """인쇄된 쪽 번호와 몇 번째 쪽인지의 차이들. 쪽마다 처음과 끝 EDGE줄 가운데 번호만 적힌
    줄이 차이 하나에 한 표를 내고, 두 표 이상이면서 가장 많은 표의 절반 이상을 받은 차이를
    쓴다. 표 칸이나 비트 번호처럼 숫자만 있는 본문 줄은 쪽마다 차이가 달라 표가 모이지 않는다."""
    pages, votes = {}, {}
    for _, line, page in lines:
        pages.setdefault(page, []).append(line)
    for page, texts in pages.items():
        for offset in {page - int(match.group(1)) for line in texts[:EDGE] + texts[-EDGE:] if (match := PAGE_NUMBER.fullmatch(line))}:
            votes[offset] = votes.get(offset, 0) + 1
    top = max(votes.values(), default=0)
    return {offset for offset, count in votes.items() if count >= 2 and 2 * count >= top}


class SourceCopy:
    """사본 하나. 대조용 글(flat)과, 줄마다 flat에서의 시작 자리, 대조용 글, 쪽(폼 피드로 센다)."""

    def __init__(self, text):
        self.lines, headings, offset, page = [], [], 0, 1
        for raw in text.split("\n"):
            for index, segment in enumerate(raw.split("\f")):
                page += 1 if index else 0
                line = clean(segment)
                if line:
                    found = heading(line)
                    if found:
                        titled = re.search(r"[^\W\d_]", line[len(found[1]) :]) is not None
                        headings.append((len(self.lines), found, TITLED if titled else BARE))
                    self.lines.append((offset, line.lower(), page))
                    offset += len(line) + 1
        self.flat = " ".join(line for _, line, _ in self.lines)
        numbered = [order for order, (_, found, _) in enumerate(headings) if found[0] == "number"]
        chosen = {numbered[i] for i in outline([(outline_key(headings[o][1][1]), headings[o][2]) for o in numbered])}
        self.headings = [(index, found, found[0] == "annex" or order in chosen) for order, (index, found, _) in enumerate(headings)]
        self.offsets = page_offsets(self.lines)

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
        """index번째 줄이 시작하는 자리. 줄이 없으면 글의 끝."""
        return self.lines[index][0] if index < len(self.lines) else len(self.flat)

    def section_spans(self, section):
        """절 제목 줄마다 그 절이 끝나는 곳까지의 (시작, 끝). 제목은 차례가 맞는 것만 쓴다. 절은
        다음 제목 가운데 그 절 안이 아닌 번호 제목이나 다른 Annex 제목에서 끝난다."""
        spans = []
        for order, (_, found, kept) in enumerate(self.headings):
            if found != section or not kept:
                continue
            ends = [
                after
                for after, other, kept in self.headings[order + 1 :]
                if kept and (other[0] == "annex" and other != section or section[0] == "number" and not inside(section, other))
            ]
            spans.append((self.lines[self.headings[order][0]][0], self.end(ends[0]) if ends else len(self.flat)))
        return spans

    def page_spans(self, number, printed):
        """쪽의 (시작, 끝). 인쇄된 쪽은 사본의 쪽 번호 차이(page_offsets)만큼 옮긴 쪽, 차이가
        없으면 n번째 쪽이다."""
        spans = []
        for page in {number + offset for offset in self.offsets} if printed and self.offsets else {number}:
            indexes = [index for index, (_, _, p) in enumerate(self.lines) if p == page]
            if indexes:
                spans.append((self.lines[indexes[0]][0], self.end(indexes[-1] + 1)))
        return spans

    def spans(self, location):
        """위치의 절과 쪽이 담는 (시작, 끝)들."""
        result = []
        for place in locations(location):
            result += self.page_spans(place[1], place[2]) if place[0] == "page" else self.section_spans(place)
        return result


def expansions(text):
    """글의 (약어, 풀이, 앞 낱말). `<약어>(<풀이>)`, `[[<슬러그>|<약어>]](<풀이>)`, 머리말의 `**<약어>**(<풀이>)`,
    `<이름>(<약어>: <풀이>)`, `<풀이>(<약어>)`, 머리말의 `**<풀이>**(<약어>)`를 읽는다. 약어는 대문자가 둘 이상이고, 풀이는 한글 없이 글자로
    시작한다. 풀이 뒤에 쉼표로 붙인 한글 덧말(`, IOMMU라고도 부름`)은 뗀다. 위키링크 하나뿐이거나 약어 자신이 든
    괄호는 풀이가 아니다. 앞 낱말은 `CAN CC`처럼 여러 낱말인 약어를 찾는 데 쓴다."""
    yield from reverse_expansions(text)
    for match in EXPANSION.finditer(text):
        abbreviation, expansion = match.group(1), match.group(2).strip()
        head = expansion.split(",")[0].strip()
        if re.search(r"[가-힣]", expansion) and not re.search(r"[가-힣]", head):
            expansion = head
        before = re.search(rf"({ABBREVIATION}) $", text[: match.start()])
        inner = re.fullmatch(rf"({ABBREVIATION}):\s+(.+)", expansion)
        if inner:
            (abbreviation, expansion), before = inner.groups(), None
        if WIKILINK.fullmatch(expansion) or re.search(rf"(?<![A-Za-z0-9]){re.escape(abbreviation)}(?![A-Za-z0-9])", expansion):
            continue
        expansion = re.sub(r"\s+", " ", WIKILINK.sub(lambda link: link.group(2) or link.group(1), expansion))
        if (
            sum(char.isupper() for char in abbreviation) >= 2
            and re.match(r"[A-Za-z]", expansion)
            and not re.search(r"[가-힣]", expansion)
            and len(expansion) > len(abbreviation)
        ):
            yield abbreviation, expansion, before.group(1) if before else ""


def initials_match(units, letters):
    """낱말 조각들의 머리글자에 letters가 차례로 들어 있고, 첫 조각과 끝 조각이 letters의 처음과 끝인가.
    `Department of Transportation`(DOT), `ECU State Manager`(EcuM)가 맞는다."""
    initials = iter(unit[0] for unit in units)
    return units[0][0] == letters[0] and units[-1][0] == letters[-1] and all(letter in initials for letter in letters)


def reverse_expansions(text):
    """`<풀이>(<약어>)` 꼴. 괄호 앞 영어 낱말 가운데 머리글자가 약어의 대문자(모두 대문자면 글자)와 맞는
    (initials_match) 가장 짧은 끝 열을 풀이로 읽는다. 맞는 열이 없으면 풀이가 아니다. 머리말의
    `**<풀이>**(<약어>)`는 굵은 글자가 풀이의 범위라 머리글자를 보지 않는다(`**Basic Software Scheduler**(SchM)`)."""
    for match in BOLD_REVERSE.finditer(text):
        abbreviation, expansion = match.group(2), match.group(1).strip()
        if (
            sum(char.isupper() for char in abbreviation) >= 2
            and re.match(r"[A-Za-z]", expansion)
            and not re.search(r"[가-힣]", expansion)
            and len(expansion) > len(abbreviation)
        ):
            yield abbreviation, expansion, ""
    for match in REVERSE.finditer(text):
        abbreviation = match.group(2)
        if sum(char.isupper() for char in abbreviation) < 2:
            continue
        upper = [char.lower() for char in abbreviation if char.isupper()]
        letters = upper if any(char.islower() for char in abbreviation) else [char.lower() for char in abbreviation if char.isalpha()]
        tokens = match.group(1).split(" ")
        for size in range(1, min(len(tokens), len(letters) + 3) + 1):
            window = tokens[-size:]
            units = [unit.lower() for token in window for unit in re.split(r"[-/]", token) if unit]
            if units and initials_match(units, letters) and len(" ".join(window)) > len(abbreviation):
                yield abbreviation, " ".join(window), ""
                break


def same_word(wanted, word):
    """같은 낱말인가. 영어 복수 꼴(-s, -es)도 같게 본다."""
    return word in (wanted, wanted + "s", wanted + "es")


def in_quote(expansion, quotes):
    """풀이의 낱말들이 인용 하나에 이어서 있는가."""
    wanted = words(expansion)
    for quote in quotes:
        have = words(quote)
        for start in range(len(have) - len(wanted) + 1):
            if all(same_word(w, h) for w, h in zip(wanted, have[start : start + len(wanted)])):
                return True
    return False


def content_expansions(folder):
    """content/의 약어마다 {풀이: [파일]}."""
    result = {}
    for root, _, files in os.walk(folder):
        for name in sorted(files):
            if name.endswith(".md"):
                path = os.path.join(root, name)
                with open(path, encoding="utf-8") as f:
                    for abbreviation, expansion, _ in expansions(f.read()):
                        paths = result.setdefault(abbreviation, {}).setdefault(expansion, [])
                        if os.path.relpath(path) not in paths:
                            paths.append(os.path.relpath(path))
    return result


def term_decisions(path):
    """용어 표기 결정의 약어 풀이. ({약어: 풀이}, 풀이를 통일하지 않는 약어)."""
    decided, undecided = {}, set()
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for line in f:
                match = re.match(r"- (.+?) 풀이(?: (.+?))?: ", line)
                if match and match.group(2):
                    decided[match.group(1)] = match.group(2)
                elif match:
                    undecided.add(match.group(1))
    return decided, undecided


def check(copies, drafts, content, terms):
    findings, cache = [], {}
    existing = content_expansions(content)
    decided, undecided = term_decisions(terms)
    for draft in drafts:
        for number, text, citations, line_quotes in fragments(draft):
            for abbreviation, expansion, before in expansions(text):
                joined = f"{before} {abbreviation}"
                if joined in decided or joined in undecided:
                    abbreviation = joined
                label = f"{draft}:{number}: {abbreviation}({expansion})"
                if abbreviation in decided:
                    if expansion != decided[abbreviation]:
                        findings.append(f"{label}: 용어 표기 결정의 풀이와 다르다: {decided[abbreviation]}")
                    continue
                if not in_quote(expansion, line_quotes):
                    findings.append(f"{label}: 풀이가 인용에 없다")
                known = {} if abbreviation in undecided else existing.get(abbreviation, {})
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
                            cache[abbreviation] = SourceCopy(f.read())
                copy = cache[abbreviation]
                if copy is None:
                    findings.append(f"{where}: 사본 {abbreviation}.txt가 없다")
                    continue
                for part in unread(citation["location"]):
                    findings.append(f"{where}: 위치를 읽지 못했다: {part}")
                cited, spans = locations(citation["location"]), copy.spans(citation["location"])
                for quote in citation["quotes"]:
                    starts = copy.find(quote)
                    if not starts:
                        findings.append(f"{where}: 인용이 사본에 없다 “{quote}”")
                    elif cited and not spans:
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
