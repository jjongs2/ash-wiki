"""세션 기록(jsonl)을 분석 에이전트가 읽을 요약본으로 줄이고, 회고가 분석한 세션을 적는다.

python3 digest.py [--archive <폴더>] <기록.jsonl>...
python3 digest.py [--archive <폴더>] --mark <회고 세션 uuid> <세션 uuid>...
python3 digest.py [--archive <폴더>] --report <에이전트 기록> <세션 uuid> '<첫 줄>'
python3 digest.py [--archive <폴더>] --candidates <이 세션 uuid> [<기록.jsonl>...] [--records <목록>] [--runs <실행 id>...] [--fixed <흐름>=<시각>...]
python3 digest.py [--archive <폴더>] --last-retro [<기록.jsonl>...] [--records <목록>]
python3 digest.py --cost <기록.jsonl>...
python3 digest.py --version <기록.jsonl>...

보관 폴더(기본 ~/documents/ash-wiki-retro)의 <uuid>/에, 기록마다 <이름>-main.md를,
기록 옆 <uuid>/subagents/의 서브에이전트 기록(Workflow가 띄운 workflows/<wf id>/의 것
포함)마다 <이름>-<agent id>.md를 쓴다. 서브에이전트 요약본의 첫 줄은 .meta.json의
agentType과 description(Workflow면 wf id도)이고, 메인 요약본의 Agent 호출 줄은
subagent_type으로 시작한다.
<이름>은 세션 제목과 uuid 앞 8자다. 실행할 때마다 다시 만들고, 지난 요약본만 지우고
report.md는 둔다. 작업 중 대기열로 온 메시지(서브에이전트 반환, 세션 간 메시지,
소유자 글)는 사용자 글처럼 전문으로 쓰고 "(대기열, <출처>)"를 단다. 완료 알림은 쓰지
않고, 뒤이어 user 줄로 차례대로 다시 온 메시지는 한 번만 쓴다.

--mark는 보관 폴더의 analyzed.tsv에 세션 uuid, 회고 세션 uuid, 날짜를 한 줄씩
더한다. 회고 세션 자리에는 분석 없이 뺀 세션이면 -, 흐름을 멈춰 분석하지 않은 세션이면
포화를 넘긴다. 루틴 실행도 기록 파일 이름의 CLI uuid로 적는다. 실행 id(cse_…)로 적힌 옛
줄은 --candidates가 읽기만 한다. 이미 있는 것은 더하지 않는다. 회고는 이 목록에 없는
세션과 루틴 실행을 분석한다.

--report는 에이전트 기록의 마지막 SubagentHandback 메시지(없으면 마지막 어시스턴트
글)를 첫 줄 아래에 붙여 <uuid>/report.md에 쓴다. 반환이 없거나 uuid가 아니면 쓰지
않고 실패한다. 반환의 첫 비지 않은 줄이 제목(#)이 아니고, 첫 줄과 같거나 첫 줄의 첫
#N을 담으면 그 줄을 떼고 저장하고, 뗀 줄을 찍는다. 반환이 첫 줄을 제 문구로 다시 쓰면
첫 줄이 두 번 들어가기 때문이다.

--candidates는 위키 스킬을 부르거나, .claude/agents/의 에이전트를 띄우거나,
RemoteTrigger로 루틴에 넘긴 세션 가운데 analyzed.tsv에 없고 이 세션도 아닌 것을 찾아,
세션마다 uuid, 스킬, 에이전트, 시작일(첫 timestamp), 제목, URL, 핸드오프를 한 줄씩
찍는다. 에이전트를 띄운 세션은 서브에이전트 .meta.json의 agentType이 세션 버전(스킬
본문으로 고치기 전)의 .claude/agents/에 있는 세션이다. isBuiltIn은 옛 기록에 없어 쓰지
않는다. URL은 기록에서 gh pr/issue create·comment가 돌려준 PR·이슈·코멘트이고,
핸드오프는 세션이 쓰거나 고친 ash-wiki-handoff/의 파일이다. 루틴에 넘긴 스킬에는
"(루틴)"을 단다. 기록은 인자와 --records의 목록(한 줄에 경로 하나)으로 받고, 둘 다 없으면
~/.claude/projects/*ash-wiki*/의 기록을 본다.
같은 세션의 기록이 여러 자리(백업 사본과 원본)에 있으면 하나로 센다. remote.json이 있는
것, 그다음 가장 큰 것, 크기가 같으면 이 컴퓨터의 원본을 고른다.
받아 둔 클라우드 기록은 세션 폴더에 remote.json이 있다. 그 origin이 ROUTINE_ORIGINS인
루틴 실행(손으로 돌린 실행 포함)은 기록에 스킬 실행의 표시가 없어도 후보이고, 스킬 열에
"루틴 실행(<cse_…>)"을 찍는다. 받아 둔
클라우드 기록에는 <command-message>도 스킬 본문도 없어, 사용자 글 첫머리의 /wiki-…
슬래시 명령을 스킬 실행으로 센다. 로컬 기록에서는 세지 않는다. remote.json의 실행 id가 analyzed.tsv의 옛 줄에 있으면 뺀다. --runs로 받은
실행 id(session_…이나 cse_…) 가운데 받아 둔 기록도 옛 줄도 없는 것은 스킬 열이
"루틴 실행(받지 않음)"인 줄로 끝에 찍는다. 저장소 루트에서 돌린다.
후보 줄은 이어서 흐름, 추천, 점수와 신호를 찍는다. 신호는 메인과 서브에이전트 기록을 합쳐 LLM 없이 센다.
  오류: 거부가 아닌 도구 오류(is_error인 tool_result)
  거부: 소유자의 거절, auto mode 분류기와 worktree 격리 훅이 막은 도구 호출(DENIAL)
  재실행: 기록 안에서 앞서 돌린 것과 같은 Bash 명령
  소유자 글: 첫 프롬프트 뒤 소유자의 글. 로컬 기록은 origin이 human인 글과 대기열 메시지, 받아 둔 클라우드
    기록은 origin 없이 clientPlatform이 있는 글이다. 메인 기록에서만 센다
  compact: compact 경계(compact_boundary나 compactMetadata가 있는 system 레코드). 클라우드의
    autocompact_state는 설정이라 세지 않는다
  호출: API 호출(어시스턴트 메시지 id, <synthetic> 제외)
  분: 메인 기록의 turn 시간 합. 로컬은 turn_duration, 받아 둔 클라우드 기록은 result의 durationMs다.
    turn이 끝난 뒤 백그라운드 에이전트를 기다린 시간은 빠진다. 그런 세션은 호출이 잡는다
  메모리: 세션이 연(Edit·Write 밖의 도구 입력에 나온) 메모리 파일 수. MEMORY.md는 세지 않는다
흐름은 스킬 열의 첫 위키 스킬(옛 이름 reader-testing은 wiki-reader-testing)이고, 위키 스킬 없이 에이전트만
띄운 세션은 "에이전트(<에이전트 묶음>)"다. 점수는 흐름 안의 중앙값을 넘는 신호의 수다. 줄은 세션이 많은
흐름부터, 흐름 안에서는 점수, 같으면 호출 수가 큰 것부터 찍는다. 추천은 흐름마다 앞의 둘에 "신호", --fixed가
그 흐름에 준 시각(같은 흐름이 여럿이면 늦은 것) 뒤에 처음 시작한 세션에 "고친 뒤", 표시가 없는 세션 가운데
이 세션 uuid와 흐름을 씨앗으로 고른 하나에 "무작위"를 단다. 같은 회고에서 다시 돌려도 같은 세션을 고른다.
빈 줄 뒤에 흐름마다 세션 수와 추천한 세션(uuid 앞 8자)을 찍는다.

--last-retro는 analyzed.tsv의 회고 세션 열에서 가장 최근 회고(날짜가 같으면 뒤 줄)를 찾아, 그 uuid, 날짜,
기록, 그 기록에서 gh pr/issue create·comment가 돌려준 URL을 찍는다. 기록은 --candidates처럼 받는다.

--cost는 기록마다 메인과 서브에이전트 기록의 API 호출 수, 캐시 읽기, 캐시 쓰기, 출력 토큰을 찍는다. 로컬
기록은 메시지마다 한 번 더한다. 받아 둔 클라우드 기록은 메시지마다의 출력이 스트림을 시작할 때의 값이라,
토큰은 마지막 result 레코드의 누적 사용량(modelUsage를 모델마다 더한 것)으로 센다.

--version은 기록마다 세션 버전을 찍는다. 버전은 worktree base(git worktree add 결과의 "HEAD is now at"),
없으면 기록의 첫 timestamp 때의 origin/main이다. 기록의 스킬 본문이 그 버전의 SKILL.md와
다르면 origin/main 역사에서 본문이 같은 커밋으로 고친다. 이어서 세션이 띄운 에이전트
가운데 첫 스킬의 버전(스킬이 없으면 위 버전)의 .claude/agents/에 있는 것을 그 파일과
버전으로 한 줄씩 찍는다. 역사에는 있는데 그 버전에 없는 에이전트는 버전 자리에 "-"를
찍는다. 루틴 실행(remote.json의 origin이 ROUTINE_ORIGINS)과 클라우드 세션은 스킬 본문이 없다. 그래서 받아 둔
클라우드 기록은 스킬 자리에 첫 프롬프트의 슬래시 명령(없으면 "-")을, 버전 자리에 시작
시각의 origin/main을 찍는다. 저장소 루트에서 돌린다.

소스 노트를 연 도구 호출은 입력과 결과를 지우고, 그 입력을 <이름>-notes.txt에
모은다. 입력에 노트 디렉터리(ASH_WIKI_NOTES의 값, ~나 $HOME으로 쓴 꼴, 기록이 백업 사본이면
사본 꼭대기의 manifest.json이 적은 그 컴퓨터의 홈 아래 같은 자리 포함)나 그
변수의 참조($ASH_WIKI_NOTES, ${ASH_WIKI_NOTES)가 있거나, 결과에 노트 디렉터리가
나오는 호출이다. 받아 둔 클라우드 기록(remote.json이 있는 기록)에서는 노트 폴더 이름
(ASH_WIKI_NOTES의 마지막 조각)이 한 낱말로 나오는 곳을 모두 노트 디렉터리로 본다. 클라우드는
노트 저장소를 홈과 다른 자리에 clone하고, 저장소를 붙이는 호출에도 그 이름이 나온다. 지운 결과가 너무 커서 tool-results/ 파일로 저장됐으면, 그 파일을
다시 읽은 호출도 지운다. 변수 이름만 적은 호출("ASH_WIKI_NOTES는 열지 않는다")은
노트를 연 것으로 보지 않는다. 노트 디렉터리가 나오는 사용자 글과 대기열 메시지도 지운다.
파일마다 지운 수를 출력한다. 0이 아니면 노트를 열었을 수 있는 기록이다. 끝 줄에
지운 수가 0이 아닌 기록의 수와 이름을 찍는다.
"""

import argparse
import glob
import json
import os
import random
import re
import statistics
import subprocess
import sys
from datetime import date

NOTES = os.environ.get("ASH_WIKI_NOTES", "").rstrip("/")
ARCHIVE = os.path.expanduser("~/documents/ash-wiki-retro")
SESSIONS = os.path.expanduser("~/.claude/projects/*ash-wiki*/*.jsonl")
# 루틴 실행의 remote.json origin. force_run_trigger는 RemoteTrigger의 run으로 손으로 돌린 실행이다.
ROUTINE_ORIGINS = ("scheduled_trigger", "force_run_trigger")
PROJECTS = os.path.expanduser("~/.claude/projects")
NOTE_REFS = ("$ASH_WIKI_NOTES", "${ASH_WIKI_NOTES")
NOTE_FORMS = [NOTES]  # main이 요약할 기록의 홈으로 다시 정한다.
# 받아 둔 클라우드 기록을 요약하는 동안만 정한다. 클라우드는 노트 저장소를 /home/user/<노트 폴더>에
# clone하는데 사본의 홈은 /root라, 홈으로 짐작하지 않는다. 노트 폴더 이름이 한 낱말로 나오는 곳(경로,
# 저장소를 붙이는 호출, URL)을 모두 노트로 본다.
NOTE_SEGMENT = None
PERSISTED = re.compile(r"tool-results/[\w.-]+")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
# 옛 analyzed.tsv 줄의 루틴 실행 id. 새 줄은 루틴 실행도 CLI uuid로 적는다.
RUN_ID = re.compile(r"^cse_[A-Za-z0-9]+$")
HEADING = re.compile(r"#{1,6}\s")
ISSUE_NUMBER = re.compile(r"#\d+")
WORKTREE_BASE = re.compile(r"HEAD is now at ([0-9a-f]{7,40})")
# reader-testing은 wiki-reader-testing의 옛 이름이다. 지난 기록을 읽으려고 남긴다.
WIKI_SKILL = r"wiki-[a-z]+(?:-[a-z]+)*|reader-testing"
SKILL_DIR = re.compile(rf"Base directory for this skill: \S*?(\.claude/skills/(?:{WIKI_SKILL}))\n")
COMMAND_SKILL = re.compile(rf"<command-message>({WIKI_SKILL})</command-message>")
ROUTINE_SKILL = re.compile(rf'"content": "/({WIKI_SKILL})\b')
# 받아 둔 클라우드 기록은 슬래시 명령을 사용자 글 그대로 남기고, <command-message>도 스킬 본문도 없다.
SLASH_SKILL = re.compile(rf"/({WIKI_SKILL})(?![A-Za-z0-9_-])")
GH_WRITE = re.compile(r"\bgh (?:pr|issue) (?:create|comment)\b")
GITHUB_URL = re.compile(r"https://github\.com/[\w.-]+/[\w.-]+/(?:pull|issues)/\d+(?:#issuecomment-\d+)?")
HANDOFF = re.compile(r"/documents/ash-wiki-handoff/.*\.md$")
AGENTS = ".claude/agents"
SIGNALS = ("오류", "거부", "재실행", "소유자 글", "compact", "호출", "분", "메모리")
# 서브에이전트 기록과 더하지 않는 신호. 소유자 글과 걸린 시간은 메인 기록의 값이고, 메모리는 기록끼리 겹친 파일을 한 번 센다.
UNSUMMED = ("소유자 글", "분", "메모리")
CANDIDATE_HEADER = ["uuid", "스킬", "에이전트", "시작일", "제목", "URL", "핸드오프", "흐름", "추천", "점수", *SIGNALS]
# 권한 거부: 소유자가 거절한 것, auto mode 분류기가 막은 것, worktree 격리 훅이 막은 것.
DENIAL = re.compile(r"The user doesn't want to proceed|Permission (?:for this action|to use \S+) (?:was|has been) denied|This session is isolated in the worktree")
MEMORY_FILE = re.compile(r"\.claude/projects/[^/\s\"']+/memory/([^/\s\"'|;&)]+\.md)")
CANDIDATE_MARKS = ("<command-message>", '"/wiki-', '"/reader-testing', '"Skill"', '"RemoteTrigger"', "custom-title", "gh ", "github.com/", "ash-wiki-handoff")


def manifest_of(path):
    """백업 사본의 기록이면 사본 꼭대기의 manifest.json(<사본>/<프로젝트 폴더>/<uuid>.jsonl)."""
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(path))), "manifest.json")


def homes(paths):
    """이 컴퓨터의 홈과, 넘겨받은 기록이 백업 사본이면 그 사본의 manifest.json이 적은 홈."""
    found = [os.path.expanduser("~")]
    for path in sorted({manifest_of(p) for p in paths}):
        try:
            with open(path) as f:
                home = json.load(f).get("home")
        except (OSError, json.JSONDecodeError):
            continue
        if isinstance(home, str) and home.startswith("/") and home.rstrip("/"):
            found.append(home.rstrip("/"))
    return list(dict.fromkeys(found))


def note_forms(known):
    """노트 디렉터리의 꼴. 다른 컴퓨터의 기록은 그 홈 아래 같은 자리에 노트를 둔 것으로 본다."""
    home = next((h for h in known if NOTES.startswith(h + "/")), None)
    if not home:
        return [NOTES]
    rest = NOTES[len(home) :]
    return list(dict.fromkeys([NOTES] + [h + rest for h in known] + [prefix + rest for prefix in ("~", "$HOME", "${HOME}")]))


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
        agent = inp.get("subagent_type") or "subagent_type 없음"
        return clip(f"{agent} | {inp.get('description', '')} | {inp.get('prompt', '')}", 1500)
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
    return any(f in text for f in NOTE_FORMS) or bool(NOTE_SEGMENT and NOTE_SEGMENT.search(text))


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
    return names_notes(raw) or any(r in raw for r in (*NOTE_REFS, *persisted))


def digest(path, out_path, header=""):
    hidden = set()
    persisted = set()
    note_inputs = []
    entries = read_entries(path)
    duplicates = redelivered(entries)

    def hide(key, text):
        hidden.add(key)
        persisted.update(PERSISTED.findall(text))

    with open(out_path, "w") as out:
        if header and names_notes(header):
            hide(("header",), header)
            header = "(노트, 지움)"
        if header:
            out.write(header + "\n")
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


def write(out_dir, name, path, label="", header=""):
    hidden, note_inputs = digest(path, f"{out_dir}/{name}.md", header)
    if note_inputs:
        with open(f"{out_dir}/{name}-notes.txt", "w") as notes:
            notes.write("\n".join(note_inputs) + "\n")
    print(f"{name}.md\t지움 {len(hidden)}\t{label}".rstrip())
    return [f"{name}.md"] if hidden else []


def check_uuids(uuids, hint=""):
    bad = [u for u in uuids if not UUID.match(u)]
    if bad:
        sys.exit(f"세션 uuid가 아니다: {', '.join(bad)}{hint}")


def subagent_records(path):
    """세션이 띄운 서브에이전트의 기록. Workflow가 띄운 것은 subagents/workflows/<wf id>/에 있다."""
    base = f"{stem(path)}/subagents"
    return sorted(glob.glob(f"{base}/*.jsonl")) + sorted(glob.glob(f"{base}/workflows/*/agent-*.jsonl"))


def subagent_meta(sub):
    try:
        with open(stem(sub) + ".meta.json") as meta:
            return json.load(meta)
    except (OSError, json.JSONDecodeError):
        return {}


def spawned_agents(path):
    return list(dict.fromkeys(t for t in (subagent_meta(s).get("agentType") for s in subagent_records(path)) if t))


def subagent_header(sub, meta):
    parts = [f"agentType: {meta.get('agentType') or '-'}", f"description: {meta.get('description') or '-'}"]
    if os.path.basename(os.path.dirname(os.path.dirname(sub))) == "workflows":
        parts.append(f"workflow: {os.path.basename(os.path.dirname(sub))}")
    return " | ".join(parts)


def digest_session(archive, path):
    uuid = os.path.basename(stem(path))
    out_dir = os.path.join(archive, uuid)
    os.makedirs(out_dir, exist_ok=True)
    for old in glob.glob(f"{out_dir}/*-main.md") + glob.glob(f"{out_dir}/*-agent-*.md") + glob.glob(f"{out_dir}/*-notes.txt"):
        os.remove(old)
    print(out_dir)
    global NOTE_SEGMENT
    folder = os.path.basename(NOTES)
    NOTE_SEGMENT = re.compile(rf"(?<![A-Za-z0-9_.-]){re.escape(folder)}(?![A-Za-z0-9_.-])") if remote_info(path) and folder else None
    name = session_name(path)
    hidden_records = write(out_dir, f"{name}-main", path)
    for sub in subagent_records(path):
        meta = subagent_meta(sub)
        header = subagent_header(sub, meta)
        hidden_records += write(out_dir, f"{name}-{os.path.basename(stem(sub))}", sub, meta.get("description", ""), header)
    return hidden_records


def ledger_rows(archive):
    """analyzed.tsv의 줄(세션 uuid, 회고 세션 uuid, 날짜)."""
    ledger = os.path.join(archive, "analyzed.tsv")
    if not os.path.exists(ledger):
        return []
    with open(ledger) as f:
        return [line.rstrip("\n").split("\t") for line in f if line.strip()]


def analyzed(archive):
    return {row[0] for row in ledger_rows(archive)}


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


def base_commit(entries):
    base = worktree_base(entries)
    commit = base and git("rev-parse", "--verify", "-q", base + "^{commit}")
    if commit:
        return commit, "worktree base"
    start = next((e["timestamp"] for e in entries if e.get("timestamp")), "")
    return git("rev-list", "-1", f"--before={start}", "origin/main"), "시작 시각의 origin/main"


def agent_names(git_output):
    return {os.path.basename(p)[: -len(".md")] for p in git_output.split("\n") if p.endswith(".md")}


def project_agents(commit):
    """커밋의 .claude/agents/에 있는 에이전트 이름. 내장 에이전트(general-purpose, fork 등)는 없다."""
    return agent_names(git("ls-tree", "--name-only", commit, "--", f"{AGENTS}/"))


def agents_in_history():
    """origin/main 역사의 .claude/agents/에 한 번이라도 있던 에이전트 이름."""
    return agent_names(git("log", "--format=", "--name-only", "--no-renames", "origin/main", "--", f"{AGENTS}/"))


def session_version(path):
    entries = read_entries(path)
    commit, how = base_commit(entries)
    uuid = os.path.basename(path)[:8]
    if not commit:
        print(f"{uuid}\t-\t-\t버전을 정하지 못함(첫 timestamp가 origin/main보다 이르다)")
        return
    skills = called_skills(entries)
    run = routine_run(path)
    slashed = [] if skills or not remote_info(path) else slash_skills(entries)
    if run or slashed:
        kind = f"루틴 실행({run})" if run else "클라우드 세션"
        note = "스킬 본문이 없어 첫 프롬프트의 슬래시 명령으로 정함" if slashed else "스킬은 트리거의 프롬프트로 정한다"
        for name in slashed or ["-"]:
            print(f"{uuid}\t{name}\t{commit[:12]}\t{kind}. {how}. {note}")
    elif not skills:
        print(f"{uuid}\t-\t{commit[:12]}\t{how}. 스킬 본문 없음(루틴에 넘긴 세션, 에이전트만 띄운 세션 등)")
    versions = []
    for skill_dir, body in skills.items():
        skill = f"{skill_dir}/SKILL.md"
        name = os.path.basename(skill_dir)
        if without_frontmatter(git("show", f"{commit}:{skill}")) == body:
            skill_version, note = commit, how
        else:
            history = git("log", "--format=%H", "origin/main", "--", skill).split()
            same = next((c for c in history if without_frontmatter(git("show", f"{c}:{skill}")) == body), "")
            note = f"{how}({commit[:12]})와 본문이 달라, 본문이 같은 커밋으로 고침" if same else f"{how}. 본문이 같은 커밋 없음"
            skill_version = same or commit
        print(f"{uuid}\t{name}\t{skill_version[:12]}\t{note}")
        versions.append(skill_version)
    # 에이전트 파일은 첫 스킬의 세션 버전으로 읽고, 그 버전을 따로 맞추지 않는다.
    version = (versions or [commit])[0]
    names, in_history = project_agents(version), agents_in_history()
    for agent in spawned_agents(path):
        if agent in names:
            print(f"{uuid}\t{AGENTS}/{agent}.md\t{version[:12]}\t띄운 에이전트")
        elif agent in in_history:
            print(f"{uuid}\t{AGENTS}/{agent}.md\t-\t띄운 에이전트인데 세션 버전에 없음({version[:12]})")


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


def slash_skill(entry):
    """사용자 글이 슬래시 명령으로 시작하면 그 위키 스킬. 받아 둔 클라우드 기록에만 쓴다."""
    if entry.get("type") != "user":
        return []
    texts = [b.get("text", "") for b in blocks(entry.get("message")) if b.get("type") == "text"]
    match = SLASH_SKILL.match(texts[0].lstrip()) if texts else None
    return [match.group(1)] if match else []


def slash_skills(entries):
    return list(dict.fromkeys(s for entry in entries for s in slash_skill(entry)))


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


def agents_at_version(path, in_history):
    """세션이 띄운 에이전트 가운데 세션 버전의 .claude/agents/에 있는 것. 역사에 있던 이름으로 먼저 거른다."""
    agents = [a for a in spawned_agents(path) if a in in_history]
    if not agents:
        return []
    names = project_agents(base_commit(read_entries(path))[0])
    return [a for a in agents if a in names]


def made_urls(block, writes):
    """gh pr/issue create·comment가 돌려준 PR·이슈·코멘트 URL. 그 호출의 id를 writes에 모은다."""
    if block.get("type") == "tool_use" and block.get("name") == "Bash" and GH_WRITE.search(str((block.get("input") or {}).get("command", ""))):
        writes.add(block.get("id"))
    elif block.get("type") == "tool_result" and block.get("tool_use_id") in writes:
        return GITHUB_URL.findall(result_text(block.get("content")))
    return []


def last_retro(archive, paths):
    """분석 목록의 회고 세션 열에서 가장 최근 회고(날짜가 같으면 뒤 줄)와 그 기록, 기록에서 낸 URL.
    회고 세션 자리의 -(뺌)와 포화는 회고가 아니다."""
    rows = ledger_rows(archive)
    retros = [(row[2] if len(row) > 2 else "", n, row[1]) for n, row in enumerate(rows) if len(row) > 1 and UUID.match(row[1])]
    if not retros:
        print("지난 회고 없음")
        return
    when, _, retro = max(retros)
    path = next((p for p in one_copy_each(paths) if os.path.basename(stem(p)) == retro), None)
    writes, urls = set(), []
    for entry in read_entries(path) if path else []:
        for block in blocks(entry.get("message")):
            urls += made_urls(block, writes)
    print("회고 세션\t날짜\t기록\tURL")
    print("\t".join([retro, when or "-", path or "-", joined(urls)]))


def candidate_row(path, in_history):
    skills, urls, handoffs = [], [], []
    start, title, writes = "", "", set()
    cloud = bool(remote_info(path))
    with open(path) as transcript:
        for line in transcript:
            if start and not any(m in line for m in CANDIDATE_MARKS):
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            start = start or entry.get("timestamp") or ""
            if entry.get("type") == "custom-title":
                title = entry.get("customTitle") or title
            if cloud:
                skills += slash_skill(entry)
            for block in blocks(entry.get("message")):
                skills += invoked_wiki_skills(block)
                urls += made_urls(block, writes)
                inp = block.get("input") or {}
                if block.get("type") == "tool_use" and block.get("name") in ("Write", "Edit") and HANDOFF.search(str(inp.get("file_path", ""))):
                    handoffs.append(inp["file_path"])
    agents = agents_at_version(path, in_history)
    run = routine_run(path)
    if run:
        skills.insert(0, f"루틴 실행({run})")
    if not skills and not agents:
        return None
    uuid = os.path.basename(stem(path))
    cells = [uuid, joined(skills, ","), joined(agents, ","), start[:10] or "-", title or "-", joined(urls), joined(handoffs)]
    return {"uuid": uuid, "cells": cells, "start": start, "flow": flow_of(skills, agents, run), "signals": session_signals(path), "marks": []}


def flow_of(skills, agents, run):
    """흐름: 첫 위키 스킬(옛 이름은 지금 이름으로), 위키 스킬 없이 에이전트만 띄운 세션은 그 에이전트 묶음."""
    wiki = [s for s in skills if not s.startswith("루틴 실행(")]
    if wiki:
        return re.sub(r"^reader-testing\b", "wiki-reader-testing", wiki[0])
    if agents:
        return f"에이전트({','.join(sorted(agents))})"
    return "루틴 실행" if run else "-"


def rank(rows):
    """흐름마다 중앙값을 넘는 신호의 수(점수)로 매긴다. 같으면 호출 수가 많은 쪽, 그다음 이른 세션이다.
    흐름은 세션이 많은 것부터 찍는다."""
    flows = {}
    for row in rows:
        flows.setdefault(row["flow"], []).append(row)
    for members in flows.values():
        medians = {name: statistics.median(m["signals"][name] for m in members) for name in SIGNALS}
        for m in members:
            m["score"] = sum(m["signals"][name] > medians[name] for name in SIGNALS)
        members.sort(key=lambda m: (-m["score"], -m["signals"]["호출"], m["start"], m["uuid"]))
    return sorted(flows.items(), key=lambda item: (-len(item[1]), item[0]))


def recommend(flows, retro, fixed):
    """흐름마다 신호가 큰 둘, 지난 회고가 고친 흐름이면 고친 뒤 처음 돈 세션, 남은 세션에서 무작위 하나.
    무작위는 회고 세션 uuid와 흐름을 씨앗으로 해, 같은 회고에서 다시 돌려도 같은 세션이다."""
    for flow, members in flows:
        for m in members[:2]:
            m["marks"].append("신호")
        if flow in fixed:
            after = sorted((m for m in members if m["start"][:19] >= fixed[flow][:19]), key=lambda m: m["start"])
            if after:
                after[0]["marks"].append("고친 뒤")
        rest = sorted(m["uuid"] for m in members if not m["marks"])
        if rest:
            pick = random.Random(f"{retro}:{flow}").choice(rest)
            next(m for m in members if m["uuid"] == pick)["marks"].append("무작위")


def fixed_flows(items):
    """--fixed의 <흐름>=<시각>(지난 회고의 티켓이 머지된 시각)."""
    fixed = {}
    for item in items:
        flow, sep, when = item.partition("=")
        if not sep or not flow or not when:
            sys.exit(f"--fixed는 <흐름>=<시각>이다: {item}")
        fixed[flow] = max(fixed.get(flow, when), when)
    return fixed


def is_owner_text(entry):
    """소유자가 쓴 글. 로컬 기록은 origin이 human이고, 받아 둔 클라우드 기록은 origin 없이 clientPlatform이 있다."""
    if entry.get("type") != "user" or entry.get("isMeta"):
        return False
    origin = entry.get("origin")
    local = (origin or {}).get("kind") == "human"
    cloud = origin is None and "clientPlatform" in entry
    return (local or cloud) and any(b.get("type") == "text" for b in blocks(entry.get("message")))


def first_prompt(entries):
    """첫 프롬프트: 메타가 아닌 첫 사용자 글."""
    return next((i for i, e in enumerate(entries) if e.get("type") == "user" and not e.get("isMeta")
                 and any(b.get("type") == "text" for b in blocks(e.get("message")))), None)


def record_signals(entries):
    """기록 하나의 신호와 연 메모리 파일. 메모리는 파일 이름으로 돌려주어 기록끼리 겹친 것을 한 번 센다."""
    counts = dict.fromkeys(SIGNALS, 0)
    commands, memories, turn_ms = set(), set(), 0
    first = first_prompt(entries)
    duplicates = redelivered(entries)
    for i, entry in enumerate(entries):
        kind = entry.get("type")
        if kind == "system" and (entry.get("subtype") == "compact_boundary" or "compactMetadata" in entry):
            counts["compact"] += 1
        elif kind == "system" and entry.get("subtype") == "turn_duration" or kind == "result":
            turn_ms += entry.get("durationMs") or 0
        elif kind == "attachment" and queued_prompt(entry) and i not in duplicates:
            counts["소유자 글"] += (entry["attachment"].get("origin") or {}).get("kind") == "human"
        elif is_owner_text(entry) and i != first:
            counts["소유자 글"] += 1
        for block in blocks(entry.get("message")):
            if block.get("type") == "tool_use":
                inp = block.get("input") or {}
                if block.get("name") == "Bash":
                    command = str(inp.get("command", "")).strip()
                    counts["재실행"] += command in commands
                    commands.add(command)
                if block.get("name") not in ("Edit", "Write"):
                    memories.update(m for m in MEMORY_FILE.findall(json.dumps(inp, ensure_ascii=False)) if m != "MEMORY.md")
            elif block.get("type") == "tool_result" and block.get("is_error"):
                denied = DENIAL.search(result_text(block.get("content")))
                counts["거부" if denied else "오류"] += 1
    counts["호출"] = len(usage_by_message(entries))
    counts["분"] = round(turn_ms / 60000)
    return counts, memories


def session_signals(path):
    """메인과 서브에이전트 기록을 합친 신호."""
    main, memories = record_signals(read_entries(path))
    for sub in subagent_records(path):
        counts, more = record_signals(read_entries(sub))
        memories |= more
        for name in SIGNALS:
            if name not in UNSUMMED:
                main[name] += counts[name]
    main["메모리"] = len(memories)
    return main


def usage_by_message(entries):
    """API 호출(어시스턴트 메시지 id)마다 사용량. 로컬 기록은 한 메시지를 블록마다 같은 usage로 여러 줄에 쓴다."""
    calls = {}
    for entry in entries:
        message = entry.get("message") if isinstance(entry.get("message"), dict) else {}
        if entry.get("type") == "assistant" and message.get("usage") and message.get("model") != "<synthetic>":
            calls[message.get("id") or entry.get("uuid")] = message["usage"]
    return calls


def session_cost(path):
    """메인과 서브에이전트 기록의 호출 수, 캐시 읽기, 캐시 쓰기, 출력. 받아 둔 클라우드 기록은 메시지마다의 출력이
    스트림을 시작할 때의 값이라, 토큰은 마지막 result 레코드의 누적 사용량(modelUsage, 서브에이전트 포함)으로 센다."""
    calls = {}
    for record in [path, *subagent_records(path)]:
        calls.update({(record, k): v for k, v in usage_by_message(read_entries(record)).items()})
    tokens = [sum(u.get(key) or 0 for u in calls.values())
              for key in ("cache_read_input_tokens", "cache_creation_input_tokens", "output_tokens")]
    if remote_info(path):
        last = next((e for e in reversed(read_entries(path)) if e.get("type") == "result" and e.get("modelUsage")), None)
        if last:
            models = last["modelUsage"].values()
            tokens = [sum(m.get(key) or 0 for m in models) for key in ("cacheReadInputTokens", "cacheCreationInputTokens", "outputTokens")]
    return [len(calls), *tokens]


def joined(items, sep=" "):
    return sep.join(dict.fromkeys(items)) or "-"


def copy_rank(path):
    """받아 둔 클라우드 기록, 그다음 큰 기록, 크기가 같으면 이 컴퓨터의 원본(tool-results/가 있다)."""
    local = os.path.realpath(path).startswith(os.path.realpath(PROJECTS) + os.sep)
    return bool(remote_info(path)), os.path.getsize(path), local


def one_copy_each(paths):
    """세션마다 기록 하나. 백업 사본은 원본보다 늦을 뿐이고, teleport로 이은 로컬 기록은 remote.json이 없다."""
    chosen = {}
    for path in paths:
        uuid = os.path.basename(stem(path))
        if uuid not in chosen or copy_rank(path) > copy_rank(chosen[uuid]):
            chosen[uuid] = path
    return list(chosen.values())


def remote_info(path):
    """받기 절차가 클라우드 기록의 세션 폴더에 남긴 remote.json. 로컬 기록에는 없다."""
    try:
        with open(f"{stem(path)}/remote.json") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return {}


def routine_run(path):
    """루틴 실행이면 실행 id(cse_…). 루틴 실행의 기록에는 <command-message>도 스킬 본문도 없다."""
    info = remote_info(path)
    return (info.get("cse") or "-") if info.get("origin") in ROUTINE_ORIGINS else None


def run_suffix(run_id):
    return re.sub(r"^(?:session_|cse_)", "", run_id or "")


def candidates(archive, retro, paths, runs=(), fixed=None):
    done = analyzed(archive) | {retro}
    in_history = agents_in_history()
    # 옛 줄은 루틴 실행을 실행 id(cse_…)로 적었다.
    old_runs = {x for x in done if RUN_ID.match(x)}
    paths = one_copy_each(paths)
    rows = [
        candidate_row(p, in_history)
        for p in paths
        if os.path.basename(stem(p)) not in done and remote_info(p).get("cse") not in old_runs
    ]
    fetched = {run_suffix(remote_info(p).get("cse")) for p in paths} - {""}
    unfetched = [f"cse_{s}" for s in dict.fromkeys(map(run_suffix, runs)) if s not in fetched and f"cse_{s}" not in old_runs]
    flows = rank([r for r in rows if r])
    recommend(flows, retro, fixed or {})
    print("\t".join(CANDIDATE_HEADER))
    for flow, members in flows:
        for m in members:
            signals = (str(m["signals"][name]) for name in SIGNALS)
            print("\t".join([*m["cells"], flow, joined(m["marks"], ","), str(m["score"]), *signals]))
    for run in unfetched:
        print("\t".join([run, "루틴 실행(받지 않음)", *["-"] * (len(CANDIDATE_HEADER) - 2)]))
    print("\n흐름\t세션\t추천")
    for flow, members in flows:
        print(f"{flow}\t{len(members)}\t{joined(m['uuid'][:8] for m in members if m['marks'])}")


def read_list(path):
    with open(path) as f:
        return [line.strip() for line in f if line.strip()]


def record_paths(args):
    """인자와 --records 목록의 기록. 둘 다 없으면 이 컴퓨터의 원본이다."""
    paths = args.items + (read_list(args.records) if args.records else [])
    return paths or sorted(glob.glob(SESSIONS))


def require_origin_main():
    if not git("rev-parse", "--verify", "-q", "origin/main"):
        sys.exit("origin/main이 없다. 저장소 루트에서 돌린다.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", default=ARCHIVE)
    parser.add_argument("--mark", metavar="RETRO")
    parser.add_argument("--candidates", metavar="RETRO")
    parser.add_argument("--report", nargs=3, metavar=("AGENT", "UUID", "FIRST"))
    parser.add_argument("--version", action="store_true")
    parser.add_argument("--cost", action="store_true")
    parser.add_argument("--last-retro", action="store_true")
    parser.add_argument("--runs", nargs="+", default=[], metavar="RUN")
    parser.add_argument("--records", metavar="FILE")
    parser.add_argument("--fixed", nargs="+", default=[], metavar="FLOW=TIME")
    parser.add_argument("items", nargs="*")
    args = parser.parse_args()
    if args.version:
        if not args.items:
            parser.error("기록이 필요하다")
        require_origin_main()
        for path in args.items:
            session_version(path)
        return
    if args.cost:
        if not args.items:
            parser.error("기록이 필요하다")
        print("uuid\t호출\t캐시 읽기\t캐시 쓰기\t출력")
        for path in args.items:
            print("\t".join([os.path.basename(stem(path)), *map(str, session_cost(path))]))
        return
    if args.last_retro:
        last_retro(args.archive, record_paths(args))
        return
    if args.candidates:
        check_uuids([args.candidates])
        require_origin_main()
        candidates(args.archive, args.candidates, record_paths(args), args.runs, fixed_flows(args.fixed))
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
        check_uuids(args.items, ". 루틴 실행도 기록 파일 이름의 CLI uuid로 적는다")
        mark(args.archive, args.mark, args.items)
        return
    if not NOTES:
        sys.exit(
            "ASH_WIKI_NOTES가 비어 있다. 소유자에게 설정을 요청한다. "
            "다른 값으로 돌리지 않는다(세션이 연 노트를 가리지 못한다)."
        )
    check_uuids([os.path.basename(stem(path)) for path in args.items])
    global NOTE_FORMS
    NOTE_FORMS = note_forms(homes(args.items))
    hidden_records = [name for path in args.items for name in digest_session(args.archive, path)]
    print(f"지움이 있는 기록 {len(hidden_records)}: {', '.join(hidden_records)}" if hidden_records else "지움이 있는 기록 없음")


if __name__ == "__main__":
    main()
