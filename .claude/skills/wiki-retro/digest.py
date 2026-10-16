"""세션 기록(jsonl)을 분석 에이전트가 읽을 요약본으로 줄이고, 회고가 분석한 세션을 적는다.

python3 digest.py [--archive <폴더>] <기록.jsonl>...
python3 digest.py [--archive <폴더>] --mark <회고 세션 uuid> <세션 uuid>...
python3 digest.py [--archive <폴더>] --report <에이전트 기록> <세션 uuid> '<첫 줄>'
python3 digest.py --version <기록.jsonl>...

보관 폴더(기본 ~/documents/ash-wiki-retro)의 <uuid>/에, 기록마다 <이름>-main.md를,
기록 옆 <uuid>/subagents/의 서브에이전트 기록마다 <이름>-<agent id>.md를 쓴다.
<이름>은 세션 제목과 uuid 앞 8자다. 기록, 이 스크립트, ASH_WIKI_NOTES의 값이 지난번
요약 뒤로 바뀌지 않았으면 다시 만들지 않고 "있음"을 찍는다. 다시 만들 때는 요약본만
지우고 report.md는 둔다. 작업 중 대기열로 온 메시지(서브에이전트 반환, 세션 간 메시지,
소유자 글)는 사용자 글처럼 전문으로 쓰고 "(대기열, <출처>)"를 단다. 완료 알림은 쓰지
않고, 바로 다음 user 줄로 다시 온 메시지는 한 번만 쓴다.

--mark는 보관 폴더의 analyzed.tsv에 세션 uuid, 회고 세션 uuid, 날짜를 한 줄씩
더한다. 이미 있는 uuid는 더하지 않는다. 회고는 이 목록에 없는 세션을 분석한다.

--report는 에이전트 기록의 마지막 SubagentHandback 메시지(없으면 마지막 어시스턴트
글)를 첫 줄 아래에 붙여 <uuid>/report.md에 쓴다. 반환이 없거나 uuid가 아니면 쓰지
않고 실패한다.

--version은 기록마다 세션 판을 찍는다. 판은 worktree base(기록의 첫 "HEAD is now at"),
없으면 기록의 첫 timestamp 때의 origin/main이다. 기록의 스킬 본문이 그 판의 SKILL.md와
다르면 origin/main 역사에서 본문이 같은 커밋으로 고친다. 저장소 루트에서 돌린다.

소스 노트를 연 도구 호출은 입력과 결과를 지우고, 그 입력을 <이름>-notes.txt에
모은다. 입력에 노트 디렉터리(ASH_WIKI_NOTES의 값, ~나 $HOME으로 쓴 꼴 포함)나 그
변수의 참조($ASH_WIKI_NOTES, ${ASH_WIKI_NOTES)가 있거나, 결과에 노트 디렉터리가
나오는 호출이다. 지운 결과가 너무 커서 tool-results/ 파일로 저장됐으면, 그 파일을
다시 읽은 호출도 지운다. 변수 이름만 적은 호출("ASH_WIKI_NOTES는 열지 않는다")은
노트를 연 것으로 보지 않는다. 노트 디렉터리가 나오는 사용자 글과 대기열 메시지도 지운다.
파일마다 지운 수를 출력한다. 0이 아니면 노트를 열었을 수 있는 기록이다.
"""

import argparse
import glob
import hashlib
import json
import os
import re
import subprocess
import sys
from datetime import date

NOTES = os.environ.get("ASH_WIKI_NOTES", "").rstrip("/")
ARCHIVE = os.path.expanduser("~/documents/ash-wiki-retro")
NOTE_REFS = ("$ASH_WIKI_NOTES", "${ASH_WIKI_NOTES")
PERSISTED = re.compile(r"tool-results/[\w.-]+")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
WORKTREE_BASE = re.compile(r"HEAD is now at ([0-9a-f]{7,40})")
SKILL_DIR = re.compile(r"Base directory for this skill: \S*?(\.claude/skills/(?:wiki-[a-z]+|reader-testing))\n")


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


def next_user_texts(entries):
    following, text = [], None
    for entry in reversed(entries):
        following.append(text)
        if entry.get("type") == "user":
            texts = [b.get("text", "").strip() for b in blocks(entry.get("message")) if b.get("type") == "text"]
            text = texts[0] if texts else text
    return following[::-1]


def opens_notes(raw, persisted):
    return any(f in raw for f in note_forms()) or any(r in raw for r in (*NOTE_REFS, *persisted))


def digest(path, out_path):
    hidden = set()
    persisted = set()
    note_inputs = []
    entries = read_entries(path)
    following = next_user_texts(entries)

    def hide(key, text):
        hidden.add(key)
        persisted.update(PERSISTED.findall(text))

    with open(out_path, "w") as out:
        for entry, after in zip(entries, following):
            ts = (entry.get("timestamp") or "")[:16]
            kind = entry.get("type")
            if kind == "user":
                for block in blocks(entry.get("message")):
                    if block.get("type") == "text":
                        text = block.get("text", "")
                        if names_notes(text):
                            hide(id(block), text)
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
            elif kind == "attachment" and queued_prompt(entry) and entry["attachment"]["prompt"].strip() != after:
                text = entry["attachment"]["prompt"]
                origin = (entry["attachment"].get("origin") or {}).get("kind", "")
                if names_notes(text):
                    hide(id(entry), text)
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


def source_stamp(path, subs):
    with open(__file__, "rb") as script:
        version = hashlib.sha256(script.read()).hexdigest()[:12]
    notes = hashlib.sha256(NOTES.encode()).hexdigest()[:12]
    return " ".join([version, notes, *(str(os.path.getsize(p)) for p in [path, *subs])])


def check_uuids(uuids):
    bad = [u for u in uuids if not UUID.match(u)]
    if bad:
        sys.exit(f"세션 uuid가 아니다: {', '.join(bad)}")


def digest_session(archive, path):
    uuid = os.path.basename(stem(path))
    out_dir = os.path.join(archive, uuid)
    subs = sorted(glob.glob(f"{stem(path)}/subagents/*.jsonl"))
    stamp_path = os.path.join(out_dir, ".source")
    stamp = source_stamp(path, subs)
    if os.path.exists(stamp_path):
        with open(stamp_path) as f:
            if f.read() == stamp:
                print(f"{uuid}\t있음")
                return
    os.makedirs(out_dir, exist_ok=True)
    for old in glob.glob(f"{out_dir}/*-main.md") + glob.glob(f"{out_dir}/*-agent-*.md") + glob.glob(f"{out_dir}/*-notes.txt"):
        os.remove(old)
    print(out_dir)
    name = session_name(path)
    write(out_dir, f"{name}-main", path)
    for sub in subs:
        meta_path = stem(sub) + ".meta.json"
        label = ""
        if os.path.exists(meta_path):
            with open(meta_path) as meta:
                label = json.load(meta).get("description", "")
        write(out_dir, f"{name}-{os.path.basename(stem(sub))}", sub, label)
    with open(stamp_path, "w") as f:
        f.write(stamp)


def mark(archive, retro, uuids):
    ledger = os.path.join(archive, "analyzed.tsv")
    seen = set()
    if os.path.exists(ledger):
        with open(ledger) as f:
            seen = {line.split("\t", 1)[0] for line in f if line.strip()}
    today = date.today().isoformat()
    with open(ledger, "a") as f:
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


def session_version(path):
    entries = read_entries(path)
    with open(path) as transcript:
        base = WORKTREE_BASE.search(transcript.read())
    commit = base and git("rev-parse", "--verify", "-q", base.group(1) + "^{commit}")
    how = "worktree base"
    if not commit:
        start = next((e["timestamp"] for e in entries if e.get("timestamp")), "")
        commit = git("rev-list", "-1", f"--before={start}", "origin/main")
        how = "시작 시각의 origin/main"
    uuid = os.path.basename(path)[:8]
    if not commit:
        print(f"{uuid}\t-\t-\t판을 정하지 못함(첫 timestamp가 origin/main보다 이르다)")
        return
    skills = called_skills(entries)
    if not skills:
        print(f"{uuid}\t-\t{commit[:12]}\t{how}. 스킬 본문 없음(루틴 세션 등)")
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


def save_report(archive, path, uuid, first):
    check_uuids([uuid])
    report = final_report(path)
    if not report.strip():
        sys.exit(f"반환이 없다: {path}")
    out_dir = os.path.join(archive, uuid)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "report.md"), "w") as f:
        f.write(f"{first}\n\n{report.strip()}\n")
    print(f"{out_dir}/report.md")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", default=ARCHIVE)
    parser.add_argument("--mark", metavar="RETRO")
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
    os.makedirs(args.archive, exist_ok=True)
    if args.report:
        if args.items:
            parser.error("--report는 에이전트 기록, uuid, 첫 줄 셋만 받는다. 첫 줄은 따옴표로 묶는다")
        save_report(args.archive, *args.report)
        return
    if not args.items:
        parser.error("기록이나 uuid가 필요하다")
    if args.mark:
        check_uuids(args.items)
        mark(args.archive, args.mark, args.items)
        return
    if not NOTES:
        sys.exit(
            "ASH_WIKI_NOTES가 비어 있다. 소유자에게 설정을 요청한다. "
            "다른 값으로 돌리지 않는다(세션이 연 노트를 가리지 못한다)."
        )
    check_uuids([os.path.basename(stem(path)) for path in args.items])
    for path in args.items:
        digest_session(args.archive, path)


if __name__ == "__main__":
    main()
