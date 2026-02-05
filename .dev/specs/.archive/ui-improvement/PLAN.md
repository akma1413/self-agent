# Virtual Self 프론트엔드 UI 개선 계획

> Pencil 디자인 도구를 활용한 현대적 미니멀 UI 리디자인

## 요약

Virtual Self 프로젝트의 5개 프론트엔드 페이지를 Pencil 디자인 도구와 lunaris 디자인 시스템을 활용하여 개선합니다. 디자인 시스템 → 화면 목업 → 코드 변환 순서로 진행합니다.

---

## 검증 전략

### Agent가 검증 (A-items)
| ID | 기준 | 방법 |
|----|------|------|
| A-1 | Pencil 디자인 완성도 | `mcp__pencil__get_screenshot` 으로 시각 검증 |
| A-2 | TypeScript 빌드 | `npm run build` 성공 |
| A-3 | ESLint 통과 | `npm run lint` 오류 없음 |

### 사람이 확인 (H-items)
| ID | 기준 | 이유 |
|----|------|------|
| H-1 | 디자인 방향성 | 스타일 선호도는 주관적 판단 필요 |
| H-2 | UX 개선 효과 | 실제 사용감 확인 필요 |
| H-3 | 다크 모드 품질 | 시각적 밸런스 확인 필요 |

---

## 병렬 작업 단위

| 단위 | 설명 | 의존성 | 파일 |
|------|------|--------|------|
| unit-design | Pencil 디자인 시스템 및 화면 목업 | (없음) | `.pen` 파일 |
| unit-components | 새 UI 컴포넌트 구현 | unit-design (인터페이스만) | `components/ui/` |
| unit-pages | 페이지 컴포넌트 업데이트 | unit-components | `app/` 페이지들 |

---

## 컨텍스트

### 현재 상태
- **프레임워크**: Next.js 16 + React 19 + Tailwind CSS v4
- **페이지**: Dashboard, Reports, Actions, Principles, Settings (총 5개)
- **컴포넌트**: Button, Card, Badge, Sidebar, Header
- **디자인 도구**: Pencil with lunaris 디자인 시스템 (100+ 컴포넌트)

### UX 문제점
1. **시각적 위계 부족**: 대시보드 메트릭이 모두 동일하게 보임
2. **상호작용 마찰**: Action 워크플로우가 2개 모달 필요
3. **정보 밀도 낮음**: 트렌드 시각화 없음

### 디자인 방향
- **스타일**: 현대적 미니멀 (Editorial × Data-Driven)
- **모서리**: 0px (sharp corners)
- **그림자**: 없음 (1px border로 대체)
- **타이포**: Lora(serif) 헤드라인 + Inter 본문

---

## 작업 목표

### 핵심 목표
Pencil에서 디자인 시스템을 구축하고, 5개 화면을 목업한 후 React+Tailwind 코드로 변환

### 구체적 산출물
1. Pencil 디자인 시스템 (커스텀 컴포넌트)
2. 5개 화면 목업 (Dashboard, Reports, Actions, Principles, Settings)
3. 새 UI 컴포넌트 코드 (toast, metric-card, drawer 등)
4. 업데이트된 페이지 컴포넌트

### 완료 조건
- [ ] Pencil에서 5개 화면 디자인 완료
- [ ] 새 컴포넌트 6개 이상 구현
- [ ] 모든 페이지 다크 모드 지원
- [ ] TypeScript 빌드 성공
- [ ] ESLint 오류 없음

### 하지 말 것 (Guardrails)
- 기존 API 구조 변경하지 않음
- Settings 페이지의 brutalist 스타일은 유지
- 모바일 레이아웃은 이번 범위에서 제외

---

## 작업 흐름

```
TODO-1 (디자인 시스템) → TODO-2 (화면 목업) → TODO-3 (코드 변환) → TODO-4 (통합)
```

---

## 의존성 그래프

| TODO | 필요 | 생성 | 리스크 |
|------|------|------|--------|
| TODO-1 | lunaris 컴포넌트 | 커스텀 Pencil 컴포넌트 | LOW |
| TODO-2 | TODO-1 산출물 | 5개 화면 목업 | LOW |
| TODO-3 | TODO-2 산출물, 현재 코드 | React 컴포넌트 | MEDIUM |
| TODO-4 | TODO-3 산출물 | 통합된 프론트엔드 | MEDIUM |

---

## TODOs

### [ ] TODO 1: Pencil 디자인 시스템 구축

**유형**: work
**리스크**: LOW

**입력**:
- lunaris 디자인 시스템 컴포넌트
- 현재 코드의 컴포넌트 구조

**출력**:
- `custom_components` (Pencil frame): 커스텀 UI 컴포넌트들

**단계**:
- [ ] Pencil에서 새 프레임 생성 (`placeholder: true`)
- [ ] MetricCard 컴포넌트 생성 (트렌드 표시기 포함)
- [ ] Toast 컴포넌트 생성 (success, error, warning, info)
- [ ] FilterTabs 컴포넌트 생성
- [ ] Drawer 컴포넌트 생성 (오른쪽 슬라이드)
- [ ] 타이포그래피 변수 설정 (Lora, Inter)
- [ ] 색상 변수 설정 (라이트/다크 모드)
- [ ] 스크린샷으로 검증

**Pencil 컴포넌트 매핑**:
| 새 컴포넌트 | 기반 lunaris ID | 용도 |
|------------|-----------------|------|
| MetricCard | `ERkuB` (Card) + `W4YFH` (Progress) | 대시보드 통계 |
| Toast | `ITZkn` (Alert/Info) 변형 | 알림 |
| FilterTabs | `Kbr4h` (Tabs) | 필터링 |
| Drawer | 커스텀 프레임 | 사이드 패널 |
| ConfirmButton | `ZETEA` (Button/Default) | 확인 액션 |

**하지 말 것**:
- lunaris 원본 컴포넌트 수정하지 않음
- 복잡한 애니메이션 추가하지 않음

**참조**:
- `frontend/src/components/ui/button.tsx:10-25` - 현재 버튼 variants
- `frontend/src/components/ui/card.tsx:1-51` - 현재 카드 구조

**수용 기준**:

*기능:*
- [ ] 5개 이상의 커스텀 컴포넌트 생성됨
- [ ] 다크 모드 색상 변수 정의됨

*정적:*
- [ ] `mcp__pencil__get_screenshot` 으로 컴포넌트 확인

---

### [ ] TODO 2: 5개 화면 목업 생성

**유형**: work
**리스크**: LOW

**입력**:
- TODO-1의 커스텀 컴포넌트
- 현재 페이지 구조

**출력**:
- `screens` (Pencil frames): 5개 화면 목업

**단계**:

**2.1 Dashboard 화면**:
- [ ] 1440x900 프레임 생성
- [ ] Sidebar 삽입 (`d5ZTS`, width: 240px)
- [ ] 3개 MetricCard 삽입 (번호: 01, 02, 03)
- [ ] Quick Actions 카드 삽입
- [ ] Recent Reports 리스트 삽입

**2.2 Reports 리스트 화면**:
- [ ] FilterTabs 삽입 (전체/대기/완료/보관)
- [ ] DataTable 삽입 (`yLiVX`)
- [ ] Pagination 삽입 (`9PVw5`)

**2.3 Report 상세 화면**:
- [ ] 헤더에 Skip/Adopt 버튼 배치 (스크롤 불필요)
- [ ] Verdict 카드 강조 (큰 배지 + 신뢰도)
- [ ] 2열 레이아웃 (Benefits | Decision Factors)

**2.4 Actions 화면**:
- [ ] 리스트 + Drawer 레이아웃
- [ ] 오른쪽 Drawer (width: 400px)
- [ ] 모달 대신 Drawer에서 확인/거절

**2.5 Principles 화면**:
- [ ] 단일 열 리스트 레이아웃
- [ ] Progress bar로 신뢰도 표시
- [ ] 접이식 Evidence 섹션

**하지 말 것**:
- 모바일 레이아웃 설계하지 않음
- Settings 페이지 큰 변경 없음

**참조**:
- `frontend/src/app/page.tsx:80-127` - 현재 대시보드 카드 구조
- `frontend/src/app/actions/page.tsx:263-303` - 현재 모달 구조

**수용 기준**:

*기능:*
- [ ] 5개 화면 모두 목업 완료
- [ ] 각 화면 스크린샷 검증됨

---

### [ ] TODO 3: React + Tailwind 코드 생성

**유형**: work
**리스크**: MEDIUM

**입력**:
- TODO-2의 화면 목업
- 현재 컴포넌트 코드

**출력**:
- 새 컴포넌트 파일들
- 업데이트된 globals.css

**단계**:

**3.1 새 컴포넌트 생성**:
- [ ] `components/ui/toast.tsx` 생성
- [ ] `components/ui/metric-card.tsx` 생성
- [ ] `components/ui/drawer.tsx` 생성
- [ ] `components/ui/filter-tabs.tsx` 생성
- [ ] `components/ui/progress.tsx` 생성

**3.2 기존 컴포넌트 업데이트**:
- [ ] `button.tsx` - sharp corners (rounded-none)
- [ ] `card.tsx` - border 스타일 업데이트
- [ ] `badge.tsx` - danger variant 추가
- [ ] `sidebar.tsx` - 스타일 업데이트

**3.3 글로벌 스타일 업데이트**:
- [ ] `globals.css`에 Lora 폰트 추가
- [ ] 새 CSS 변수 추가
- [ ] Toast 애니메이션 keyframes

**코드 변환 규칙**:
```
Pencil → Tailwind 매핑:
- cornerRadius: 0 → rounded-none
- shadow: none → border border-slate-200
- fill: $--primary → bg-blue-600
- fontFamily: Lora → font-serif
- gap: 16 → gap-4
```

**하지 말 것**:
- 기존 props 인터페이스 breaking change
- 불필요한 의존성 추가

**참조**:
- `frontend/src/app/globals.css:1-96` - 현재 글로벌 스타일
- `frontend/src/components/ui/button.tsx` - 버튼 variant 패턴

**수용 기준**:

*기능:*
- [ ] 새 컴포넌트 5개 이상 생성됨
- [ ] 다크 모드 지원됨

*정적:*
- [ ] `npm run build` → exit 0
- [ ] `npm run lint` → 오류 없음

---

### [ ] TODO 4: 페이지 통합 및 검증

**유형**: work
**리스크**: MEDIUM

**입력**:
- TODO-3의 컴포넌트
- 현재 페이지 코드

**출력**:
- 업데이트된 페이지 컴포넌트들

**단계**:

**4.1 Dashboard 페이지 업데이트**:
- [ ] `app/page.tsx` - MetricCard 통합
- [ ] 트렌드 데이터 표시 추가

**4.2 Reports 페이지 업데이트**:
- [ ] `app/reports/page.tsx` - FilterTabs, DataTable 통합
- [ ] `app/reports/[id]/page.tsx` - 2열 레이아웃, 헤더 버튼

**4.3 Actions 페이지 업데이트**:
- [ ] `app/actions/page.tsx` - Drawer 통합
- [ ] 모달 → Drawer 전환
- [ ] Toast 알림 통합

**4.4 Principles 페이지 업데이트**:
- [ ] `app/principles/page.tsx` - Progress bar, 접이식 섹션

**4.5 전체 검증**:
- [ ] 모든 페이지 라이트/다크 모드 확인
- [ ] API 연동 확인
- [ ] 빌드 및 린트 확인

**하지 말 것**:
- API 엔드포인트 변경
- 기존 데이터 구조 변경

**참조**:
- `frontend/src/lib/api.ts` - API 클라이언트
- `frontend/src/app/layout.tsx` - 루트 레이아웃

**수용 기준**:

*기능:*
- [ ] 5개 페이지 모두 새 디자인 적용됨
- [ ] 다크 모드 정상 동작
- [ ] API 데이터 정상 표시

*정적:*
- [ ] `npm run build` → exit 0

*런타임:*
- [ ] 개발 서버에서 모든 페이지 로드 확인

---

### [ ] TODO Final: 최종 검증

**유형**: verification (읽기 전용)

**수용 기준**:
- [ ] Pencil 디자인 5개 화면 스크린샷 확인
- [ ] `npm run build` 성공
- [ ] `npm run lint` 오류 없음
- [ ] 개발 서버 (`npm run dev`) 실행하여 모든 페이지 동작 확인
- [ ] 라이트/다크 모드 전환 확인

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `frontend/src/components/ui/button.tsx` | 버튼 variants 업데이트 |
| `frontend/src/app/page.tsx` | 대시보드 MetricCard 통합 |
| `frontend/src/app/actions/page.tsx` | Drawer 패턴으로 모달 대체 |
| `frontend/src/app/globals.css` | 타이포그래피, 색상 토큰 |
| `frontend/src/components/layout/sidebar.tsx` | 네비게이션 스타일 업데이트 |

---

## 참고: Pencil lunaris 컴포넌트 ID

| 컴포넌트 | ID | 용도 |
|---------|-----|------|
| Button/Default | `ZETEA` | 기본 버튼 |
| Button/Secondary | `U83R7` | 보조 버튼 |
| Button/Outline | `4x7RU` | 아웃라인 버튼 |
| Button/Ghost | `Svd9t` | 고스트 버튼 |
| Card | `ERkuB` | 카드 컨테이너 |
| Card Plain | `eBwLd` | 플레인 카드 |
| Data Table | `yLiVX` | 데이터 테이블 |
| Tabs | `Kbr4h` | 탭 컨테이너 |
| Alert/Info | `ITZkn` | 정보 알림 |
| Alert/Success | `nIj3a` | 성공 알림 |
| Sidebar | `d5ZTS` | 사이드바 |
| Progress | `W4YFH` | 진행 바 |
| Pagination | `9PVw5` | 페이지네이션 |
