import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createBusinessImprovementPostAction,
  updateBusinessImprovementPostAction,
  upsertBusinessResponseAction
} from "@/app/business/subjects/[subjectId]/actions";
import {
  BUSINESS_IMPROVEMENT_CATEGORIES,
  BUSINESS_RESPONSE_TYPES
} from "@xreviews/validators";
import {
  BUSINESS_IMPROVEMENT_CATEGORY_LABELS,
  BUSINESS_PLAN_LABELS,
  BUSINESS_PLAN_PRICES,
  BUSINESS_RESPONSE_TYPE_LABELS
} from "@xreviews/shared/constants";
import {
  BusinessError,
  getBusinessSubjectDashboard,
  subscriptionSkeletonPlans
} from "@/server/business";
import { requireBusinessOrAdmin } from "@/server/session";

export const dynamic = "force-dynamic";

type BusinessSubjectDashboardPageProps = {
  params: Promise<{
    subjectId: string;
  }>;
  searchParams?: Promise<{
    result?: string;
  }>;
};

const resultMessages: Record<string, string> = {
  response: "사업자 공식 답변을 저장했습니다.",
  improvement: "사업자 개선 보고를 저장했습니다.",
  "improvement-updated": "사업자 개선 보고를 수정했습니다.",
  "error-invalid": "입력값을 다시 확인해주세요.",
  "error-forbidden": "이 공식 계정으로는 해당 대상을 관리할 수 없습니다.",
  "error-review": "공개된 불만에만 공식 답변을 남길 수 있습니다.",
  "error-database": "DATABASE_URL이 없어 저장할 수 없습니다."
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function ResponseForm({
  subjectId,
  review
}: {
  subjectId: string;
  review: {
    id: string;
    response: {
      body: string;
      responseType: string;
    } | null;
  };
}) {
  const action = upsertBusinessResponseAction.bind(null, subjectId, review.id);

  return (
    <form action={action} className="mt-4 grid gap-3 border border-line p-4">
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <label className="block">
          <span className="text-xs font-black uppercase text-neutral-500">
            답변 유형
          </span>
          <select
            className="mt-2 h-10 w-full border border-neutral-400 bg-paper px-3 text-sm font-bold text-ink outline-none focus:border-ink"
            defaultValue={review.response?.responseType ?? "explanation"}
            name="responseType"
          >
            {BUSINESS_RESPONSE_TYPES.map((type) => (
              <option key={type} value={type}>
                {BUSINESS_RESPONSE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase text-neutral-500">
            사업자 공식 답변
          </span>
          <textarea
            className="mt-2 min-h-28 w-full resize-y border border-neutral-400 bg-paper px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-ink"
            defaultValue={review.response?.body ?? ""}
            maxLength={2000}
            minLength={10}
            name="body"
            placeholder="사실관계 설명, 사과, 정정, 개선 여부를 작성하세요. 이 답변은 리뷰를 숨기거나 지우지 않습니다."
            required
          />
        </label>
      </div>
      <button
        className="h-10 justify-self-start border border-ink px-4 text-sm font-black transition hover:bg-ink hover:text-paper"
        type="submit"
      >
        공식 답변 저장
      </button>
    </form>
  );
}

function ImprovementPostForm({ subjectId }: { subjectId: string }) {
  const action = createBusinessImprovementPostAction.bind(null, subjectId);

  return (
    <form action={action} className="grid gap-3 border border-line p-4">
      <label className="block">
        <span className="text-xs font-black uppercase text-neutral-500">
          개선 카테고리
        </span>
        <select
          className="mt-2 h-10 w-full border border-neutral-400 bg-paper px-3 text-sm font-bold text-ink outline-none focus:border-ink"
          name="category"
        >
          {BUSINESS_IMPROVEMENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {BUSINESS_IMPROVEMENT_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-black uppercase text-neutral-500">
          제목
        </span>
        <input
          className="mt-2 h-10 w-full border border-neutral-400 bg-paper px-3 text-sm text-ink outline-none focus:border-ink"
          maxLength={140}
          minLength={4}
          name="title"
          placeholder="예: 환불 안내 문구를 수정했습니다"
          required
        />
      </label>
      <label className="block">
        <span className="text-xs font-black uppercase text-neutral-500">
          내용
        </span>
        <textarea
          className="mt-2 min-h-32 w-full resize-y border border-neutral-400 bg-paper px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-ink"
          maxLength={3000}
          minLength={20}
          name="body"
          placeholder="불만 이후 어떤 점을 개선했는지 구체적으로 적어주세요."
          required
        />
      </label>
      <button
        className="h-10 justify-self-start bg-ink px-4 text-sm font-black text-paper transition hover:bg-neutral-800"
        type="submit"
      >
        개선 보고 작성
      </button>
    </form>
  );
}

export default async function BusinessSubjectDashboardPage({
  params,
  searchParams
}: BusinessSubjectDashboardPageProps) {
  const [{ subjectId }, query, session] = await Promise.all([
    params,
    searchParams,
    requireBusinessOrAdmin()
  ]);

  let dashboard: Awaited<ReturnType<typeof getBusinessSubjectDashboard>>;

  try {
    dashboard = await getBusinessSubjectDashboard(subjectId, {
      userId: session.user.id,
      role: session.user.role
    });
  } catch (error) {
    if (error instanceof BusinessError) {
      notFound();
    }

    throw error;
  }

  const result = query?.result ? resultMessages[query.result] : undefined;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-bone">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <Link
            className="text-sm font-bold text-neutral-600 underline underline-offset-4 transition hover:text-ink"
            href="/business/subjects"
          >
            공식 계정 목록으로 돌아가기
          </Link>
          <p className="mt-8 text-sm font-black uppercase text-neutral-500">
            Official business dashboard
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight">
            {dashboard.subject.name}
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-neutral-700">
            공개된 불만에 답변하고, 개선 내용을 남길 수 있습니다.
          </p>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-neutral-600">
            Xreviews의 공식 계정은 리뷰를 지우기 위한 도구가 아닙니다.
          </p>
          {result ? (
            <p className="mt-6 border-l-4 border-ink bg-paper px-4 py-3 text-sm font-bold text-neutral-700">
              {result}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section className="border border-line p-5">
            <h2 className="text-xl font-black">공개된 불만</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-neutral-600">
              published 상태의 불만에만 공식 답변을 남길 수 있습니다.
            </p>
            <div className="mt-5 divide-y divide-line border-y border-line">
              {dashboard.reviews.map((review) => (
                <article className="py-5" key={review.id}>
                  <p className="text-xs font-black uppercase text-neutral-500">
                    문제 강도 {review.severityScore} · 증거 수준{" "}
                    {review.evidenceLevel}
                  </p>
                  <h3 className="mt-2 text-xl font-black">{review.title}</h3>
                  {review.issueSummary ? (
                    <p className="mt-2 text-sm font-bold leading-6 text-neutral-700">
                      {review.issueSummary}
                    </p>
                  ) : null}
                  <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-neutral-600">
                    {review.body}
                  </p>
                  <ResponseForm review={review} subjectId={dashboard.subject.id} />
                </article>
              ))}
              {dashboard.reviews.length === 0 ? (
                <p className="py-6 text-sm font-bold text-neutral-600">
                  아직 공개된 불만이 없습니다. pending/hidden/removed 리뷰에는
                  답변할 수 없습니다.
                </p>
              ) : null}
            </div>
          </section>

          <section className="border border-line p-5">
            <h2 className="text-xl font-black">사업자 개선 보고</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-neutral-600">
              불만 이후 어떤 점을 개선했는지 사업자가 직접 남긴 내용입니다.
            </p>
            <div className="mt-5">
              <ImprovementPostForm subjectId={dashboard.subject.id} />
            </div>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {dashboard.improvementPosts.map((post) => {
                const action = updateBusinessImprovementPostAction.bind(
                  null,
                  dashboard.subject.id,
                  post.id
                );

                return (
                  <article className="py-5" key={post.id}>
                    <p className="text-xs font-black uppercase text-neutral-500">
                      {post.categoryLabel} · {formatDate(post.updatedAt)}
                    </p>
                    <h3 className="mt-2 text-lg font-black">{post.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-neutral-700">
                      {post.body}
                    </p>
                    <form action={action} className="mt-4 grid gap-3 border border-line p-4">
                      <select
                        className="h-10 w-full border border-neutral-400 bg-paper px-3 text-sm font-bold text-ink outline-none focus:border-ink"
                        defaultValue={post.category}
                        name="category"
                      >
                        {BUSINESS_IMPROVEMENT_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {BUSINESS_IMPROVEMENT_CATEGORY_LABELS[category]}
                          </option>
                        ))}
                      </select>
                      <input
                        className="h-10 w-full border border-neutral-400 bg-paper px-3 text-sm text-ink outline-none focus:border-ink"
                        defaultValue={post.title}
                        maxLength={140}
                        minLength={4}
                        name="title"
                        required
                      />
                      <textarea
                        className="min-h-28 w-full resize-y border border-neutral-400 bg-paper px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-ink"
                        defaultValue={post.body}
                        maxLength={3000}
                        minLength={20}
                        name="body"
                        required
                      />
                      <button
                        className="h-10 justify-self-start border border-ink px-4 text-sm font-black transition hover:bg-ink hover:text-paper"
                        type="submit"
                      >
                        개선 보고 수정
                      </button>
                    </form>
                  </article>
                );
              })}
              {dashboard.improvementPosts.length === 0 ? (
                <p className="py-6 text-sm font-bold text-neutral-600">
                  아직 공개된 개선 보고가 없습니다.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="border border-line p-5">
            <p className="text-sm font-black uppercase text-neutral-500">
              Official status
            </p>
            <h2 className="mt-4 text-2xl font-black">
              {dashboard.profile.officialBadgeEnabled
                ? "공식 인증 사업자"
                : "공식 계정 미인증"}
            </h2>
            <p className="mt-3 text-sm font-bold leading-6 text-neutral-600">
              이 배지는 서비스 품질 보증이 아니라 Xreviews 공식 계정 인증입니다.
            </p>
          </section>

          <section className="border border-line p-5">
            <p className="text-sm font-black uppercase text-neutral-500">
              Subscription skeleton
            </p>
            <h2 className="mt-4 text-2xl font-black">
              삭제권이 아니라 대응권입니다.
            </h2>
            <p className="mt-3 text-sm font-bold leading-6 text-neutral-600">
              현재 플랜:{" "}
              {BUSINESS_PLAN_LABELS[dashboard.subscription.plan]} ·{" "}
              {BUSINESS_PLAN_PRICES[dashboard.subscription.plan]}
            </p>
            <div className="mt-5 space-y-3">
              {subscriptionSkeletonPlans.map((plan) => (
                <div className="border border-line p-3" key={plan.plan}>
                  <p className="font-black">
                    {plan.planLabel} · {plan.price}
                  </p>
                  <p className="mt-2 text-xs font-bold leading-5 text-neutral-600">
                    {plan.features.join(" / ")}
                  </p>
                  <button
                    className="mt-3 h-9 cursor-not-allowed border border-neutral-300 px-3 text-xs font-black text-neutral-400"
                    disabled
                    type="button"
                  >
                    준비 중
                  </button>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
