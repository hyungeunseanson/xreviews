export type MedicalGuardrailCheck = {
  accepted: boolean;
  reasons: string[];
};

export const MEDICAL_GUARDRAIL_MESSAGE =
  "의료 효과나 진단 결과를 단정하지 말고, 상담·가격·환불·대기·위생·광고불일치처럼 직접 겪은 소비자 경험을 중심으로 작성해주세요.";

const blockedMedicalPatterns = [
  /치료\s*효과/u,
  /효과\s*(없|없었|좋|봤|확실|보장)/u,
  /진단.{0,8}(틀렸|잘못|오류|실패)/u,
  /오진/u,
  /의학적\s*과실/u,
  /의료\s*과실/u,
  /부작용.{0,14}(원인|때문|탓|병원|의사)/u,
  /(병원|의사).{0,14}(때문|탓).{0,14}부작용/u,
  /무조건\s*사기/u,
  /사기꾼/u,
  /돌팔이/u,
  /의사.{0,12}(쓰레기|무능|최악|미친)/u
] as const;

function normalizeText(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function checkMedicalGuardrail(input: {
  title: string;
  issueSummary: string;
  body: string;
}): MedicalGuardrailCheck {
  const text = normalizeText(`${input.title} ${input.issueSummary} ${input.body}`);
  const reasons = blockedMedicalPatterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => pattern.source);

  return {
    accepted: reasons.length === 0,
    reasons
  };
}
