# AGENTS.md — Backend (server/)

## Module Context

Bun 런타임 기반 API 프록시 서버. AI 프로바이더(Anthropic, Google)로 요청을 중계하고, API 키를 클라이언트에 노출하지 않는다.

Port: `3002` | Entry: `server/index.ts`

## Tech Stack & Constraints

- Bun native `fetch` 및 `Bun.serve` 사용 — `express`, `hono` 등 외부 HTTP 프레임워크 추가 금지.
- 환경변수: `process.env.ANTHROPIC_API_KEY`, `process.env.GOOGLE_API_KEY` — `.env` 파일로 관리.
- 현재 Anthropic 모델: `claude-haiku-4-5-20251001`.
- 현재 Google 모델: `gemini-2.5-flash`.

## Implementation Patterns

**새 프로바이더 추가 시 따라야 할 패턴:**

1. `Provider` 타입에 추가: `type Provider = 'anthropic' | 'google' | 'newprovider'`
2. `ENV_KEYS`에 환경변수 키 추가.
3. `callNewProvider(prompt, apiKey)` 함수 작성 — `Promise<string>` 반환.
4. `/api/generate` 라우트의 분기 조건에 추가.
5. `src/types/index.ts`의 `Provider` 타입도 동기화.

**에러 응답 포맷:**
```ts
return Response.json(
  { error: '한국어 메시지' },
  { status: 400, headers: CORS_HEADERS }
);
```

**SYSTEM_PROMPT 수정 시 주의:**
- `Do NOT use import statements` 규칙은 react-live 런타임 제약 — 제거 금지.
- `Do NOT use TypeScript syntax` 규칙도 동일 이유로 제거 금지.

## API Endpoints

- `GET /api/config` — 환경변수로 설정된 API 키 존재 여부 반환 (`boolean`).
- `POST /api/generate` — 컴포넌트 코드 생성. Body: `{ prompt, apiKey?, provider? }`.

## Local Golden Rules

**Do:**
- `stripCodeFences`와 `ensureRenderCall`은 모든 AI 응답에 적용하라 — react-live 호환성 보장.
- 새 AI 모델로 업그레이드 시 모델 ID 상수를 파일 상단에 분리하는 것을 고려하라.

**Don't:**
- `CORS_HEADERS`의 `Access-Control-Allow-Origin: *` 를 제거하지 마라 — 개발 환경 필수.
- API 키를 응답 body에 포함시키지 마라.
- `Bun.serve` 외 포트에서 서버를 추가로 열지 마라.
