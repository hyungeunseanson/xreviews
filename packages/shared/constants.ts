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

export const CATEGORY_RANKING_SLUGS: Record<MvpCategory, string> = {
  medical_clinic: "medical-clinic",
  real_estate: "real-estate",
  auto_repair: "auto-repair"
};

export const CATEGORY_BY_RANKING_SLUG = {
  "medical-clinic": "medical_clinic",
  "real-estate": "real_estate",
  "auto-repair": "auto_repair"
} as const satisfies Record<string, MvpCategory>;

export const CATEGORY_RANKING_COPY: Record<
  MvpCategory,
  {
    title: string;
    description: string;
  }
> = {
  medical_clinic: {
    title: "가격/상담 불만 급증 클리닉",
    description: "대기·환불·강매성 상담 제보가 반복된 병원/클리닉"
  },
  real_estate: {
    title: "허위매물 의심 제보 부동산",
    description: "가격 말바꾸기·사진과 실제 불일치 제보가 반복된 부동산"
  },
  auto_repair: {
    title: "과잉수리 의심 제보 카센터",
    description: "견적 불일치·정비 후 문제 재발 제보가 반복된 카센터"
  }
};

export const PRODUCT_RULES = [
  "Xreviews는 긍정 리뷰를 받지 않습니다.",
  "별점 UI를 만들지 않습니다.",
  "신규 리뷰는 승인 전까지 공개되지 않습니다.",
  "사업자는 리뷰를 삭제할 수 없습니다.",
  "증거 파일은 private-by-default입니다."
] as const;

export const BUSINESS_RESPONSE_TYPE_LABELS = {
  explanation: "설명",
  apology: "사과",
  correction: "정정",
  dispute: "반박",
  resolved: "해결"
} as const;

export const BUSINESS_IMPROVEMENT_CATEGORY_LABELS = {
  hygiene: "위생/시설",
  price_policy: "가격 안내",
  refund_policy: "환불 정책",
  staff_training: "직원 교육",
  facility: "시설 개선",
  other: "기타"
} as const;

export const BUSINESS_PLAN_LABELS = {
  free_claim: "Free Claim",
  official_basic: "Official Basic",
  official_pro: "Official Pro",
  multi_location: "Multi-location",
  data_api: "Data/API"
} as const;

export const BUSINESS_PLAN_PRICES = {
  free_claim: "0원",
  official_basic: "월 4,900원",
  official_pro: "월 29,000원",
  multi_location: "별도 문의",
  data_api: "별도 문의"
} as const;
