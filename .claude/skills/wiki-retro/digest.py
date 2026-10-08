"""세션 기록(jsonl)을 분석 에이전트가 읽을 요약본으로 줄이고, 회고가 분석한 세션을 적는다.

python3 digest.py [--archive <폴더>] <기록.jsonl>...
python3 digest.py [--archive <폴더>] --mark <회고 세션 uuid> <세션 uuid>...

보관 폴더(기본 ~/documents/ash-wiki-retro)의 <uuid>/에, 기록마다 <이름>-main.md를,
기록 옆 <uuid>/subagents/의 서브에이전트 기록마다 <이름>-<agent id>.md를 쓴다.
<이름>은 세션 제목과 uuid 앞 8자다. Claude Code가 오래된 기록을 지워도 요약본이
남게 하려고 저장소 밖에 둔다. 기록이 지난번 요약 뒤로 바뀌지 않았으면 다시 만들지
않고 "있음"을 찍는다.

--mark는 보관 폴더의 analyzed.tsv에 세션 uuid, 회고 세션 uuid, 날짜를 한 줄씩
더한다. 이미 있는 uuid는 더하지 않는다. 회고는 이 목록에 없는 세션을 분석한다.

소스 노트를 연 도구 호출은 입력과 결과를 지우고, 그 입력을 <이름>-notes.txt에
모은다. 입력에 노트 디렉터리(ASH_WIKI_NOTES의 값, ~나 $HOME으로 쓴 꼴 포함)나 그
변수의 참조($ASH_WIKI_NOTES, ${ASH_WIKI_NOTES)가 있거나, 결과에 노트 디렉터리가
나오는 호출이다. 지운 결과가 너무 커서 tool-results/ 파일로 저장됐으면, 그 파일을
다시 읽은 호출도 지운다. 변수 이름만 적은 호출("ASH_WIKI_NOTES는 열지 않는다")은
노트를 연 것으로 보지 않는다.
파일마다 지운 수를 출력한다. 0이 아니면 노트를 연 기록이다.

지우기는 노출을 줄일 뿐이다. 노트 디렉터리로 옮긴 뒤 상대 경로로 연 결과처럼
빠지는 것이 있다. 격리 경계는 회고 스킬의 대조로 지킨다.
"""

import argparse
import glob
import json
import os
import re
import shutil
import sys
from datetime import date

NOTES = os.environ.get("ASH_WIKI_NOTES", "").rstrip("/")
ARCHIVE = os.path.expanduser("~/documents/ash-wiki-retro")
NOTE_REFS = ("$ASH_WIKI_NOTES", "${ASH_WIKI_NOTES")
PERSISTED = re.compile(r"tool-results/[\w.-]+")


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


def opens_notes(raw, persisted):
    return any(f in raw for f in note_forms()) or any(r in raw for r in (*NOTE_REFS, *persisted))


def digest(path, out_path):
    hidden = set()
    persisted = set()
    note_inputs = []
    with open(path) as transcript, open(out_path, "w") as out:
        for line in transcript:
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            ts = (entry.get("timestamp") or "")[:16]
            kind = entry.get("type")
            if kind == "user":
                for block in blocks(entry.get("message")):
                    if block.get("type") == "text":
                        text = block.get("text", "")
                        if text.startswith("Base directory for this skill"):
                            text = clip(text, 200)
                        out.write(f"\n### USER {ts}\n{text}\n")
                    elif block.get("type") == "tool_result":
                        text = result_text(block.get("content"))
                        if block.get("tool_use_id") in hidden or any(f in text for f in note_forms()):
                            hidden.add(block.get("tool_use_id"))
                            persisted.update(PERSISTED.findall(text))
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
    return " ".join(str(os.path.getsize(p)) for p in [path, *subs])


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
    shutil.rmtree(out_dir, ignore_errors=True)
    os.makedirs(out_dir)
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


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", default=ARCHIVE)
    parser.add_argument("--mark", metavar="RETRO")
    parser.add_argument("items", nargs="+")
    args = parser.parse_args()
    os.makedirs(args.archive, exist_ok=True)
    if args.mark:
        mark(args.archive, args.mark, args.items)
        return
    if not NOTES:
        sys.exit("ASH_WIKI_NOTES가 비어 있다. 노트를 연 기록을 가리지 못하니 설정한 뒤 다시 돌린다.")
    for path in args.items:
        digest_session(args.archive, path)


if __name__ == "__main__":
    main()
