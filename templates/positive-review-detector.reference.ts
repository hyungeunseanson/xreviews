// Reference logic only. Codex should adapt into app code.

export type PositiveReviewCheck = {
  accepted: boolean;
  positiveContentDetected: boolean;
  reasons: string[];
};

const praiseWordsKo = [
  '좋아요', '좋았습니다', '추천', '친절', '만족', '최고', '훌륭', '괜찮', '재방문', '감사', '잘해', '예뻐졌', '효과 좋',
];

const problemWordsKo = [
  '문제', '불만', '불편', '환불', '강매', '대기', '위생', '불친절', '과잉', '허위', '불일치', '말바꾸기', '누락', '고장', '재발', '설명 부족', '압박', '취소', '계약', '견적', '가격', '광고와 다',
];

export function checkComplaintOnly(input: {
  title: string;
  body: string;
  riskTagCount: number;
  authorLiabilityConfirmed: boolean;
}): PositiveReviewCheck {
  const text = `${input.title} ${input.body}`.trim();
  const reasons: string[] = [];

  if (input.riskTagCount < 1) reasons.push('At least one risk tag is required.');
  if (!input.authorLiabilityConfirmed) reasons.push('Author liability confirmation is required.');
  if (input.body.trim().length < 30) reasons.push('Review body is too short.');

  const praiseCount = praiseWordsKo.filter((w) => text.includes(w)).length;
  const problemCount = problemWordsKo.filter((w) => text.includes(w)).length;

  const positiveContentDetected = praiseCount > 0 && problemCount === 0;

  if (positiveContentDetected) {
    reasons.push('Praise-only or mostly positive review is not accepted.');
  }

  if (problemCount === 0) {
    reasons.push('No clear problem signal found.');
  }

  return {
    accepted: reasons.length === 0,
    positiveContentDetected,
    reasons,
  };
}
