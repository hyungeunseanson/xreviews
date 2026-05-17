export type PositiveReviewCheckInput = {
  title: string;
  issueSummary: string;
  body: string;
  riskTagCount: number;
  authorLiabilityConfirmed: boolean;
};

export type PositiveReviewCheck = {
  accepted: boolean;
  positiveContentDetected: boolean;
  problemSignalDetected: boolean;
  reasons: string[];
};

export const POSITIVE_REVIEW_BLOCK_MESSAGE =
  "Xreviews는 좋은 리뷰를 받지 않습니다. 좋았던 점 말고, 다른 사람이 피해야 할 문제를 적어주세요.";

const praisePatterns = [
  "좋아요",
  "좋았습니다",
  "좋았어요",
  "좋은",
  "친절",
  "추천합니다",
  "추천해요",
  "완전 추천",
  "만족합니다",
  "만족했",
  "최고예요",
  "최고",
  "또 갈게요",
  "또 가고",
  "믿고 가세요",
  "잘합니다",
  "잘해요",
  "괜찮았",
  "훌륭",
  "감사"
] as const;

const problemPatterns = [
  "문제",
  "불만",
  "불편",
  "피해야",
  "주의",
  "환불",
  "강매",
  "대기",
  "위생",
  "시설",
  "불친절",
  "과잉",
  "허위",
  "불일치",
  "말바꾸기",
  "누락",
  "고장",
  "재발",
  "설명 부족",
  "압박",
  "취소",
  "계약",
  "견적",
  "가격",
  "광고",
  "달랐",
  "다릅니다",
  "다른",
  "불명확",
  "부족",
  "늦",
  "기다",
  "추가 비용",
  "안내와",
  "처음 안내",
  "사전 동의",
  "명세서",
  "관리비",
  "사진과 실제"
] as const;

function normalizeText(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function countMatches(text: string, patterns: readonly string[]) {
  return patterns.filter((pattern) =>
    text.includes(pattern.normalize("NFKC").toLowerCase())
  ).length;
}

export function checkComplaintOnly(
  input: PositiveReviewCheckInput
): PositiveReviewCheck {
  const text = normalizeText(
    `${input.title} ${input.issueSummary} ${input.body}`
  );
  const reasons: string[] = [];

  if (input.riskTagCount < 1) {
    reasons.push("At least one risk tag is required.");
  }

  if (!input.authorLiabilityConfirmed) {
    reasons.push("Author liability confirmation is required.");
  }

  const praiseCount = countMatches(text, praisePatterns);
  const problemCount = countMatches(text, problemPatterns);
  const positiveContentDetected = praiseCount > 0;
  const problemSignalDetected = problemCount > 0;
  const praiseOnly = positiveContentDetected && !problemSignalDetected;

  if (praiseOnly) {
    reasons.push("Praise-only or mostly positive review is not accepted.");
  }

  if (!problemSignalDetected) {
    reasons.push("No clear problem signal found.");
  }

  return {
    accepted: reasons.length === 0,
    positiveContentDetected,
    problemSignalDetected,
    reasons
  };
}
