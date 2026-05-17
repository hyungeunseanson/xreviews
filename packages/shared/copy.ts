import type { MvpCategory } from "./constants";

export const heroCopy = {
  insight: "사람들은 이미 좋은 후기보다 나쁜 후기부터 봅니다.",
  titleLines: ["혹시 리뷰 볼 때,", "1점부터 보시나요?"],
  description:
    "좋은 후기는 이미 충분합니다. Xreviews는 사람들이 먼저 찾는 나쁜 후기만 모읍니다.",
  primaryCta: "나쁜 후기 먼저 보기",
  secondaryCta: "최악의 경험 남기기"
} as const;

export const categoryCards: ReadonlyArray<{
  id: MvpCategory;
  title: string;
  problems: string;
}> = [
  {
    id: "medical_clinic",
    title: "병원/클리닉",
    problems: "상담, 가격, 환불, 강매, 대기, 위생, 광고불일치"
  },
  {
    id: "real_estate",
    title: "부동산",
    problems: "허위매물, 가격 말바꾸기, 계약 압박, 사진과 실제 불일치"
  },
  {
    id: "auto_repair",
    title: "카센터",
    problems: "과잉수리 의심, 견적 불일치, 정비 후 문제, 사전 동의 없는 수리"
  }
] as const;

export const whyXreviews = {
  title: "좋은 곳을 찾기 전에, 피해야 할 이유부터 확인하세요.",
  body: [
    "칭찬은 이미 많습니다. 광고도 많습니다.",
    "Xreviews는 좋은 곳을 추천하지 않습니다.",
    "가기 전에 걸러야 할 문제, 반복되는 불만, 실패 경험을 먼저 보여주는 서비스입니다."
  ]
} as const;

export const productRules = [
  "Xreviews는 좋은 점을 묻지 않습니다.",
  "좋았던 점은 다른 곳에 많습니다.",
  "여기서는 불편했던 점, 부족했던 점, 다른 사람이 피해야 할 이유만 남깁니다."
] as const;
