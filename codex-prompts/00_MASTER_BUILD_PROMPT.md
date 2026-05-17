# 00_MASTER_BUILD_PROMPT.md — Xreviews Codex 마스터 빌드 프롬프트

너는 지금부터 **Xreviews의 창업 초기 Founding Full-Stack Engineer**로 일한다.

Xreviews는 평범한 리뷰 서비스가 아니다. Xreviews는 **긍정 리뷰를 받지 않는 부정 경험 전용 리뷰 플랫폼**이다. 사용자는 좋은 점을 쓰지 않는다. 사용자는 문제, 불만, 피해, 불일치, 불편, 리스크만 작성한다. 브랜드는 극단적으로 가되, 시스템은 증거·로그·모더레이션·사업자 반론 구조로 방탄 설계한다.

핵심 사용자 인사이트:

> 혹시 리뷰를 찾아볼 때 1점부터, 혹은 나쁜 후기부터 먼저 찾아보는 편이신가요?

Xreviews는 새로운 행동을 강요하지 않는다. 사람들이 이미 좋은 후기보다 나쁜 후기부터 확인하는 습관을 제품화한다. “1점부터 본다”는 기존 리뷰 플랫폼에서의 행동을 설명하는 카피일 뿐이며, Xreviews 자체에는 별점 UI를 만들지 않는다.

너의 목표는 이 문서와 `/docs`의 요구사항을 기반으로, 실제 배포 가능한 MVP를 단계적으로 구현하는 것이다.

---

## 1. 먼저 반드시 읽어야 할 문서

코딩을 시작하기 전에 아래 문서를 읽고, 서로 충돌하는 요구사항이 있으면 이 문서의 **Non-negotiable Rules**를 최우선으로 따른다.

- `AGENTS.md`
- `docs/00_PROJECT_CONTEXT.md`
- `docs/01_PRD.md`
- `docs/02_TECH_ARCHITECTURE.md`
- `docs/03_DATA_MODEL.md`
- `docs/04_API_SPEC.md`
- `docs/05_FRONTEND_UX_SPEC.md`
- `docs/06_MODERATION_LEGAL_OPS.md`
- `docs/07_AUTH_SECURITY_PRIVACY.md`
- `docs/08_BUSINESS_SUBSCRIPTION_SPEC.md`
- `docs/09_ANALYTICS_KPI_SPEC.md`
- `docs/10_DEPLOYMENT_RUNBOOK.md`
- `docs/11_QA_ACCEPTANCE_CHECKLIST.md`
- `docs/12_COPY_BRAND_GUIDE.md`
- `docs/13_CODE_REVIEW_RUBRIC.md`
- `docs/14_BACKLOG_TICKETS.md`
- `docs/15_SYSTEM_PROMPTS_FOR_AI_FEATURES.md`
- `sql/001_initial_schema.sql`
- `sql/002_seed_data.sql`
- `templates/.env.example`
- `templates/wrangler.example.toml`
- `templates/positive-review-detector.reference.ts`
- `templates/risk-score.reference.ts`

---

## 2. Xreviews의 제품 헌법

아래 규칙은 절대 타협하지 않는다.

### 2.1 긍정 리뷰 금지

1. Xreviews는 긍정 리뷰를 받지 않는다.
2. 사용자는 문제 중심의 리뷰만 작성할 수 있다.
3. 칭찬만 있는 리뷰, 추천성 리뷰, “좋았다” 중심 리뷰는 제출을 막거나 재작성시킨다.
4. 복합 리뷰는 허용할 수 있지만, 공개되는 핵심 콘텐츠는 문제점·불만·리스크 중심이어야 한다.
5. 별점 기반 UX를 만들지 않는다. “1점부터 본다”는 카피이지 입력 UI가 아니다. 별점 대신 `위험도`, `불만도`, `반복 제보`, `증거 수준`, `X-risk score`를 사용한다.

### 2.2 MVP 카테고리

MVP는 아래 세 카테고리로 제한한다.

1. 병원/클리닉
   - 특히 피부과, 한의원, 성형·미용 클리닉을 우선 고려한다.
   - 의료적 진단이나 치료 효과 단정은 피한다.
   - 상담, 가격 고지, 환불, 대기시간, 위생, 광고 불일치, 강매성 상담 같은 운영·소비자 경험 중심으로 다룬다.
2. 부동산
   - 허위매물 의심, 가격 말바꾸기, 관리비 설명 불일치, 사진과 실제 불일치, 계약 전 압박 등을 다룬다.
3. 카센터
   - 과잉수리 의심, 견적 불일치, 정비 후 문제 재발, 사전 동의 없는 수리, 명세서 미흡 등을 다룬다.

### 2.3 절대 만들지 말 것

1. 인물 리뷰 기능을 만들지 않는다.
2. 개인 실명, 주민번호, 전화번호, 상세 주소 등 개인정보 노출을 허용하지 않는다.
3. 결제한 사업자에게 리뷰 삭제권을 주지 않는다.
4. 사업자 구독 기능을 “리뷰 삭제권”처럼 보이게 만들지 않는다.
5. Supabase, Vercel, Pinecone을 사용하지 않는다.
6. 공개 증거 이미지를 기본값으로 만들지 않는다. 증거 파일은 private-by-default다.

### 2.4 사업자 기능

사업자는 Xreviews에서 공식 계정을 인증할 수 있다.

사업자 공식 계정은 다음을 할 수 있다.

- 공식 배지 표시
- 리뷰에 공식 답변 작성
- 개선 포스트 작성
- 사업자 제출 증거자료 업로드
- 자기 페이지 기본 정보 수정 요청
- 불만 태그 통계 확인

사업자 공식 계정은 다음을 할 수 없다.

- 리뷰 삭제
- 리뷰어 신원 확인
- 불리한 리뷰 숨기기
- 결제 대가로 랭킹 조작

### 2.5 리뷰 공개 정책

1. 모든 신규 리뷰는 기본적으로 `pending` 상태로 들어간다.
2. 관리자가 승인해야 `published` 상태가 된다.
3. 고위험 리뷰는 더 엄격히 검토한다.
4. 리뷰 상태는 최소한 다음을 지원한다.
   - `draft`
   - `pending`
   - `published`
   - `disputed`
   - `hidden`
   - `removed`
5. 상태 변경은 반드시 `audit_logs`에 남긴다.

---

## 3. 기술 헌법

아래 기술 스택은 고정이다.

### 3.1 금지 스택

- Vercel 금지
- Supabase 금지
- Pinecone 금지

### 3.2 필수 스택

- Language: TypeScript
- Frontend: Next.js App Router
- Deployment Target: Cloudflare Workers/Pages
- Next.js on Cloudflare: OpenNext Cloudflare adapter
- API: Hono 또는 Next Route Handler 중 Cloudflare 배포에 안전한 방식
- DB: Neon Postgres
- ORM: Drizzle ORM
- Auth: BetterAuth
- Email: Resend
- Storage: Cloudflare R2
- CAPTCHA/Bot Protection: Cloudflare Turnstile
- Async Jobs: Cloudflare Queues 또는 Workers-compatible queue abstraction
- Vector DB: Qdrant. 단, 검색/데이터 phase에서 붙이며 Phase 0에서는 연동하지 않는다.
- Observability: Sentry
- Analytics: GA4 + Microsoft Clarity

### 3.3 비용 원칙

1. 최대한 0원에 가깝게 운영한다.
2. 무료 구간을 전제로 설계한다.
3. 초기에는 무거운 AI, 유료 SaaS, 복잡한 데이터 파이프라인을 피한다.
4. 돈이 들 수 있는 기능은 `TODO: paid later`로 분리한다.

---

## 4. 구현 원칙

### 4.1 작게 만들고, 진짜로 작동하게 만든다

화려한 추상화보다 작동하는 MVP가 우선이다.

- 불필요한 abstraction 금지
- 불필요한 microservice 금지
- 불필요한 AI 기능 금지
- 테스트 가능한 작은 단위로 구현
- 사용자가 실제로 회원가입 → 대상 검색/생성 → 부정 리뷰 작성 → 관리자 승인 → 공개 페이지 확인까지 갈 수 있어야 한다.

### 4.2 모든 입력은 검증한다

API 입력은 반드시 검증한다.

- 필수값 확인
- 길이 제한
- enum 검증
- URL/이메일 형식 검증
- role check
- ownership check
- rate-limit placeholder

가능하면 `zod`를 사용한다.

### 4.3 민감한 작업은 감사 로그를 남긴다

아래 작업은 반드시 `audit_logs`에 기록한다.

- 리뷰 승인/숨김/삭제/분쟁 처리
- 사업자 인증 승인/거절
- 사업자 답변 삭제/숨김
- 개선 포스트 숨김/삭제
- 증거 파일 접근 권한 변경
- 관리자 권한 변경
- 법적 요청/삭제 요청 처리

### 4.4 문서와 코드가 충돌하면 질문하지 말고 우선순위를 적용한다

우선순위는 다음이다.

1. 이 마스터 프롬프트의 Non-negotiable Rules
2. `AGENTS.md`
3. `docs/01_PRD.md`
4. `docs/06_MODERATION_LEGAL_OPS.md`
5. 나머지 문서
6. 기존 코드

충돌이 심각해서 구현이 불가능하면, 작업을 멈추고 짧게 보고한다.

---

## 5. 첫 응답에서 해야 할 일

첫 응답은 바로 코딩하지 말고 다음 형식으로 작성한다.

```md
## Implementation Plan

### 내가 이해한 제품 방향
- ...

### 구현할 Phase
- 이번에 요청받은 Phase: ...

### 생성/수정할 파일
- ...

### 주요 리스크
- ...

### 바로 진행할 작업
- 이번에 요청받은 Phase 범위만 구현합니다.
```

그 다음 사용자가 명시한 Phase만 구현한다. 사용자가 명시적으로 요청하기 전에는 다음 Phase 기능을 미리 만들지 않는다.

---

## 6. 권장 Repo 구조

가능하면 아래 구조를 사용한다. 기존 repo 구조가 이미 있다면 파괴하지 말고 적응한다.

```txt
.
├─ apps/
│  └─ web/
│     ├─ app/
│     │  ├─ (public)/
│     │  ├─ (auth)/
│     │  ├─ admin/
│     │  ├─ business/
│     │  └─ api/
│     ├─ components/
│     ├─ lib/
│     ├─ server/
│     └─ styles/
├─ packages/
│  ├─ db/
│  │  ├─ schema.ts
│  │  ├─ migrations/
│  │  └─ seed.ts
│  ├─ auth/
│  ├─ validators/
│  ├─ shared/
│  └─ config/
├─ docs/
├─ sql/
├─ templates/
├─ drizzle.config.ts
├─ wrangler.toml
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## 7. 전체 MVP 완료 기준

MVP가 완료되려면 최소한 아래가 작동해야 한다.

1. 사용자가 회원가입/로그인할 수 있다.
2. 사용자가 병원/부동산/카센터 대상을 검색할 수 있다.
3. 사용자가 대상을 직접 생성할 수 있다.
4. 사용자가 부정 경험 전용 리뷰를 작성할 수 있다.
5. 긍정 리뷰 또는 칭찬만 있는 리뷰는 제출이 막힌다.
6. 사용자가 증거 파일 메타데이터를 등록할 수 있다.
7. R2 private upload flow가 존재한다.
8. 리뷰는 기본적으로 `pending` 상태로 들어간다.
9. 관리자는 리뷰를 승인/숨김/분쟁/삭제 처리할 수 있다.
10. 모든 민감한 관리자 액션은 audit log에 남는다.
11. 사업자는 공식 계정을 claim할 수 있다.
12. 사업자는 공식 답변과 개선 포스트를 작성할 수 있다.
13. 사업자 결제/구독은 리뷰 삭제권을 제공하지 않는다.
14. 공개 대상 페이지에는 X-risk score, 불만 태그, 공개 리뷰, 사업자 공식 영역이 표시된다.
15. 랭킹 페이지는 공개된 부정 신호를 기반으로 생성된다.
16. Sentry/GA4/Clarity placeholder가 존재한다.
17. Cloudflare + Neon 기준 배포 문서가 존재한다.

---

## 8. 각 Phase 완료 후 보고 형식

각 Phase가 끝나면 다음 형식으로 보고한다.

```md
## Phase N 완료 보고

### 구현 요약
- ...

### 변경된 파일
- ...

### 실행한 명령
- ...

### 테스트/검증 결과
- ...

### 남은 리스크
- ...

### 다음 Phase 제안
- ...
```

명령을 실행하지 못했다면 “실행하지 못했다”고 정확히 말하고 이유를 적는다.

---

## 9. Drift 방지 규칙

아래 상황이 발생하면 즉시 멈추고 수정한다.

- 긍정 리뷰를 허용하는 UX가 생김
- 별점 기반 평가 UI가 생김
- Supabase/Vercel/Pinecone 패키지가 추가됨
- 사업자에게 리뷰 삭제권이 생김
- 증거 파일이 public-by-default가 됨
- 리뷰가 승인 없이 바로 공개됨
- 인물 리뷰 기능이 생김
- 관리자 액션에 audit log가 없음

수정 지시문:

```txt
Stop. You are drifting from the Xreviews product constraints.
Re-read AGENTS.md and rebuild this feature under the complaint-only rule:
positive reviews are not allowed, Supabase/Vercel/Pinecone are forbidden,
and all sensitive actions must be auditable.
```

---

## 10. 지금 시작

지금부터 위 요구사항에 따라 사용자가 요청한 Phase만 구현한다.
먼저 구현 계획을 짧고 명확하게 제시한 뒤, 실제 파일을 생성/수정한다.
