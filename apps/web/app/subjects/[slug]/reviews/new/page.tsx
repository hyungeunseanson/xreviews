import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MEDICAL_GUARDRAIL_MESSAGE,
  POSITIVE_REVIEW_BLOCK_MESSAGE,
  reviewActionSearchParamsSchema
} from "@xreviews/validators";
import { createReviewAction } from "@/app/subjects/[slug]/reviews/actions";
import { EvidenceUploadField } from "@/app/subjects/[slug]/reviews/evidence-upload-field";
import { recordAnalyticsEvent } from "@/server/analytics";
import { getSubjectBySlugOrId, getSubjectRiskTags } from "@/server/subjects";
import { requireUser } from "@/server/session";

export const dynamic = "force-dynamic";

type NewReviewPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

const errorMessages = {
  invalid: "입력값을 다시 확인해주세요. 제목, 요약, 본문, 위험도는 모두 필요합니다.",
  tags: "문제 태그를 최소 1개 이상 선택해주세요.",
  liability: "허위 사실 작성 시 법적 책임 확인에 체크해야 제출할 수 있습니다.",
  positive: POSITIVE_REVIEW_BLOCK_MESSAGE,
  medical: MEDICAL_GUARDRAIL_MESSAGE,
  evidence: "증거 파일은 본인 계정으로 올린 비공개 파일만 연결할 수 있습니다.",
  subject: "이 대상에는 지금 불만을 남길 수 없습니다.",
  database: "DATABASE_URL이 없어 불만을 저장할 수 없습니다.",
  create: "불만 저장에 실패했습니다. 잠시 뒤 다시 시도해주세요."
} as const;

const severityOptions = [
  { value: 1, label: "낮은 불편", description: "작은 불편이나 안내 부족" },
  { value: 2, label: "반복 불편", description: "시간 낭비나 반복된 문제" },
  { value: 3, label: "금전/시간 손해", description: "가격, 계약, 대기 관련 손해" },
  { value: 4, label: "큰 리스크", description: "환불, 위생, 압박, 안전 우려" },
  { value: 5, label: "즉시 피해야 함", description: "다른 사람에게 강하게 경고할 수준" }
] as const;

export default async function NewReviewPage({
  params,
  searchParams
}: NewReviewPageProps) {
  const [{ slug }, query, session] = await Promise.all([
    params,
    searchParams,
    requireUser()
  ]);
  const subject = await getSubjectBySlugOrId(slug);

  if (!subject || subject.status !== "active") {
    notFound();
  }

  const riskTags = await getSubjectRiskTags(subject.category);
  const parsedQuery = reviewActionSearchParamsSchema.safeParse(query ?? {});
  const error = parsedQuery.success ? parsedQuery.data.error : undefined;
  const action = createReviewAction.bind(null, subject.slug, subject.id);

  recordAnalyticsEvent(
    "review_started",
    {
      subjectId: subject.id,
      category: subject.category
    },
    {
      actorUserId: session.user.id,
      actorRole: session.user.role
    }
  ).catch((analyticsError: unknown) => {
    console.error("[Xreviews analytics] Failed to record review_started", analyticsError);
  });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-bone">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <Link
            className="text-sm font-bold text-neutral-600 underline underline-offset-4 transition hover:text-ink"
            href={`/subjects/${encodeURIComponent(subject.slug)}`}
          >
            대상 페이지로 돌아가기
          </Link>
          <p className="mt-8 text-sm font-black uppercase text-neutral-500">
            Complaint-only review
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight">
            좋았던 점은 쓰지 마세요.
            <br />
            문제만 적어주세요.
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-neutral-700">
            Xreviews는 좋은 리뷰를 받지 않습니다. 다른 사람이 피해야 할
            이유를 남겨주세요.
          </p>
          <div className="mt-8 border-l-4 border-ink bg-paper px-5 py-4">
            <p className="text-lg font-black">{subject.name}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-neutral-700">
              {subject.categoryLabel} · {subject.locationSummary}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_320px]">
        <form action={action} className="space-y-8">
          {error ? (
            <p className="border-l-4 border-ink bg-bone px-4 py-3 text-sm font-bold leading-6 text-neutral-700">
              {errorMessages[error]}
            </p>
          ) : null}

          <div>
            <label
              className="text-sm font-black uppercase text-neutral-600"
              htmlFor="title"
            >
              제목
            </label>
            <input
              className="mt-3 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
              id="title"
              maxLength={140}
              minLength={4}
              name="title"
              placeholder="예: 상담가와 결제 금액이 달랐습니다"
              required
              type="text"
            />
          </div>

          <fieldset className="border border-line p-5">
            <legend className="px-2 text-sm font-black uppercase text-neutral-600">
              문제 태그
            </legend>
            <p className="mt-1 text-sm font-semibold leading-6 text-neutral-600">
              어떤 문제가 있었나요? 최소 1개를 선택하세요.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {riskTags.map((tag) => (
                <label
                  className="flex min-h-12 items-center gap-3 border border-line px-3 py-2 text-sm font-bold text-neutral-700 transition has-[:checked]:border-ink has-[:checked]:bg-bone"
                  key={tag.id}
                >
                  <input
                    className="h-4 w-4 accent-ink"
                    name="riskTagIds"
                    type="checkbox"
                    value={tag.id}
                  />
                  {tag.labelKo}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              className="text-sm font-black uppercase text-neutral-600"
              htmlFor="issueSummary"
            >
              다른 사람이 피해야 할 포인트를 한 줄로 적어주세요.
            </label>
            <input
              className="mt-3 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
              id="issueSummary"
              maxLength={220}
              minLength={6}
              name="issueSummary"
              placeholder="예: 처음 안내받은 가격과 실제 결제 안내가 달랐습니다."
              required
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-black uppercase text-neutral-600"
              htmlFor="body"
            >
              무엇이 문제였나요?
            </label>
            <p className="mt-2 text-sm font-semibold leading-6 text-neutral-600">
              날짜, 가격, 안내받은 내용, 실제 경험을 문제 중심으로 적어주세요.
            </p>
            <textarea
              className="mt-3 min-h-56 w-full resize-y border border-neutral-400 bg-paper px-4 py-3 text-base leading-7 text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
              id="body"
              maxLength={5000}
              minLength={30}
              name="body"
              placeholder="좋았던 점보다 다른 사람이 피해야 할 문제를 구체적으로 적어주세요."
              required
            />
          </div>

          <fieldset className="border border-line p-5">
            <legend className="px-2 text-sm font-black uppercase text-neutral-600">
              문제 강도
            </legend>
            <p className="mt-1 text-sm font-semibold leading-6 text-neutral-600">
              공개 평가가 아니라 내부 검토용 문제 강도입니다.
            </p>
            <div className="mt-4 grid gap-3">
              {severityOptions.map((option) => (
                <label
                  className="grid gap-1 border border-line px-4 py-3 text-sm transition has-[:checked]:border-ink has-[:checked]:bg-bone sm:grid-cols-[160px_1fr]"
                  key={option.value}
                >
                  <span className="flex items-center gap-3 font-black">
                    <input
                      className="h-4 w-4 accent-ink"
                      defaultChecked={option.value === 3}
                      name="severityScore"
                      type="radio"
                      value={option.value}
                    />
                    {option.value}. {option.label}
                  </span>
                  <span className="font-semibold text-neutral-600">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <EvidenceUploadField />

          <label className="flex gap-3 border border-line bg-bone p-5 text-sm font-bold leading-6 text-neutral-700">
            <input
              className="mt-1 h-4 w-4 shrink-0 accent-ink"
              name="authorLiabilityConfirmed"
              required
              type="checkbox"
            />
            나는 이 불만이 내 실제 경험에 기반하며, 허위 사실 작성 시 법적
            책임이 나에게 있음을 확인합니다.
          </label>

          <button
            className="h-12 w-full bg-ink px-6 text-sm font-bold text-paper transition hover:bg-neutral-800"
            type="submit"
          >
            검토 요청하기
          </button>
        </form>

        <aside className="space-y-4">
          <div className="border border-line p-5">
            <p className="text-sm font-black uppercase text-neutral-500">
              Publication rule
            </p>
            <p className="mt-4 text-xl font-black">
              제출 후 바로 공개되지 않습니다.
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
              불만은 pending 상태로 저장되고, 관리자 검토 후에만 공개됩니다.
            </p>
          </div>

          {subject.category === "medical_clinic" ? (
            <div className="border border-line bg-bone p-5">
              <p className="text-sm font-black uppercase text-neutral-500">
                병원/클리닉 안내
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-neutral-700">
                {MEDICAL_GUARDRAIL_MESSAGE}
              </p>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
