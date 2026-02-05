# Spec 001: Fix Report Detail Params + API Connection

## Context

리포트 상세 페이지(`/reports/[id]`)에서 Next 16 경고(`sync-dynamic-apis`)가 발생했고,
백엔드가 꺼져 있으면 `Failed to fetch`로 로딩이 실패한다.

## Requirements

- `ReportDetailPage`는 `useParams()`로 `id`를 읽는다.
- async `params` 또는 `React.use(params)` 접근을 제거한다.
- `reportId`가 없으면 API 호출을 건너뛰고 로딩을 종료한다.
- API 기본값은 `http://localhost:8000`을 유지한다.

## Acceptance Criteria

- [ ] `frontend/src/app/reports/[id]/page.tsx`에서 `useParams()`를 사용한다.
- [ ] `params`가 Promise인 상태를 직접 접근하지 않는다.
- [ ] `reportId`가 없을 때 fetch를 호출하지 않는다.
- [ ] `/api/v1/reports/<id>` 호출이 정상(200)이어야 한다.
- [ ] `/reports/<id>` 페이지가 200 응답이어야 한다.
- [ ] 브라우저 콘솔에 `sync-dynamic-apis` 경고가 나타나지 않는다.

## Test / Verification

1. 백엔드 헬스 체크
   - `curl http://127.0.0.1:8000/health` → 200
2. 리포트 ID 확보
   - `curl http://127.0.0.1:8000/api/v1/reports`
   - 반환된 리스트의 첫 `id`를 사용
3. 리포트 상세 API
   - `curl http://127.0.0.1:8000/api/v1/reports/<id>` → 200
4. 프론트 상세 페이지
   - `curl http://127.0.0.1:3000/reports/<id>` → 200

## Status: COMPLETE

## Notes

- 구현은 이미 반영됨. 이 스펙은 재검증용이다.
