"""세션 기록(jsonl)을 분석 에이전트가 읽을 요약본으로 줄이고, 회고가 분석한 세션을 적는다.

python3 digest.py [--archive <폴더>] <기록.jsonl>...
python3 digest.py [--archive <폴더>] --mark <회고 세션 uuid> <세션 uuid나 실행 id>...
python3 digest.py [--archive <폴더>] --report <에이전트 기록> <세션 uuid> '<첫 줄>'
python3 digest.py [--archive <폴더>] --candidates <이 세션 uuid> [<기록.jsonl>...]
python3 digest.py --version <기록.jsonl>...

보관 폴더(기본 ~/documents/ash-wiki-retro)의 <uuid>/에, 기록마다 <이름>-main.md를,
기록 옆 <uuid>/subagents/의 서브에이전트 기록마다 <이름>-<agent id>.md를 쓴다.
<이름>은 세션 제목과 uuid 앞 8자다. 실행할 때마다 다시 만들고, 지난 요약본만 지우고
report.md는 둔다. 작업 중 대기열로 온 메시지(서브에이전트 반환, 세션 간 메시지,
소유자 글)는 사용자 글처럼 전문으로 쓰고 "(대기열, <출처>)"를 단다. 완료 알림은 쓰지
않고, 뒤이어 user 줄로 차례대로 다시 온 메시지는 한 번만 쓴다.

--mark는 보관 폴더의 analyzed.tsv에 세션 uuid, 회고 세션 uuid, 날짜를 한 줄씩
더한다. 루틴 실행은 세션 uuid 대신 실행 id(cse_…)를 받는다. 이미 있는 것은 더하지
않는다. 회고는 이 목록에 없는 세션과 루틴 실행을 분석한다.

--report는 에이전트 기록의 마지막 SubagentHandback 메시지(없으면 마지막 어시스턴트
글)를 첫 줄 아래에 붙여 <uuid>/report.md에 쓴다. 반환이 없거나 uuid가 아니면 쓰지
않고 실패한다. 반환의 첫 비지 않은 줄이 제목(#)이 아니고, 첫 줄과 같거나 첫 줄의 첫
#N을 담으면 그 줄을 떼고 저장하고, 뗀 줄을 찍는다. 반환이 첫 줄을 제 문구로 다시 쓰면
첫 줄이 두 번 들어가기 때문이다.

--candidates는 위키 스킬을 부르거나 RemoteTrigger로 루틴에 넘긴 세션 가운데
analyzed.tsv에 없고 이 세션도 아닌 것을 찾아, 세션마다 uuid, 스킬, 시작일(첫
timestamp), 제목, URL, 핸드오프를 한 줄씩 찍는다. URL은 기록에서 gh pr/issue
create·comment가 돌려준 PR·이슈·코멘트이고, 핸드오프는 세션이 쓰거나 고친
ash-wiki-handoff/의 파일이다. 루틴에 넘긴 스킬에는 "(루틴)"을 단다. 기록을 주지
않으면 ~/.claude/projects/*ash-wiki*/의 기록을 본다.

--version은 기록마다 세션 버전을 찍는다. 버전은 worktree base(git worktree add 결과의 "HEAD is now at"),
없으면 기록의 첫 timestamp 때의 origin/main이다. 기록의 스킬 본문이 그 버전의 SKILL.md와
다르면 origin/main 역사에서 본문이 같은 커밋으로 고친다. 저장소 루트에서 돌린다.

소스 노트를 연 도구 호출은 입력과 결과를 지우고, 그 입력을 <이름>-notes.txt에
모은다. 입력에 노트 디렉터리(ASH_WIKI_NOTES의 값, ~나 $HOME으로 쓴 꼴 포함)나 그
변수의 참조($ASH_WIKI_NOTES, ${ASH_WIKI_NOTES)가 있거나, 결과에 노트 디렉터리가
나오는 호출이다. 지운 결과가 너무 커서 tool-results/ 파일로 저장됐으면, 그 파일을
다시 읽은 호출도 지운다. 변수 이름만 적은 호출("ASH_WIKI_NOTES는 열지 않는다")은
노트를 연 것으로 보지 않는다. 노트 디렉터리가 나오는 사용자 글과 대기열 메시지도 지운다.
파일마다 지운 수를 출력한다. 0이 아니면 노트를 열었을 수 있는 기록이다. 끝 줄에
지운 수가 0이 아닌 기록의 수와 이름을 찍는다.
"""

import argparse
import glob
import json
import os
import re
import subprocess
import sys
from datetime import date

NOTES = os.environ.get("ASH_WIKI_NOTES", "").rstrip("/")
ARCHIVE = os.path.expanduser("~/documents/ash-wiki-retro")
SESSIONS = os.path.expanduser("~/.claude/projects/*ash-wiki*/*.jsonl")
NOTE_REFS = ("$ASH_WIKI_NOTES", "${ASH_WIKI_NOTES")
PERSISTED = re.compile(r"tool-results/[\w.-]+")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
RUN_ID = re.compile(r"^cse_[A-Za-z0-9]+$")
HEADING = re.compile(r"#{1,6}\s")
ISSUE_NUMBER = re.compile(r"#\d+")
WORKTREE_BASE = re.compile(r"HEAD is now at ([0-9a-f]{7,40})")
# reader-testing은 wiki-reader-testing의 옛 이름이다. 지난 기록을 읽으려고 남긴다.
WIKI_SKILL = r"wiki-[a-z]+(?:-[a-z]+)*|reader-testing"
SKILL_DIR = re.compile(rf"Base directory for this skill: \S*?(\.claude/skills/(?:{WIKI_SKILL}))\n")
COMMAND_SKILL = re.compile(rf"<command-message>({WIKI_SKILL})</command-message>")
ROUTINE_SKILL = re.compile(rf'"content": "/({WIKI_SKILL})\b')
GH_WRITE = re.compile(r"\bgh (?:pr|issue) (?:create|comment)\b")
GITHUB_URL = re.compile(r"https://github\.com/[\w.-]+/[\w.-]+/(?:pull|issues)/\d+(?:#issuecomment-\d+)?")
HANDOFF = re.compile(r"/documents/ash-wiki-handoff/.*\.md$")
CANDIDATE_MARKS = ("<command-message>", '"Skill"', '"RemoteTrigger"', "custom-title", "gh ", "github.com/", "ash-wiki-handoff")


def note_forms():
    home = os.path.expanduser("~")
    if not NOTES.startswith(home + "/"):
        return [NOTES]
    rest = NOTES[len(home) :]
    return [NOTES] + [prefix + rest for prefix in ("~", "$HOME", "${HOME}")]


def clip(text, n):
    if not isinstance(text, str):
        text = json.dumps(text, ensure_ascii=False)
    text = text.replace("\n", "⏎ ")
    return text if len(text) <= n else text[:n] + f"…(+{len(text) - n})"


def stem(path):
    return path[: -len(".jsonl")]


def tool_input(name, inp):
    if name == "Bash":
        return clip(inp.get("description", "") + " | " + inp.get("command", ""), 400)
    if name in ("Read", "Write"):
        return inp.get("file_path", "")
    if name == "Edit":
        old = clip(inp.get("old_string", ""), 120)
        new = clip(inp.get("new_string", ""), 160)
        return f"{inp.get('file_path', '')} old={old} new={new}"
    if name == "Agent":
        return clip(inp.get("description", "") + " | " + inp.get("prompt", ""), 1500)
    return clip(inp, 300)


def result_text(content):
    if isinstance(content, list):
        content = " ".join(x.get("text", "") for x in content if isinstance(x, dict))
    return content if isinstance(content, str) else ""


def blocks(message):
    content = message.get("content") if isinstance(message, dict) else None
    if isinstance(content, str):
        return [{"type": "text", "text": content}]
    return [x for x in content or [] if isinstance(x, dict)]


def read_entries(path):
    entries = []
    with open(path) as transcript:
        for line in transcript:
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return entries


def queued_prompt(entry):
    attachment = entry.get("attachment") or {}
    return (
        attachment.get("type") == "queued_command"
        and attachment.get("commandMode") == "prompt"
        and isinstance(attachment.get("prompt"), str)
    )


def names_notes(text):
    return any(f in text for f in note_forms())


def redelivered(entries):
    pending, found = [], set()
    for i, entry in enumerate(entries):
        if entry.get("type") == "attachment" and queued_prompt(entry):
            pending.append((i, entry["attachment"]["prompt"].strip()))
        elif entry.get("type") == "user":
            texts = [b.get("text", "").strip() for b in blocks(entry.get("message")) if b.get("type") == "text"]
            if not texts:
                continue
            match = next((k for k, (_, text) in enumerate(pending) if text == texts[0]), None)
            if match is not None:
                found.add(pending[match][0])
            pending = pending[match + 1 :] if match is not None else []
    return found


def opens_notes(raw, persisted):
    return any(f in raw for f in note_forms()) or any(r in raw for r in (*NOTE_REFS, *persisted))


def digest(path, out_path):
    hidden = set()
    persisted = set()
    note_inputs = []
    entries = read_entries(path)
    duplicates = redelivered(entries)

    def hide(key, text):
        hidden.add(key)
        persisted.update(PERSISTED.findall(text))

    with open(out_path, "w") as out:
        for i, entry in enumerate(entries):
            ts = (entry.get("timestamp") or "")[:16]
            kind = entry.get("type")
            if kind == "user":
                for j, block in enumerate(blocks(entry.get("message"))):
                    if block.get("type") == "text":
                        text = block.get("text", "")
                        if names_notes(text):
                            hide(("user", i, j), text)
                            text = "(노트, 지움)"
                        elif text.startswith("Base directory for this skill"):
                            text = clip(text, 200)
                        out.write(f"\n### USER {ts}\n{text}\n")
                    elif block.get("type") == "tool_result":
                        text = result_text(block.get("content"))
                        if block.get("tool_use_id") in hidden or names_notes(text):
                            hide(block.get("tool_use_id"), text)
                            out.write("  [res] (노트, 지움)\n")
                        elif block.get("is_error"):
                            out.write(f"  [ERR] {clip(text, 600)}\n")
                        else:
                            out.write(f"  [res] {clip(text, 250)}\n")
            elif kind == "assistant":
                for block in blocks(entry.get("message")):
                    if block.get("type") == "text" and block.get("text", "").strip():
                        out.write(f"\n### ASSISTANT {ts}\n{block['text']}\n")
                    elif block.get("type") == "tool_use":
                        name, inp = block.get("name", ""), block.get("input") or {}
                        raw = json.dumps(inp, ensure_ascii=False)
                        if opens_notes(raw, persisted):
                            hidden.add(block.get("id"))
                            note_inputs.append(raw)
                            out.write(f"- {name}: (노트, 지움)\n")
                        else:
                            out.write(f"- {name}: {tool_input(name, inp)}\n")
            elif kind == "attachment" and queued_prompt(entry) and i not in duplicates:
                text = entry["attachment"]["prompt"]
                origin = (entry["attachment"].get("origin") or {}).get("kind", "")
                if names_notes(text):
                    hide(("queued", i), text)
                    text = "(노트, 지움)"
                out.write(f"\n### USER {ts} (대기열, {origin})\n{text}\n")
            elif kind == "system" and entry.get("content"):
                out.write(f"\n[system {ts}] {clip(entry['content'], 300)}\n")
    return hidden, note_inputs


def session_name(path):
    title = ""
    with open(path) as transcript:
        for line in transcript:
            if '"custom-title"' in line:
                try:
                    title = json.loads(line).get("customTitle") or title
                except json.JSONDecodeError:
                    pass
    uuid = os.path.basename(path)[:8]
    title = re.sub(r"[^\w.-]+", "-", title).strip("-")
    return f"{title}-{uuid}" if title else uuid


def write(out_dir, name, path, label=""):
    hidden, note_inputs = digest(path, f"{out_dir}/{name}.md")
    if note_inputs:
        with open(f"{out_dir}/{name}-notes.txt", "w") as notes:
            notes.write("\n".join(note_inputs) + "\n")
    print(f"{name}.md\t지움 {len(hidden)}\t{label}".rstrip())
    return [f"{name}.md"] if hidden else []


def check_uuids(uuids, runs=False):
    bad = [u for u in uuids if not UUID.match(u) and not (runs and RUN_ID.match(u))]
    if bad:
        sys.exit(f"세션 uuid{'나 실행 id' if runs else ''}가 아니다: {', '.join(bad)}")


def digest_session(archive, path):
    uuid = os.path.basename(stem(path))
    out_dir = os.path.join(archive, uuid)
    subs = sorted(glob.glob(f"{stem(path)}/subagents/*.jsonl"))
    os.makedirs(out_dir, exist_ok=True)
    for old in glob.glob(f"{out_dir}/*-main.md") + glob.glob(f"{out_dir}/*-agent-*.md") + glob.glob(f"{out_dir}/*-notes.txt"):
        os.remove(old)
    print(out_dir)
    name = session_name(path)
    hidden_records = write(out_dir, f"{name}-main", path)
    for sub in subs:
        meta_path = stem(sub) + ".meta.json"
        label = ""
        if os.path.exists(meta_path):
            with open(meta_path) as meta:
                label = json.load(meta).get("description", "")
        hidden_records += write(out_dir, f"{name}-{os.path.basename(stem(sub))}", sub, label)
    return hidden_records


def analyzed(archive):
    ledger = os.path.join(archive, "analyzed.tsv")
    if not os.path.exists(ledger):
        return set()
    with open(ledger) as f:
        return {line.split("\t", 1)[0] for line in f if line.strip()}


def mark(archive, retro, uuids):
    seen = analyzed(archive)
    today = date.today().isoformat()
    with open(os.path.join(archive, "analyzed.tsv"), "a") as f:
        for uuid in uuids:
            if uuid not in seen:
                seen.add(uuid)
                f.write(f"{uuid}\t{retro}\t{today}\n")


def git(*args):
    result = subprocess.run(["git", *args], capture_output=True, text=True)
    return result.stdout.strip() if result.returncode == 0 else ""


def without_frontmatter(text):
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end != -1:
            text = text[end + 5 :]
    return text.strip()


def called_skills(entries):
    skills = {}
    for entry in entries:
        if entry.get("type") != "user":
            continue
        for block in blocks(entry.get("message")):
            match = SKILL_DIR.match(block.get("text", "")) if block.get("type") == "text" else None
            if match and match.group(1) not in skills:
                body = block["text"].split("\n\n", 1)[1] if "\n\n" in block["text"] else ""
                cut = body.rfind("\nARGUMENTS: ")
                skills[match.group(1)] = (body[:cut] if cut != -1 else body).strip()
    return skills


def worktree_base(entries):
    adds = set()
    for entry in entries:
        for block in blocks(entry.get("message")):
            if block.get("type") == "tool_use" and "git worktree add" in str((block.get("input") or {}).get("command", "")):
                adds.add(block.get("id"))
            elif block.get("type") == "tool_result" and block.get("tool_use_id") in adds:
                match = WORKTREE_BASE.search(result_text(block.get("content")))
                if match:
                    return match.group(1)
    return None


def session_version(path):
    entries = read_entries(path)
    base = worktree_base(entries)
    commit = base and git("rev-parse", "--verify", "-q", base + "^{commit}")
    how = "worktree base"
    if not commit:
        start = next((e["timestamp"] for e in entries if e.get("timestamp")), "")
        commit = git("rev-list", "-1", f"--before={start}", "origin/main")
        how = "시작 시각의 origin/main"
    uuid = os.path.basename(path)[:8]
    if not commit:
        print(f"{uuid}\t-\t-\t버전을 정하지 못함(첫 timestamp가 origin/main보다 이르다)")
        return
    skills = called_skills(entries)
    if not skills:
        print(f"{uuid}\t-\t{commit[:12]}\t{how}. 스킬 본문 없음(루틴에 넘긴 세션 등)")
    for skill_dir, body in skills.items():
        skill = f"{skill_dir}/SKILL.md"
        name = os.path.basename(skill_dir)
        if without_frontmatter(git("show", f"{commit}:{skill}")) == body:
            print(f"{uuid}\t{name}\t{commit[:12]}\t{how}")
            continue
        history = git("log", "--format=%H", "origin/main", "--", skill).split()
        fixed = next((c for c in history if without_frontmatter(git("show", f"{c}:{skill}")) == body), "")
        if fixed:
            print(f"{uuid}\t{name}\t{fixed[:12]}\t{how}({commit[:12]})와 본문이 달라, 본문이 같은 커밋으로 고침")
        else:
            print(f"{uuid}\t{name}\t{commit[:12]}\t{how}. 본문이 같은 커밋 없음")


def final_report(path):
    handback, texts, last_id = None, [], None
    for entry in read_entries(path):
        if entry.get("type") != "assistant":
            continue
        message = entry.get("message") or {}
        for block in blocks(message):
            if block.get("type") == "tool_use" and block.get("name") == "SubagentHandback":
                handback = (block.get("input") or {}).get("message") or handback
            elif block.get("type") == "text" and block.get("text", "").strip():
                if message.get("id") != last_id:
                    texts, last_id = [], message.get("id")
                texts.append(block["text"])
    return handback or "\n\n".join(texts)


def drop_first_line(report, first):
    head, _, rest = report.strip().partition("\n")
    number = ISSUE_NUMBER.search(first)
    if HEADING.match(head):
        return report, None
    if head.strip() == first.strip() or number and re.search(re.escape(number.group()) + r"(?!\d)", head):
        return rest, head
    return report, None


def save_report(archive, path, uuid, first):
    check_uuids([uuid])
    report = final_report(path)
    if not report.strip():
        sys.exit(f"반환이 없다: {path}")
    report, dropped = drop_first_line(report, first)
    if dropped:
        print(f"뗀 첫 줄: {dropped}")
    out_dir = os.path.join(archive, uuid)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "report.md"), "w") as f:
        f.write(f"{first}\n\n{report.strip()}\n")
    print(f"{out_dir}/report.md")


def invoked_wiki_skills(block):
    if block.get("type") == "text":
        match = COMMAND_SKILL.match(block.get("text", ""))
        return [match.group(1)] if match else []
    if block.get("type") != "tool_use":
        return []
    name, inp = block.get("name"), block.get("input") or {}
    if name == "Skill" and re.fullmatch(WIKI_SKILL, str(inp.get("skill", ""))):
        return [inp["skill"]]
    if name == "RemoteTrigger":
        return [f"{s}(루틴)" for s in ROUTINE_SKILL.findall(json.dumps(inp, ensure_ascii=False))]
    return []


def candidate_row(path):
    skills, urls, handoffs = [], [], []
    start, title, writes = "", "", set()
    with open(path) as transcript:
        for line in transcript:
            if start and not any(m in line for m in CANDIDATE_MARKS):
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            start = start or (entry.get("timestamp") or "")[:10]
            if entry.get("type") == "custom-title":
                title = entry.get("customTitle") or title
            for block in blocks(entry.get("message")):
                skills += invoked_wiki_skills(block)
                inp = block.get("input") or {}
                if block.get("type") == "tool_use" and block.get("name") == "Bash" and GH_WRITE.search(str(inp.get("command", ""))):
                    writes.add(block.get("id"))
                elif block.get("type") == "tool_use" and block.get("name") in ("Write", "Edit") and HANDOFF.search(str(inp.get("file_path", ""))):
                    handoffs.append(inp["file_path"])
                elif block.get("type") == "tool_result" and block.get("tool_use_id") in writes:
                    urls += GITHUB_URL.findall(result_text(block.get("content")))
    if not skills:
        return None
    uuid = os.path.basename(stem(path))
    return [uuid, joined(skills, ","), start or "-", title or "-", joined(urls), joined(handoffs)]


def joined(items, sep=" "):
    return sep.join(dict.fromkeys(items)) or "-"


def candidates(archive, retro, paths):
    done = analyzed(archive) | {retro}
    rows =[candidate_row(p) for p in paths if os.path.basename(stem(p)) not in done]
    print("uuid\t스킬\t시작일\t제목\tURL\t핸드오프")
    for row in sorted((r for r in rows if r), key=lambda r: r[2]):
        print("\t".join(row))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", default=ARCHIVE)
    parser.add_argument("--mark", metavar="RETRO")
    parser.add_argument("--candidates", metavar="RETRO")
    parser.add_argument("--report", nargs=3, metavar=("AGENT", "UUID", "FIRST"))
    parser.add_argument("--version", action="store_true")
    parser.add_argument("items", nargs="*")
    args = parser.parse_args()
    if args.version:
        if not args.items:
            parser.error("기록이 필요하다")
        if not git("rev-parse", "--verify", "-q", "origin/main"):
            sys.exit("origin/main이 없다. 저장소 루트에서 돌린다.")
        for path in args.items:
            session_version(path)
        return
    if args.candidates:
        check_uuids([args.candidates])
        candidates(args.archive, args.candidates, args.items or sorted(glob.glob(SESSIONS)))
        return
    os.makedirs(args.archive, exist_ok=True)
    if args.report:
        if args.items:
            parser.error("--report는 에이전트 기록, uuid, 첫 줄 셋만 받는다. 첫 줄은 따옴표로 묶는다")
        save_report(args.archive, *args.report)
        return
    if not args.items:
        parser.error("기록이나 uuid가 필요하다")
    if args.mark:
        check_uuids(args.items, runs=True)
        mark(args.archive, args.mark, args.items)
        return
    if not NOTES:
        sys.exit(
            "ASH_WIKI_NOTES가 비어 있다. 소유자에게 설정을 요청한다. "
            "다른 값으로 돌리지 않는다(세션이 연 노트를 가리지 못한다)."
        )
    check_uuids([os.path.basename(stem(path)) for path in args.items])
    hidden_records = [name for path in args.items for name in digest_session(args.archive, path)]
    print(f"지움이 있는 기록 {len(hidden_records)}: {', '.join(hidden_records)}" if hidden_records else "지움이 있는 기록 없음")


if __name__ == "__main__":
    main()
