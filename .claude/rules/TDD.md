# TDD Rule

**이 규칙은 Rigid입니다. 상황에 맞게 변형하지 마십시오.**

---

## 1. 적용 기준 구분

### TDD 반드시 적용 (RED-GREEN-REFACTOR 필수)

- **비즈니스 로직**: 금액 계산, 재고 관리, 인증/인가, 상태 전이
- **API 핸들러**: 엔드포인트 동작, 요청 검증, 에러 응답
- **유틸 함수**: 데이터 변환, 포맷팅, 파싱, 검증 헬퍼
- **버그 수정**: 먼저 재현 테스트 작성 후 고정

### TDD 불필요 (코드 작성 후 검증만)

- **타입 정의**: `interface`, `type` 정의 (타입 체커가 검증)
- **설정 파일**: JSON, YAML, 환경변수 설정
- **순수 UI 컴포넌트**: 스타일, 레이아웃 (시각적 테스트만)
- **SQL/쿼리**: 데이터베이스 마이그레이션, DDL

---

## 2. RED-GREEN-REFACTOR 사이클

### RED: 테스트 먼저 작성 (실패 확인 필수)

**규칙:**
- 한 번에 **하나의 동작**만 테스트 (의존성 최소화)
- 테스트 실행하여 **실패 확인** 필수 (빨간불)
- 실패 이유는 **"기능 미구현"**이어야 함 (문법 에러 아님)
- 테스트 이름은 동작을 명확히: `test_should_calculate_discount_for_vip_user`

**예시 (React):**
```ts
test('should return component code without TypeScript syntax', () => {
  const prompt = 'Create a counter button';
  const result = generateComponent(prompt);
  expect(result).not.toMatch(/interface|type|as const/);
});
```

**실행:**
```bash
npm test -- --testNamePattern="should return component code" # 실패 확인
```

### GREEN: 최소한의 코드만 작성

**규칙:**
- **YAGNI 원칙**: "You Aren't Gonna Need It" — 지금 필요한 것만
- 하드코드 OK (테스트만 통과하면 됨)
- **신규 테스트 + 기존 테스트 모두 통과 확인** 필수
- 리팩토링은 여기서 하지 마라

**예시 (코드 작성):**
```ts
// RED: 테스트가 먼저 있음
// GREEN: 최소한의 구현
function generateComponent(prompt: string): string {
  // 타입스크립트 제거
  return prompt.replace(/interface|type|as const/g, '');
}
```

**확인:**
```bash
npm test # 모든 테스트 통과?
```

### REFACTOR: 구조 개선 (동작 불변)

**규칙:**
- **GREEN 유지**: 모든 테스트 계속 통과해야 함
- 중복 제거, 이름 개선, 헬퍼 추출만
- **새로운 동작 추가 금지** (RED로 돌아가기)

**예시:**
```ts
// REFACTOR: 유틸 함수 추출
const TYPESCRIPT_PATTERNS = /interface|type|as const/g;

function generateComponent(prompt: string): string {
  return stripTypeScriptSyntax(prompt);
}

function stripTypeScriptSyntax(code: string): string {
  return code.replace(TYPESCRIPT_PATTERNS, '');
}
```

### 반복

다음 동작에 대해 **RED로 돌아가기**:

```
RED (새 테스트, 실패) → GREEN (구현, 통과) → REFACTOR (정리) → RED (다음 동작)
```

---

## 3. 삭제 강제 규칙

### 사전 작성 코드는 반드시 삭제

**상황:**
- 기능을 "참고용으로" 먼저 프로토타이핑한 후 TDD 적용

**처리:**
1. 프로덕션 코드 **전체 삭제**
2. RED부터 **재시작** (테스트 먼저)
3. "참고용이니까 남겨두자" = 금지

**이유:** 
- 테스트 없는 코드는 리팩토링 때 깨질 수 있음
- TDD는 안전망(테스트)이 있어야 의미 있음

---

## 4. 변명 차단표

| 변명 | 반론 |
|------|------|
| "너무 단순해서 테스트 불필요" | "단순할수록 테스트는 빨라진다. 5초면 충분." |
| "나중에 추가하겠다" | "나중은 오지 않는다. 지금 RED로 시작하라." |
| "시간이 없다" | "TDD가 더 빠르다. 버그 수정 시간 절감." |
| "삭제하면 낭비다" | "테스트 없는 코드는 이미 낭비다. 다시 쓰는 게 빠르다." |
| "프로토타입이니까" | "프로토타입도 동작해야 한다. RED-GREEN으로 충분." |

---

## 5. 프로젝트별 규칙 우선 조항

**이 파일(TDD.md)은 기본값(fallback)입니다.**

프로젝트의 다음 파일에 TDD 규칙이 있으면 **그것을 우선**합니다:

- `./CLAUDE.md` (프로젝트 루트)
- `./AGENTS.md` (프로젝트 루트)
- `./src/AGENTS.md` (프론트엔드 전용)
- `./server/AGENTS.md` (백엔드 전용)

**확인 순서:**
1. 프로젝트의 CLAUDE.md/AGENTS.md 읽기
2. TDD 관련 규칙 있으면 적용
3. 없으면 이 파일의 규칙 적용

---

## 6. 구현 체크리스트

새 기능/버그 수정 시:

- [ ] 테스트 작성 (RED: 실패 확인)
- [ ] 프로덕션 코드 작성 (GREEN: 통과)
- [ ] 리팩토링 (REFACTOR: 정리, GREEN 유지)
- [ ] 모든 테스트 실행 (기존 + 신규)
- [ ] 커밋 메시지에 테스트 추가 언급

---

## 참고: 프로젝트별 테스트 명령어

```bash
# React (src/)
bun run test
bun run test -- --coverage

# Backend (server/)
bun run server:test
```

테스트가 없으면 위 명령어 먼저 설정하세요.
