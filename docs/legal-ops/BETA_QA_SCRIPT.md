# Xreviews Beta QA Script

> Draft for closed beta operations. This document is a product/legal-ops working draft and does not replace advice from a licensed attorney.

## 1. QA rules

Use real experiences or clearly labeled test subjects. Do not fabricate public complaints about real businesses.

When using test data, keep it obviously non-real.

## 2. Search flow

Scenario:

1. Open home page.
2. Click search or ranking entry point.
3. Search for a hospital/clinic, real estate agency, or auto repair shop.
4. Filter by category.
5. Open a subject detail page.

Expected:

- only MVP categories appear
- no person category appears
- public page shows published complaints only
- no evidence object key or URL appears
- X-risk score is not shown like a star rating

## 3. Subject creation

Scenario:

1. Log in.
2. Open subject creation.
3. Create one test subject in each allowed category.
4. Try to create a person/individual subject.

Expected:

- logged-out user is redirected to login
- allowed categories: `medical_clinic`, `real_estate`, `auto_repair`
- person/individual subject is blocked
- copy says Xreviews handles problem experiences, not praise

## 4. Complaint creation

Scenario:

1. Open subject detail.
2. Click complaint creation CTA.
3. Fill title, issue summary, body, risk tag, severity, liability checkbox.
4. Submit.

Expected:

- logged-out user is redirected to login
- risk tag is required
- liability checkbox is required
- valid complaint saves as `pending`
- public subject page does not show pending complaint
- submitted page says admin review is required

## 5. Positive review block

Submit each:

- 좋아요
- 친절해요
- 추천합니다
- 만족합니다
- 최고예요
- 또 갈게요

Expected:

- submission is blocked
- message says Xreviews does not accept good reviews
- no public complaint is created

Mixed complaint test:

- "상담은 친절했지만 결제 금액이 처음 안내와 달랐습니다."
- "시설은 괜찮았지만 환불 안내가 불명확했습니다."

Expected:

- allowed if it includes concrete problem signals and required fields

## 6. Medical guardrail

For `medical_clinic`, try:

- treatment effect definitive claim
- wrong diagnosis definitive claim
- malpractice definitive claim
- side-effect causation definitive claim
- personal doctor attack
- insulting label

Expected:

- blocked or rewrite guidance shown
- guidance asks user to focus on consultation, price, refund, waiting, hygiene, ad mismatch, or pressure sales

## 7. Evidence upload

Scenario:

1. Add allowed evidence file type.
2. Check file name/type/size display.
3. Submit complaint with evidence.

Expected:

- allowed types: JPEG, PNG, WebP, PDF
- files over 10MB blocked
- metadata saved
- evidence attaches to review after submission
- evidence level becomes non-zero
- public page does not show object key, upload URL, signed URL, or public URL

## 8. Admin moderation

Scenario:

1. Promote admin via CLI.
2. Log in as admin.
3. Open admin review queue.
4. Approve a pending complaint.
5. Hide/dispute/remove a complaint.

Expected:

- only admin can access admin routes
- approve moves status to `published`
- hidden/disputed/removed are not public
- no hard delete occurs
- audit logs are written

## 9. Business reply

Scenario:

1. Submit a business claim.
2. Admin approves claim.
3. Business opens dashboard.
4. Business responds to a published complaint.
5. Business creates improvement post.

Expected:

- business can manage only approved subject
- business cannot delete, hide, dispute, remove, or change review status
- official response appears under published complaint
- improvement post appears in separate section

## 10. Ranking

Scenario:

1. Open `/rankings`.
2. Open each category ranking.
3. Compare subjects with pending-only and published complaints.

Expected:

- only published complaints affect ranking
- pending/hidden/disputed/removed are excluded
- copy uses "반복 제보", "불만 급증", "의심 제보", not definitive insults
- no star rating UI appears

## 11. Report results

Capture:

- tester name/email
- environment
- browser/device
- scenario ID
- expected result
- actual result
- screenshot if safe
- whether personal data appears

