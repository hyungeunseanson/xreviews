# 01_PHASE_PROMPTS.md — Xreviews Codex Phase별 실행 프롬프트

이 파일은 Codex에게 단계별로 복붙해서 지시하기 위한 프롬프트 모음이다.

원칙은 하나다.

> 한 번에 전체를 만들지 말고, Phase 단위로 작게 만들고 검증한다.

각 Phase가 끝나면 반드시 typecheck/lint/test/build 중 가능한 검증을 실행하고 결과를 보고한다.

---

## 공통 지시문

모든 Phase 시작 전에 이 문장을 포함한다.

```txt
너는 Xreviews의 founding full-stack engineer다.
반드시 AGENTS.md와 codex-prompts/00_MASTER_BUILD_PROMPT.md의 Non-negotiable Rules를 따른다.
Xreviews는 긍정 리뷰를 받지 않는 부정 경험 전용 리뷰 플랫폼이다.
Supabase, Vercel, Pinecone은 금지다.
Cloudflare + Neon + Drizzle + BetterAuth + Resend + R2 중심으로 구현한다.
작업 범위를 이번 Phase에 한정하고, 다음 Phase 기능을 미리 만들지 마라.
“1점부터 본다”는 기존 플랫폼에서의 사용자 행동을 설명하는 카피일 뿐이며, Xreviews 자체에는 별점 UI를 만들지 마라.
```

---

# Phase 0 — Repo Scaffold & Cloudflare-ready 기본 구조

## Codex에게 줄 프롬프트

```txt
Phase 0을 구현해라.

목표:
Cloudflare 배포를 전제로 한 TypeScript/Next.js 기반 MVP repo scaffold를 만든다.

반드시 지킬 것:
- Vercel 설정을 만들지 마라.
- Supabase를 설치하지 마라.
- Pinecone을 설치하지 마라.
- Next.js App Router를 사용한다.
- Cloudflare Workers/Pages 배포를 염두에 둔다.
- OpenNext Cloudflare adapter를 사용할 수 있는 구조로 둔다.
- 패키지 매니저는 기존 repo에 있으면 그걸 따르고, 없으면 pnpm을 기본으로 한다.

구현할 것:
1. 기본 monorepo 구조를 만든다.
2. apps/web에 Next.js App Router 앱을 만든다.
3. TypeScript 설정을 만든다.
4. Tailwind CSS 기본 설정을 만든다.
5. 환경변수 검증 유틸을 만든다.
6. Cloudflare용 wrangler 설정 템플릿을 만든다.
7. README에 로컬 실행 방법을 쓴다.
8. Sentry/GA4/Clarity는 실제 키 없이 placeholder만 만든다.

Phase 0에서 하지 말 것:
- DB schema 구현 금지
- BetterAuth 실제 인증 구현 금지
- 리뷰 작성 기능 구현 금지
- 사업자 기능 구현 금지
- 랭킹 기능 구현 금지
- R2 실제 업로드 기능 구현 금지
- 관리자 모더레이션 기능 구현 금지
- Qdrant 연동 금지
- 실제 결제 연동 금지

권장 구조:
- apps/web/app
- apps/web/components
- apps/web/lib
- apps/web/server
- packages/shared
- packages/config
- packages/validators

완료 조건:
- `pnpm install` 또는 기존 패키지 매니저 설치가 가능해야 한다.
- `typecheck` 스크립트가 있어야 한다.
- 기본 홈 페이지가 렌더링되어야 한다.
- 홈 페이지 문구는 다음 방향을 반영해야 한다:
  “혹시 리뷰 볼 때, 1점부터 보시나요?”
  “좋은 후기는 이미 충분합니다.”
  “Xreviews는 사람들이 먼저 찾는 나쁜 후기만 모읍니다.”
- 별점 선택 UI가 없어야 한다.
- 긍정 리뷰/추천/칭찬 작성 CTA가 없어야 한다.

작업 후 보고:
- 생성/수정 파일 목록
- 실행한 명령
- 실패한 명령과 이유
- 다음 Phase에서 해야 할 일
```

## Acceptance Checklist

- [ ] Vercel 관련 파일 없음
- [ ] Supabase dependency 없음
- [ ] Pinecone dependency 없음
- [ ] Next.js App Router 구조 있음
- [ ] Cloudflare 배포 준비 파일 있음
- [ ] 홈 페이지에 Xreviews 브랜드 방향 반영

---

# Phase 1 — Neon Postgres + Drizzle Schema

## Codex에게 줄 프롬프트

```txt
Phase 1을 구현해라.

목표:
Neon Postgres와 Drizzle ORM 기반의 핵심 데이터 모델을 만든다.

반드시 지킬 것:
- DB는 Neon Postgres 기준이다.
- ORM은 Drizzle을 사용한다.
- Supabase를 사용하지 않는다.
- 모든 enum/status는 명시적으로 정의한다.
- 민감한 상태 변경을 위한 audit_logs 테이블을 반드시 만든다.

구현할 핵심 테이블:
1. users
2. accounts
3. sessions
4. verification_tokens
5. subject_categories
6. subjects
7. subject_locations
8. subject_aliases
9. risk_tags
10. reviews
11. review_tag_links
12. review_evidence
13. review_votes
14. review_reports
15. business_profiles
16. business_claims
17. business_responses
18. business_improvement_posts
19. business_subscriptions
20. moderation_cases
21. legal_requests
22. takedown_requests
23. audit_logs
24. risk_scores
25. subject_daily_stats
26. search_events
27. share_events

중요한 enum/status:
- subject category: medical_clinic, real_estate, auto_repair
- review status: draft, pending, published, disputed, hidden, removed
- evidence type: receipt, invoice, estimate, contract, photo, video, message, other
- business claim status: pending, approved, rejected, revoked
- moderation case status: open, under_review, resolved, rejected
- legal request status: received, reviewing, action_taken, rejected, closed

reviews 테이블 필수 필드:
- id
- subject_id
- user_id
- title
- body
- issue_summary
- status
- severity_score
- evidence_level
- positive_content_detected
- author_liability_confirmed
- is_medical_category
- created_at
- updated_at

review_evidence 필수 원칙:
- R2 object key만 저장한다.
- public URL을 기본 저장하지 않는다.
- 파일 접근은 private-by-default다.

추가 구현:
1. drizzle.config.ts
2. packages/db/schema.ts
3. packages/db/client.ts
4. seed script 또는 sql/002_seed_data.sql을 반영한 seed 파일
5. risk tag 기본 데이터

완료 조건:
- schema가 TypeScript에서 import 가능해야 한다.
- migration 생성 명령이 있어야 한다.
- seed 데이터 구조가 있어야 한다.
- SQL 참조 파일과 큰 충돌이 없어야 한다.

작업 후 보고:
- 생성/수정 파일 목록
- 실행한 명령
- 스키마 설계상 중요한 결정
- 다음 Phase 리스크
```

## Acceptance Checklist

- [ ] Drizzle schema 있음
- [ ] Neon connection helper 있음
- [ ] review status enum 있음
- [ ] audit_logs 있음
- [ ] evidence private-by-default 설계 반영
- [ ] MVP 3개 카테고리 seed 있음

---

# Phase 2 — BetterAuth + Resend 인증

## Codex에게 줄 프롬프트

```txt
Phase 2를 구현해라.

목표:
BetterAuth와 Resend 기반 인증 구조를 만든다.

반드시 지킬 것:
- Supabase Auth를 사용하지 않는다.
- Auth.js/NextAuth로 임의 변경하지 않는다.
- BetterAuth를 사용한다.
- 이메일 발송은 Resend를 사용한다.
- 로그인/회원가입 UX는 간결해야 한다.
- admin/business/user 역할을 구분할 수 있어야 한다.

구현할 것:
1. BetterAuth 설정 파일
2. Neon/Drizzle adapter 연결
3. 이메일 로그인 또는 magic link 구조
4. Resend 발송 helper
5. 세션 조회 helper
6. role check helper
7. 보호된 route middleware 또는 server helper
8. 로그인/회원가입 페이지
9. 로그아웃 기능

역할:
- user: 일반 사용자
- business: 공식 계정 사업자
- admin: 관리자

완료 조건:
- 사용자가 가입/로그인/로그아웃할 수 있다.
- 서버에서 현재 user/session을 조회할 수 있다.
- role check가 동작한다.
- Resend API key가 없어도 개발환경에서 mock/log 방식으로 실패하지 않아야 한다.

작업 후 보고:
- 인증 흐름 요약
- 변경 파일
- 실행한 명령
- known issue
```

## Acceptance Checklist

- [ ] BetterAuth 사용
- [ ] Resend helper 있음
- [ ] role check 있음
- [ ] Supabase Auth 없음
- [ ] protected route 있음

---

# Phase 3 — Subject 생성/검색/상세 페이지

## Codex에게 줄 프롬프트

```txt
Phase 3을 구현해라.

목표:
병원/부동산/카센터 대상(subject)을 생성, 검색, 조회할 수 있게 만든다.

반드시 지킬 것:
- MVP 카테고리는 medical_clinic, real_estate, auto_repair만 허용한다.
- 인물 리뷰 대상 생성은 금지한다.
- 검색은 처음에는 단순 Postgres 검색/ILIKE/FTS로 구현한다.
- Qdrant는 아직 붙이지 않는다.

구현할 것:
1. subject 생성 API
2. subject 검색 API
3. subject 상세 조회 API
4. subject 생성 페이지
5. 검색 페이지
6. subject 상세 페이지 skeleton
7. 카테고리별 태그 표시
8. 위치 정보는 선택값으로 둔다.

공개 상세 페이지에 표시할 것:
- subject 이름
- 카테고리
- 위치 요약
- X-risk score placeholder
- 반복 제보 태그 placeholder
- 공식 계정 인증 상태
- “이 대상의 불만 작성하기” CTA

완료 조건:
- 로그인 사용자가 subject를 생성할 수 있다.
- 누구나 subject를 검색할 수 있다.
- subject 상세 페이지가 SEO-friendly URL로 열린다.

작업 후 보고:
- API 목록
- UI 경로
- 변경 파일
- 테스트 결과
```

## Acceptance Checklist

- [ ] subject 생성 가능
- [ ] subject 검색 가능
- [ ] subject 상세 페이지 있음
- [ ] MVP 3개 카테고리만 허용
- [ ] 인물 대상 생성 불가

---

# Phase 4 — Complaint-only Review 작성 플로우

## Codex에게 줄 프롬프트

```txt
Phase 4를 구현해라.

목표:
Xreviews의 핵심인 부정 경험 전용 리뷰 작성 플로우를 만든다.

반드시 지킬 것:
- 긍정 리뷰는 허용하지 않는다.
- 별점 UI를 만들지 않는다.
- 신규 리뷰는 기본적으로 pending 상태다.
- 작성자는 허위 작성 시 책임 확인 체크박스를 반드시 체크해야 한다.
- positive review detector를 통과하지 못하면 제출을 막거나 재작성 안내를 보여준다.

구현할 것:
1. review creation API
2. review validation schema
3. positive-review-detector 로직
4. review 작성 페이지
5. risk tag 선택 UI
6. author liability confirmation checkbox
7. medical category warning copy
8. pending 상태 저장
9. subject 상세 페이지에 pending이 아닌 published 리뷰만 노출

positive-review-detector 기준:
- 칭찬만 있는 문장 차단
- 추천성 문장 차단
- “좋아요/친절해요/추천합니다/만족합니다” 중심이면 재작성 요청
- 문제 키워드가 없으면 재작성 요청
- 복합 리뷰는 issue_summary와 risk_tags가 있으면 허용 가능

리뷰 작성 UX 문구:
- “좋았던 점은 쓰지 마세요. 문제만 적어주세요.”
- “다른 사람이 피해야 할 포인트를 한 줄로 적어주세요.”
- “허위 사실 작성 시 법적 책임이 작성자에게 있음을 확인합니다.”

완료 조건:
- 부정 리뷰 작성 가능
- 긍정 리뷰 제출 차단
- liability checkbox 미체크 시 제출 차단
- 작성된 리뷰는 pending으로 저장

작업 후 보고:
- 차단 로직 설명
- API 변경 사항
- UI 변경 사항
- 테스트 케이스
```

## Acceptance Checklist

- [ ] 긍정 리뷰 차단
- [ ] 별점 없음
- [ ] 책임 확인 체크박스 있음
- [ ] pending 상태 저장
- [ ] published만 공개 노출

---

# Phase 5 — Cloudflare R2 증거 업로드

## Codex에게 줄 프롬프트

```txt
Phase 5를 구현해라.

목표:
증거 파일 업로드 구조를 만든다. 증거는 Xreviews의 방탄 시스템이므로 private-by-default 원칙을 반드시 지킨다.

반드시 지킬 것:
- Cloudflare R2를 사용한다.
- S3/Supabase Storage를 사용하지 않는다.
- evidence 파일은 public URL로 저장하지 않는다.
- DB에는 R2 object key와 메타데이터만 저장한다.
- evidence 접근은 권한 체크를 거친다.

구현할 것:
1. R2 binding 타입 정의
2. upload URL 발급 API 또는 Workers-compatible upload endpoint
3. review_evidence metadata create API
4. file type/size validation
5. evidence 목록 조회 API
6. 관리자/작성자/관련 사업자만 민감 증거 접근 가능하게 helper 작성
7. UI에서 리뷰 작성 중 evidence 업로드 영역 추가

허용 파일 타입 예시:
- image/jpeg
- image/png
- image/webp
- application/pdf

증거 유형:
- receipt
- invoice
- estimate
- contract
- photo
- video
- message
- other

완료 조건:
- 리뷰 작성 중 evidence metadata를 연결할 수 있다.
- R2 object key는 private 방식으로 저장된다.
- public evidence URL이 기본 노출되지 않는다.

작업 후 보고:
- R2 설계 요약
- 권한 모델
- 변경 파일
- 테스트 결과
```

## Acceptance Checklist

- [ ] R2 사용
- [ ] evidence private-by-default
- [ ] metadata 저장
- [ ] 권한 체크 있음
- [ ] public URL 기본 노출 없음

---

# Phase 6 — Admin Moderation Queue

## Codex에게 줄 프롬프트

```txt
Phase 6을 구현해라.

목표:
관리자 모더레이션 큐를 만들어 리뷰 승인/숨김/분쟁/삭제 처리를 할 수 있게 한다.

반드시 지킬 것:
- 리뷰는 관리자 승인 전 공개되지 않는다.
- 모든 관리자 액션은 audit_logs에 남긴다.
- admin role이 없는 사용자는 접근할 수 없다.
- 삭제는 hard delete보다 removed 상태 변경을 기본으로 한다.

구현할 것:
1. admin review queue page
2. pending/disputed/hidden/removed 필터
3. review status update API
4. moderation_cases 생성/수정 API
5. audit log helper
6. 신고된 리뷰 목록
7. 관리자 메모 필드

관리자 액션:
- approve: pending → published
- dispute: published/pending → disputed
- hide: published → hidden
- remove: any → removed
- reject report
- request evidence

완료 조건:
- admin만 큐 접근 가능
- status 변경 가능
- audit log 기록 확인 가능
- published 리뷰만 public page에 노출

작업 후 보고:
- 관리자 플로우 요약
- audit log 기록 방식
- 변경 파일
- 테스트 결과
```

## Acceptance Checklist

- [ ] admin role check
- [ ] status 변경 가능
- [ ] audit log 있음
- [ ] hard delete 기본 금지
- [ ] published만 공개

---

# Phase 7 — Business Official Account / Blue Badge

## Codex에게 줄 프롬프트

```txt
Phase 7을 구현해라.

목표:
사업자 공식 계정, 블루배지, 공식 답변, 개선 포스트 기능을 만든다.

반드시 지킬 것:
- 사업자는 리뷰를 삭제할 수 없다.
- 사업자 구독은 대응권/개선권/분석권이지 삭제권이 아니다.
- 공식 답변과 개선 포스트는 public page에 별도 영역으로 표시한다.
- 사업자 인증은 pending → approved 흐름으로 간다.

구현할 것:
1. business claim 신청 API/page
2. admin business claim approval API/page
3. business profile page
4. official badge 표시
5. business response create/edit API
6. improvement post create/edit API
7. subject 상세 페이지에 공식 답변/개선 포스트 표시
8. business subscription skeleton

구독 플랜 skeleton:
- Free Claim: 0원
- Official Basic: 월 4,900원
- Official Pro: 월 29,000원
- Multi-location: 별도

중요:
- 실제 결제 연동은 이번 Phase에서 하지 않아도 된다.
- 단, DB 구조와 UI skeleton은 만든다.

완료 조건:
- 사업자가 subject claim 신청 가능
- admin이 승인 가능
- 승인된 사업자는 공식 답변 작성 가능
- 승인된 사업자는 개선 포스트 작성 가능
- subject 페이지에 공식 배지 표시

작업 후 보고:
- 사업자 플로우 요약
- 삭제권 방지 로직
- 변경 파일
- 테스트 결과
```

## Acceptance Checklist

- [ ] business claim 가능
- [ ] admin 승인 가능
- [ ] official badge 표시
- [ ] 공식 답변 가능
- [ ] 개선 포스트 가능
- [ ] 사업자 리뷰 삭제권 없음

---

# Phase 8 — Risk Score & Rankings

## Codex에게 줄 프롬프트

```txt
Phase 8을 구현해라.

목표:
X-risk score와 랭킹 페이지를 만든다. 자극적이지만 법적 표현은 정밀하게 유지한다.

반드시 지킬 것:
- 별점 평균을 만들지 않는다.
- 긍정 리뷰를 점수에 반영하지 않는다.
- published 리뷰만 랭킹에 반영한다.
- 위험한 단정 표현 대신 “불만 급증”, “반복 제보”, “의심 제보”처럼 제보 기반 표현을 사용한다.

구현할 것:
1. risk score calculation helper
2. subject_daily_stats update job placeholder
3. rankings API
4. category ranking pages
5. home page ranking sections
6. tag aggregation display

랭킹 예시:
- 이번 주 불만이 가장 많이 쌓인 병원
- 가격/상담 불만 급증 클리닉
- 허위매물 의심 제보 부동산
- 과잉수리 의심 제보 카센터

Risk score 고려 요소:
- published complaint count
- severity_score
- evidence_level
- repeated risk tags
- recency
- disputed/hidden discount
- business resolved/improvement signal discount

완료 조건:
- 공개된 리뷰 기반으로 랭킹 표시
- subject 상세에 X-risk score 표시
- 홈 화면에 랭킹 카드 표시

작업 후 보고:
- 점수 계산 방식
- 랭킹 API
- 변경 파일
- 테스트 결과
```

## Acceptance Checklist

- [ ] 별점 없음
- [ ] published 리뷰만 반영
- [ ] risk score 있음
- [ ] 랭킹 페이지 있음
- [ ] 자극적이지만 정밀한 카피 사용

---

# Phase 9 — Observability, Analytics, Deployment Runbook

## Codex에게 줄 프롬프트

```txt
Phase 9를 구현해라.

목표:
Sentry, GA4, Clarity placeholder와 Cloudflare/Neon 배포 런북을 완성한다.

반드시 지킬 것:
- 실제 secret을 코드에 넣지 않는다.
- 환경변수는 .env.example에만 예시로 둔다.
- 배포 문서는 Cloudflare + Neon 기준이다.
- Vercel 배포 설명을 쓰지 않는다.
- Supabase 설정 설명을 쓰지 않는다.

구현할 것:
1. Sentry init placeholder
2. GA4 script placeholder
3. Microsoft Clarity script placeholder
4. analytics event helper
5. 핵심 이벤트 tracking skeleton
6. deployment README 업데이트
7. env validation 강화
8. wrangler 설정 문서화
9. Neon migration 문서화

핵심 이벤트:
- search_performed
- subject_viewed
- review_started
- review_submitted
- positive_review_blocked
- evidence_uploaded
- business_claim_started
- business_response_created
- moderation_action_taken
- ranking_clicked

완료 조건:
- env가 없어도 로컬 개발이 가능해야 한다.
- production에서는 필요한 env 누락 시 명확한 에러를 낸다.
- 배포 절차가 README 또는 docs에 명확히 정리되어 있다.

작업 후 보고:
- observability 구조
- analytics 이벤트 목록
- 배포 절차
- 변경 파일
```

## Acceptance Checklist

- [ ] Sentry placeholder
- [ ] GA4 placeholder
- [ ] Clarity placeholder
- [ ] 이벤트 helper
- [ ] Cloudflare 배포 문서
- [ ] Neon migration 문서
- [ ] Vercel 설명 없음

---

# Phase 10 — QA, Security Hardening, Final MVP Pass

## Codex에게 줄 프롬프트

```txt
Phase 10을 구현해라.

목표:
MVP 전체를 QA하고 보안/권한/제품 규칙 위반을 잡는다.

반드시 확인할 것:
- 긍정 리뷰 차단이 실제로 작동하는가?
- 별점 UI가 어디에도 없는가?
- 리뷰가 승인 없이 공개되지 않는가?
- 사업자가 리뷰를 삭제할 수 없는가?
- evidence가 public-by-default가 아닌가?
- admin 액션이 audit log에 남는가?
- 인물 리뷰 생성 경로가 없는가?
- Supabase/Vercel/Pinecone dependency가 없는가?
- 모든 API input validation이 있는가?
- role check가 빠진 관리자/사업자 API가 없는가?

구현할 것:
1. QA checklist 문서 업데이트
2. 핵심 validation test 추가
3. positive-review-detector test 추가
4. role check test 추가
5. review visibility test 추가
6. dependency audit
7. dead route cleanup
8. final README 업데이트

완료 조건:
- typecheck 통과
- lint 통과 또는 known issue 명시
- 핵심 테스트 통과
- MVP acceptance checklist 대부분 완료
- 남은 이슈는 TODO로 명확히 정리

작업 후 보고:
- 최종 MVP 상태
- 통과한 테스트
- 실패한 테스트와 이유
- 남은 P1/P2 작업
```

## Acceptance Checklist

- [ ] positive review block test
- [ ] role check test
- [ ] pending review visibility test
- [ ] dependency audit
- [ ] final README
- [ ] no prohibited stack

---

# 긴급 수정 프롬프트 — Codex가 방향을 벗어났을 때

```txt
Stop. 방향이 틀어졌다.

다시 원칙을 적용해라:
1. Xreviews는 긍정 리뷰를 받지 않는다.
2. 별점 기반 리뷰 서비스가 아니다.
3. Supabase, Vercel, Pinecone은 금지다.
4. 사업자는 리뷰를 삭제할 수 없다.
5. 증거 파일은 private-by-default다.
6. 리뷰는 승인 전 공개되지 않는다.
7. 관리자/사업자/작성자 권한 체크가 필요하다.
8. 민감한 액션은 audit_logs에 기록한다.

지금 만든 변경사항 중 위 원칙을 위반하는 부분을 찾아 수정하고,
수정 파일 목록과 이유를 보고해라.
```

---

# 코드 리뷰 프롬프트

```txt
이번 PR/변경사항을 Xreviews 기준으로 리뷰해라.

검토 기준:
- 제품 헌법 위반 여부
- 긍정 리뷰 차단 여부
- Supabase/Vercel/Pinecone 사용 여부
- 권한 체크 누락 여부
- audit log 누락 여부
- evidence private-by-default 위반 여부
- 리뷰 공개 상태 처리 오류 여부
- 사업자 삭제권 발생 여부
- Cloudflare/Neon 배포 호환성
- 불필요한 복잡성

결과는 다음 형식으로 작성해라:
1. Critical Issues
2. Major Issues
3. Minor Issues
4. Suggested Fixes
5. Merge Recommendation
```

---

# 버그 수정 프롬프트

```txt
아래 버그를 수정해라.

버그:
[여기에 버그 설명]

제약:
- 이번 버그와 직접 관련 없는 리팩터링 금지
- 제품 헌법 위반 금지
- 수정 후 재현 단계와 검증 결과를 보고
- 가능하면 regression test 추가

보고 형식:
- 원인
- 수정 내용
- 변경 파일
- 검증 결과
- 남은 위험
```

---

# 새 기능 추가 프롬프트

```txt
아래 기능을 추가해라.

기능:
[여기에 기능 설명]

먼저 확인할 것:
- 이 기능이 긍정 리뷰 금지 원칙을 위반하는가?
- 사업자에게 리뷰 삭제권을 주는가?
- 개인정보/명예훼손/의료 영역 리스크를 키우는가?
- Cloudflare + Neon + 0원 운영 원칙에 맞는가?

위반 요소가 있으면 구현 전에 대안을 제시해라.
문제가 없으면 작게 구현하고, 변경 파일/검증 결과를 보고해라.
```
