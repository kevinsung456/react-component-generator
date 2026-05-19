# AGENTS.md — React Component Generator

## Operational Commands

```bash
# 의존성 설치
bun install

# 개발 서버 실행 (API 서버 + Vite 동시)
bun run dev

# 프로덕션 빌드
bun run build

# API 서버만 실행 (port 3002)
bun run server

# 린트 검사
bun run lint
```

**패키지 매니저: bun 고정** — npm, yarn, pnpm 사용 금지.

## Project Context

AI가 React 컴포넌트를 생성하는 웹 앱. 사용자가 프롬프트를 입력하면 Anthropic Claude 또는 Google Gemini를 호출하여 즉시 렌더링 가능한 컴포넌트 코드를 반환한다.

Tech Stack: React 19, TypeScript, Vite, Bun, react-live, Anthropic API, Google Gemini API

## Golden Rules

**Immutable:**
- API 키를 코드에 하드코딩하지 마라. `.env` 또는 런타임 입력만 허용.
- `server/index.ts`의 CORS 헤더는 개발 편의를 위한 것이며, 프로덕션 배포 시 `*` 를 구체적인 origin으로 교체해야 한다.
- react-live는 TypeScript 문법을 지원하지 않는다. AI가 생성하는 컴포넌트 코드는 반드시 순수 JavaScript여야 한다 (타입 어노테이션, interface, generics, `as` 캐스트 금지).

**Do:**
- 컴포넌트 생성 코드는 항상 `render(<ComponentName />)` 호출로 끝나야 한다 (`ensureRenderCall` 참고).
- API 호출 실패 시 503, 429 등 HTTP 상태코드에 따라 사용자 친화적 한국어 메시지를 반환하라.
- 새 AI 프로바이더 추가 시 `Provider` 타입과 `ENV_KEYS`, `callXxx` 함수 패턴을 그대로 따르라.

**Don't:**
- CSS 파일 import 또는 CSS 모듈을 생성된 컴포넌트에 사용하지 마라 — 인라인 스타일만 허용.
- `react-live`의 `LiveProvider`에 TypeScript 코드를 전달하지 마라.

## Standards & References

**Git 전략:** `main` 브랜치 기준. feature 브랜치는 `feat/`, 버그픽스는 `fix/` 접두어.

**커밋 메시지 포맷:**
```
<type>: <한국어 요약>

type: feat | fix | refactor | chore | docs | style | test
```

**코드 컨벤션:**
- TypeScript strict mode 활성화 (`tsconfig.app.json` 참고).
- Named export 사용 (default export 지양).
- 컴포넌트 파일: `PascalCase.tsx`, 훅 파일: `useCamelCase.ts`.

**Maintenance Policy:** 이 파일의 규칙이 실제 코드와 괴리가 생기면 업데이트를 제안하라.

## Context Map

- **[Frontend (React/Vite)](./src/AGENTS.md)** — 컴포넌트, 훅, 타입 수정 시.
- **[Backend (Bun API Server)](./server/AGENTS.md)** — API 라우트, AI 프로바이더 로직 수정 시.
