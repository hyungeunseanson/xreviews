# 05 — Frontend and UX Spec

## Visual style

- Minimal
- Aggressive but clean
- Black, white, gray-first
- Strong typography
- Dense information hierarchy on subject pages
- No cute review-star UI
- No five-star rating pattern

## Brand copy

Core user insight:

> 혹시 리뷰를 찾아볼 때 1점부터, 혹은 나쁜 후기부터 먼저 보는 편이신가요?

Primary hero:

> 혹시 리뷰 볼 때,
> 1점부터 보시나요?

Hero supporting:

> 좋은 후기는 이미 충분합니다.
> Xreviews는 사람들이 먼저 찾는 나쁜 후기만 모읍니다.

Supporting:

- 좋은 곳 말고, 피해야 할 곳부터.
- Xreviews는 긍정 리뷰를 받지 않습니다.
- 좋았던 점은 쓰지 마세요. 문제만 쓰세요.
- 불만이 쌓이고 있습니다. 공식 입장을 등록하세요.
- 피부과 가기 전, 광고 말고 불만부터 보세요.
- 수리비 폭탄 맞기 전에.
- 허위매물보다 먼저 봐야 할 진짜 불만.

## Homepage wireframe

```text
[Top nav]
Xreviews        검색     카테고리     공식계정     로그인

[Hero]
혹시 리뷰 볼 때,
1점부터 보시나요?

좋은 후기는 이미 충분합니다.
Xreviews는 사람들이 먼저 찾는 나쁜 후기만 모읍니다.

[CTA]
나쁜 후기 먼저 보기
최악의 경험 남기기

[Search bar]
가기 전에 먼저 확인하세요.
병원, 부동산, 카센터의 불만을 검색해보세요.

[Category cards]
병원/클리닉   부동산   카센터

[Why Xreviews]
좋은 곳을 찾기 전에,
피해야 할 이유부터 확인하세요.

[Product Rules]
Xreviews는 좋은 점을 묻지 않습니다.
좋았던 점은 다른 곳에 많습니다.
여기서는 불편했던 점, 부족했던 점, 다른 사람이 피해야 할 이유만 남깁니다.
```

Important rule:

- “1점부터 본다”는 기존 플랫폼에서의 사용자 행동을 설명하는 카피다.
- Xreviews 자체에는 별점 선택 UI나 별점 컴포넌트를 만들지 않는다.

## Subject page wireframe

```text
OO피부과                         [공식계정 미인증]
서울 강남구 · 병원 / 피부과

X-risk score 82
반복 제보: 가격 고지 불일치 · 강매성 상담 · 긴 대기시간

[Write complaint CTA]
이 대상의 불만 작성하기

[Complaint list]
1. 상담가와 결제 금액이 달랐습니다
   가격 고지 불일치 · 증거 있음 · 사업자 답변 없음

2. 예약시간보다 1시간 이상 대기했습니다
   긴 대기시간 · 증거 없음 · 사업자 답변 있음

[Business official area]
공식 답변 / 개선 보고
```

## New review flow

### Step 1 — Select subject

- Search or create subject.
- Category required.

### Step 2 — Select problem tags

Text:

> 어떤 문제가 있었나요? 최소 1개를 선택하세요.

### Step 3 — One-line avoid point

Placeholder:

> 다른 사람이 피해야 할 포인트를 한 줄로 적어주세요.

### Step 4 — Detail body

Header:

> 좋았던 점은 쓰지 마세요. 문제만 쓰세요.

Helper:

> 날짜, 가격, 안내받은 내용, 실제 경험, 증거가 있다면 함께 적어주세요.

### Step 5 — Evidence

Upload types:

- Receipt
- Estimate
- Contract
- Screenshot
- Photo
- Message
- Other

### Step 6 — Liability confirmation

Checkbox required:

> 나는 이 리뷰가 내 실제 경험에 기반하며, 허위 사실 작성 시 법적 책임이 나에게 있음을 확인합니다.

### Step 7 — Submit

Text:

> 제출 후 검토를 거쳐 공개됩니다.

## Positive review block modal

Title:

> Xreviews는 칭찬을 받지 않습니다.

Body:

> 이 리뷰는 문제점이 충분히 드러나지 않았습니다. 다른 사람이 피해야 할 포인트를 중심으로 다시 작성해주세요.

Button:

> 문제 중심으로 다시 쓰기

## Business page

### Claim CTA

> 불만이 쌓이고 있습니다. 공식 입장을 등록하세요.

### Pricing teaser

```text
Official Basic
월 4,900원
- 공식 인증 배지
- 리뷰 답변
- 개선 포스트
- 기본 불만 알림
```

## Admin UX

Moderation queue cards should show:

- Review title/body
- Category and subject
- Tags
- Evidence count/type
- Positive content flag
- Medical risk flag
- Reports count
- Author confirmation status
- Actions: approve, hide, dispute, remove, request evidence
