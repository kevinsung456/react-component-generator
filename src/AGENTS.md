# AGENTS.md — Frontend (src/)

## Module Context

React 19 + TypeScript + Vite 기반 프론트엔드. `react-live`로 AI가 생성한 컴포넌트를 런타임에 렌더링한다.

## Tech Stack & Constraints

- `react-live` v4: `LiveProvider`, `LivePreview`, `LiveError` 사용. Babel 기반 런타임 트랜스파일.
- CSS는 `src/App.css`, `src/index.css`에서 전역 관리. 새 컴포넌트에 별도 CSS 파일 생성 금지 — 인라인 스타일 또는 기존 클래스 재사용.
- `fetch('/api/generate')` — Vite 프록시 없음. 개발 시 Bun 서버(port 3002)가 직접 CORS를 허용하므로 별도 proxy 설정 불필요.

## Implementation Patterns

**컴포넌트 파일 위치:** `src/components/ComponentName.tsx`

**커스텀 훅 위치:** `src/hooks/useHookName.ts`

**타입 정의:** `src/types/index.ts`에 공통 타입 추가.

**API 호출 패턴** (`useComponentGenerator.ts` 참고):
```ts
const res = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
});
```

**GeneratedComponent ID 생성:**
```ts
id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
```

## Local Golden Rules

**Do:**
- `react-live`에 전달하는 코드는 `noInline` prop 없이 단일 `render()` 호출로 끝내라.
- `Provider` 타입 변경 시 `src/types/index.ts`와 `server/index.ts` 양쪽 모두 갱신하라.
- 로딩/에러 상태는 `useComponentGenerator` 훅에서 중앙 관리 — 컴포넌트에서 직접 fetch 금지.

**Don't:**
- `LiveProvider`의 `code` prop에 TypeScript 문법 전달 금지 (런타임 오류 발생).
- `src/assets/` 이외 경로에 바이너리 파일 추가 금지.
