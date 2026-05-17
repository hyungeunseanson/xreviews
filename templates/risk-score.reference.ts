// Reference scoring logic only. Codex should adapt into app code.

export type RiskScoreInput = {
  publishedReviewCount: number;
  evidenceWeightSum: number;
  repeatedTagCount: number;
  recentReviewCount: number;
  resolvedCount: number;
};

export function calculateRiskScore(input: RiskScoreInput): number {
  const raw =
    input.publishedReviewCount * 8 +
    input.evidenceWeightSum * 3 +
    input.repeatedTagCount * 5 +
    input.recentReviewCount * 4 -
    input.resolvedCount * 6;

  return Math.max(0, Math.min(100, Math.round(raw)));
}
