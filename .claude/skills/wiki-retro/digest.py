"""세션 기록(jsonl)을 분석 에이전트가 읽을 요약본으로 줄인다.

python3 digest.py --out <폴더> <기록.jsonl>...

기록마다 <이름>-main.md를, 기록 옆 <uuid>/subagents/의 서브에이전트 기록마다
<이름>-<agent id>.md를 쓴다. <이름>은 세션 제목이고, 없으면 uuid 앞 8자다.

입력에 ASH_WIKI_NOTES(이름이나 값)가 든 도구 호출은 입력과 결과를 지운다. Agent 호출은
프롬프트가 "ASH_WIKI_NOTES는 열지 않는다"를 담기도 해서 이름으로는 지우지 않는다.
파일마다 지운 수를 출력한다. 0이 아니면 노트를 연 세션이다.
"""

import argparse
import glob
import json
import os


def short(s, n):
    s = s if isinstance(s, str) else json.dumps(s, ensure_ascii=False)
    s = s.replace("\n", "⏎ ")
    return s if len(s) <= n else s[:n] + f"…(+{len(s) - n})"


def tool_input(name, inp):
    if name == "Bash":
        return short(inp.get("description", "") + " | " + inp.get("command", ""), 400)
    if name in ("Read", "Write"):
        return inp.get("file_path", "")
    if name == "Edit":
        return (
            inp.get("file_path", "")
            + " old="
            + short(inp.get("old_string", ""), 120)
            + " new="
            + short(inp.get("new_string", ""), 160)
        )
    if name == "Agent":
        return short(inp.get("description", "") + " | " + inp.get("prompt", ""), 1500)
    return short(inp, 300)


def result_text(content):
    if isinstance(content, list):
        content = " ".join(x.get("text", "") for x in content if isinstance(x, dict))
    return content or ""


def touches_notes(name, raw):
    value = os.environ.get("ASH_WIKI_NOTES")
    if value and value in raw:
        return True
    return name != "Agent" and "ASH_WIKI_NOTES" in raw


def digest(path, out):
    hidden = set()
    with open(path) as f, open(out, "w") as o:
        for line in f:
            try:
                d = json.loads(line)
            except json.JSONDecodeError:
                continue
            ts = d.get("timestamp", "")[:16]
            if d.get("type") == "user":
                content = d["message"].get("content")
                if isinstance(content, str):
                    content = [{"type": "text", "text": content}]
                for x in content:
                    if x.get("type") == "text":
                        text = x["text"]
                        if text.startswith("Base directory for this skill"):
                            text = short(text, 200)
                        o.write(f"\n### USER {ts}\n{text}\n")
                    elif x.get("type") == "tool_result":
                        if x.get("tool_use_id") in hidden:
                            o.write("  [res] (지움)\n")
                            continue
                        text = result_text(x.get("content"))
                        if x.get("is_error"):
                            o.write(f"  [ERR] {short(text, 600)}\n")
                        else:
                            o.write(f"  [res] {short(text, 250)}\n")
            elif d.get("type") == "assistant":
                for x in d["message"].get("content", []):
                    if x.get("type") == "text" and x["text"].strip():
                        o.write(f"\n### ASSISTANT {ts}\n{x['text']}\n")
                    elif x.get("type") == "tool_use":
                        raw = json.dumps(x.get("input", {}), ensure_ascii=False)
                        if touches_notes(x["name"], raw):
                            hidden.add(x["id"])
                            o.write(f"- {x['name']}: (노트, 지움)\n")
                        else:
                            o.write(f"- {x['name']}: {tool_input(x['name'], x.get('input', {}))}\n")
            elif d.get("type") == "system" and d.get("content"):
                o.write(f"\n[system {ts}] {short(d['content'], 300)}\n")
    return len(hidden)


def title(path):
    name = os.path.basename(path)[:8]
    with open(path) as f:
        for line in f:
            if '"custom-title"' in line:
                name = json.loads(line)["customTitle"]
    return name


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--out", required=True)
    p.add_argument("transcripts", nargs="+")
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    for t in a.transcripts:
        name = title(t)
        n = digest(t, f"{a.out}/{name}-main.md")
        print(f"{name}-main.md\t지움 {n}")
        for s in sorted(glob.glob(f"{t[:-len('.jsonl')]}/subagents/*.jsonl")):
            aid = os.path.basename(s)[: -len(".jsonl")]
            meta = s[: -len(".jsonl")] + ".meta.json"
            desc = json.load(open(meta)).get("description", "") if os.path.exists(meta) else ""
            n = digest(s, f"{a.out}/{name}-{aid}.md")
            print(f"{name}-{aid}.md\t지움 {n}\t{desc}")


if __name__ == "__main__":
    main()
