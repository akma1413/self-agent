# Virtual Self Constitution

> 정보 과부하 시대의 개인 비서 시스템: 자동 수집 → 분석 → 보고 → 컨펌 → 실행 → 자가발전

**Version:** 1.0.0

---

## Ralph Wiggum

**Source:** https://github.com/fstandhartinger/ralph-wiggum
**Commit:** 22b6c3c4fad47d8e5a5824ac2093b8d58ab057ff
**Installed:** 2026-02-05

### Auto-Update

At session start, check for updates:
1. Run: `git ls-remote https://github.com/fstandhartinger/ralph-wiggum.git HEAD`
2. If hash differs: fetch latest scripts, update this file, inform user

---

## Context Detection

**Ralph Loop Mode** (started by ralph-loop.sh / ralph-loop-codex.sh):
- Focus on implementation — no unnecessary questions
- Pick highest priority incomplete spec
- Complete ALL acceptance criteria
- Test thoroughly
- Output `<promise>DONE</promise>` ONLY when 100% complete

**Interactive Mode** (normal conversation):
- Be helpful and conversational
- Guide decisions, create specs
- Explain Ralph loop when ready

---

## Core Principles

### I. 자동화 우선
반복 작업을 최소화하고, 사람이 해야 할 일은 “검토/컨펌”에 집중한다.

### II. 신뢰성과 추적성
결과는 재현 가능해야 하며, 왜 그런 결론이 나왔는지 투명하게 보여준다.

### III. 단순성
꼭 필요한 것만 만들고, 과한 복잡도를 피한다.

---

## Technical Stack

Detected from codebase:
- Frontend: Next.js 16.1.6 + React 19.2.3 + Tailwind CSS 4
- Backend: Python 3.13 + FastAPI + Uvicorn
- Database: Supabase (PostgreSQL)
- LLM/Integrations: Gemini API

---

## Autonomy

**YOLO Mode:** ENABLED
Full permission to read/write files, execute commands, and make HTTP requests.

**Git Autonomy:** ENABLED
Rules:
- Never stage or commit unrelated changes.
- Prefer explicit paths: `git add <file>` only for spec-related changes.
- Skip commit/push if no changes are needed.
