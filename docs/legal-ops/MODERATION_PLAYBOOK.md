# Xreviews Moderation Playbook

> Draft for closed beta operations. This document is a product/legal-ops working draft and does not replace advice from a licensed attorney.

## 1. Moderator mission

Moderators keep Xreviews sharp and defensible.

Do not water down the product into a generic review app. Do make every public complaint experience-based, evidence-aware, privacy-safe, and auditable.

## 2. Pending review checklist

Before approving a pending complaint, check:

- Is it based on an actual consumer experience?
- Does it contain at least one concrete problem?
- Is it complaint-focused rather than praise-focused?
- Is the category allowed?
- Are risk tags relevant?
- Did the author confirm liability?
- Is there personal data?
- Are there definitive criminal claims?
- Are there insults or harassment?
- Are medical claims process-based rather than diagnosis/effect-based?
- Is evidence present for serious claims?

## 3. Approve criteria

Use `published` when:

- complaint is clear and problem-focused
- no prohibited personal data
- no definitive criminal/medical claim
- no harassment or slurs
- risk tags match category
- wording is experience-based
- evidence level is appropriate or not required for the claim level

## 4. Hide criteria

Use `hidden` when:

- personal data requires redaction
- claim is high-risk and needs review
- evidence leak risk exists
- legal request is active
- medical wording needs rewrite
- harassment risk is present

Hidden reviews are not public.

## 5. Dispute criteria

Use `disputed` when:

- business submits a substantive challenge
- facts are unclear
- author evidence is requested
- official response is pending
- legal/rights review is ongoing

Disputed reviews should not appear on public pages unless a future explicit policy supports public dispute labeling. Current beta default: not public.

## 6. Remove criteria

Use `removed` when:

- content is fabricated or clearly unsupported after review
- serious personal data cannot be safely redacted
- content is harassment
- content makes reckless criminal/medical claims
- user refuses required rewrite
- legal risk requires non-public status

Removal is a status change. Do not hard delete in normal moderation.

## 7. Evidence review

Evidence files are private-by-default.

Moderators may access evidence only for review, dispute, legal, and safety purposes.

Check:

- file type and size
- relevance to complaint
- whether personal data is visible
- whether evidence supports the specific claim
- whether the file appears manipulated

Do not publish evidence files or object keys.

## 8. Medical clinic review

Allowed focus:

- consultation
- price explanation
- refund/contract
- waiting
- hygiene/facility
- ad mismatch
- pressure sales

High-risk wording:

- "wrong diagnosis"
- "malpractice"
- "treatment caused injury"
- "quack"
- "fraud hospital"

Moderator action:

- request rewrite into consumer-process language
- hide if immediate risk
- remove if the author refuses or risk remains

## 9. Real estate review

Allowed focus:

- suspected fake listing
- price change
- management fee mismatch
- room condition mismatch
- contract pressure
- photo/reality mismatch

Watch for:

- landlord/tenant private personal data
- exact residential unit details
- unsupported criminal labels
- competitor abuse

## 10. Auto repair review

Allowed focus:

- suspected over-repair
- estimate mismatch
- recurring issue
- parts explanation gap
- repair without prior consent
- weak invoice/specification

Evidence such as estimates, invoices, and messages is especially useful.

## 11. Business claim review

Approve only when:

- subject relationship is plausible
- applicant contact is reachable
- business name matches subject context
- duplicate approved claim does not exist
- no abuse signal is present

Reject or keep pending when:

- relationship is unclear
- applicant appears unrelated
- claim is competitor-driven
- contact details are suspicious
- documentation is insufficient

Revoke when:

- claim was fraudulent
- business account abuses reply rights
- official status creates safety/legal risk
- ownership changed and cannot be confirmed

## 12. Moderator checklist before action

- Choose status: `published`, `hidden`, `disputed`, or `removed`
- Add reason
- Add admin note
- Avoid hard delete
- Confirm audit log is written
- If evidence viewed, confirm evidence access log is written
- If legal/privacy risk exists, open or update a moderation/legal case

