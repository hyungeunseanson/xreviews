export const MVP_CATEGORIES = [
  "medical_clinic",
  "real_estate",
  "auto_repair"
] as const;

export type MvpCategory = (typeof MVP_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<MvpCategory, string> = {
  medical_clinic: "병원/클리닉",
  real_estate: "부동산",
  auto_repair: "카센터"
};

export const CATEGORY_DESCRIPTIONS: Record<MvpCategory, string> = {
  medical_clinic: "상담, 가격, 환불, 강매, 대기, 위생, 광고불일치",
  real_estate: "허위매물, 가격 말바꾸기, 계약 압박, 사진과 실제 불일치",
  auto_repair: "과잉수리 의심, 견적 불일치, 정비 후 문제, 사전 동의 없는 수리"
};

export const PRODUCT_RULES = [
  "Xreviews는 긍정 리뷰를 받지 않습니다.",
  "별점 UI를 만들지 않습니다.",
  "신규 리뷰는 승인 전까지 공개되지 않습니다.",
  "사업자는 리뷰를 삭제할 수 없습니다.",
  "증거 파일은 private-by-default입니다."
] as const;
