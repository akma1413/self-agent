# Virtual Self - Executive Intelligence System

> 정보 과부하 시대의 개인 비서 시스템: 자동 수집 → 분석 → 보고 → 컨펌 → 실행 → 자가발전

## 핵심 개념

**비유**: 대기업 회장님처럼 다양한 아젠다가 가공되어 올라오고, 리뷰/컨펌만 내려주면 시스템이 의사결정 패턴을 학습하여 자가발전

## MVP 범위: 바이브코딩 (AI 코딩 생태계)

- **Harness**: Claude Code, Cursor, Aider, Windsurf, Cline 등
- **Model**: Claude, GPT, Gemini, Llama 등
- **Tools**: MCP servers, Extensions, Plugins
- **Orchestrator**: OMC, Roo, Continue 등

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 15 + React 19 + Tailwind |
| Backend | Python + FastAPI |
| Database | Supabase (PostgreSQL) |
| LLM | Claude API |
| 스케줄러 | APScheduler |

## 프로젝트 구조

```
version1/
├── frontend/           # Next.js 대시보드
├── backend/            # FastAPI 서버
│   └── app/
│       ├── services/
│       │   ├── collector/    # 정보 수집
│       │   ├── processor/    # 아젠다 처리
│       │   ├── analyzer/     # LLM 분석
│       │   ├── reporter/     # 보고서 생성
│       │   ├── executor/     # 액션 실행
│       │   └── learner/      # 자가발전
│       └── api/v1/           # REST API
├── supabase/           # DB 마이그레이션
└── docs/
```

## 시작하기

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # 환경변수 설정
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # 환경변수 설정
npm run dev
```

## 환경변수

필요한 환경변수는 각 디렉토리의 `.env.example` 파일 참조

## 라이선스

MIT
