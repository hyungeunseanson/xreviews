import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicBusinessAreaForSubject } from "@/server/business";
import { recordAnalyticsEvent } from "@/server/analytics";
import { getSubjectRiskOverview } from "@/server/risk-score";
import { getPublishedReviewsBySubject } from "@/server/reviews";
import { getSubjectBySlugOrId, getSubjectRiskTags } from "@/server/subjects";

export const dynamic = "force-dynamic";

type SubjectDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    created?: string;
    duplicate?: string;
    review?: string;
  }>;
};

export default async function SubjectDetailPage({
  params,
  searchParams
}: SubjectDetailPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const subject = await getSubjectBySlugOrId(slug);

  if (!subject) {
    notFound();
  }

  const [riskTags, publishedReviews, riskOverview] = await Promise.all([
    getSubjectRiskTags(subject.category),
    getPublishedReviewsBySubject(subject.id),
    getSubjectRiskOverview(subject.id)
  ]);
  const businessArea = await getPublicBusinessAreaForSubject({
    subjectId: subject.id,
    reviewIds: publishedReviews.map((review) => review.id)
  });
  const officialProfile = businessArea.profile?.officialBadgeEnabled
    ? businessArea.profile
    : null;
  const repeatedRiskTags = riskOverview?.topRiskTags ?? [];

  recordAnalyticsEvent("subject_viewed", {
    subjectId: subject.id,
    category: subject.category,
    status: subject.status
  }).catch((error: unknown) => {
    console.error("[Xreviews analytics] Failed to record subject_viewed", error);
  });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-bone">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          {query?.created === "1" ? (
            <p className="mb-6 border-l-4 border-ink bg-paper px-4 py-3 text-sm font-bold leading-6 text-neutral-700">
              대상이 등록되었습니다. 공개 불만은 검토를 통과한 뒤 표시됩니다.
            </p>
          ) : null}
          {query?.duplicate === "1" ? (
            <p className="mb-6 border-l-4 border-ink bg-paper px-4 py-3 text-sm font-bold leading-6 text-neutral-700">
              이미 등록된 대상이 있어 기존 페이지로 안내합니다.
            </p>
          ) : null}
          {query?.review === "pending" ? (
            <p className="mb-6 border-l-4 border-ink bg-paper px-4 py-3 text-sm font-bold leading-6 text-neutral-700">
              불만이 접수되었습니다. 관리자 검토 후 공개됩니다. Xreviews는
              승인 전 리뷰를 공개하지 않습니다.
            </p>
          ) : null}

          <p className="text-sm font-black uppercase text-neutral-500">
            {subject.category}
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
            <div>
              <h1 className="text-5xl font-black leading-tight">
                {subject.name}
              </h1>
              <p className="mt-5 max-w-2xl text-xl font-semibold leading-8 text-neutral-700">
                {subject.categoryLabel} · {subject.locationSummary}
              </p>
              {subject.description ? (
                <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-neutral-600">
                  {subject.description}
                </p>
              ) : null}
            </div>
            <div className="grid gap-3">
              <div className="border border-line bg-paper p-5">
                <p className="text-sm font-black uppercase text-neutral-500">
                  X-risk score
                </p>
                <p className="mt-4 text-4xl font-black">
                  {riskOverview?.score ?? 0}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
                  별점이 아니라 공개 불만 기반 리스크 신호입니다.
                </p>
              </div>
              <div className="border border-line bg-paper p-5">
                <p className="text-sm font-black uppercase text-neutral-500">
                  Official status
                </p>
                <p className="mt-4 text-2xl font-black">
                  {officialProfile ? "공식 인증 사업자" : "공식 계정 미인증"}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
                  {officialProfile
                    ? "이 업체는 Xreviews에서 공식 계정을 인증했습니다."
                    : "공식 계정은 아직 인증되지 않았습니다."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">반복 제보 태그</h2>
              <p className="text-sm font-bold text-neutral-500">
                published 불만 기준
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {repeatedRiskTags.length > 0
                ? repeatedRiskTags.map((tag) => (
                    <span
                      className="border border-line px-3 py-2 text-sm font-bold text-neutral-700"
                      key={tag.id}
                    >
                      {tag.labelKo} {tag.count}회
                    </span>
                  ))
                : riskTags.map((tag) => (
                    <span
                      className="border border-line px-3 py-2 text-sm font-bold text-neutral-700"
                      key={tag.id}
                    >
                      {tag.labelKo}
                    </span>
                  ))}
              {riskTags.length === 0 && repeatedRiskTags.length === 0 ? (
                <p className="text-sm font-semibold leading-6 text-neutral-600">
                  카테고리별 위험 태그 seed가 필요합니다.
                </p>
              ) : null}
              {riskTags.length > 0 && repeatedRiskTags.length === 0 ? (
                <p className="basis-full text-sm font-semibold leading-6 text-neutral-600">
                  아직 반복 제보가 충분하지 않아 카테고리 제보 유형을 먼저
                  보여줍니다.
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-4">
            {[
              {
                label: "공개 불만",
                value: riskOverview?.breakdown.publishedComplaintCount ?? 0
              },
              {
                label: "증거 신호",
                value: riskOverview?.breakdown.evidenceBackedCount ?? 0
              },
              {
                label: "공식 답변",
                value: riskOverview?.breakdown.businessResponseCount ?? 0
              },
              {
                label: "개선 보고",
                value: riskOverview?.breakdown.improvementPostCount ?? 0
              }
            ].map((item) => (
              <div className="border border-line p-4" key={item.label}>
                <p className="text-xs font-black uppercase text-neutral-500">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-black">{item.value}</p>
              </div>
            ))}
          </section>

          <section className="border border-line p-6">
            <h2 className="text-2xl font-black">
              {publishedReviews.length > 0
                ? "공개된 불만"
                : "아직 공개된 불만이 없습니다."}
            </h2>
            {publishedReviews.length === 0 ? (
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-neutral-700">
                좋은 리뷰가 없다는 뜻이 아닙니다. 아직 검토를 통과한 불만이
                없다는 뜻입니다.
              </p>
            ) : (
              <div className="mt-5 divide-y divide-line border-y border-line">
                {publishedReviews.map((review) => (
                  <article className="py-5" key={review.id}>
                    <div className="flex flex-wrap gap-2">
                      {review.tags.map((tag) => (
                        <span
                          className="border border-line px-2 py-1 text-xs font-bold text-neutral-600"
                          key={tag.id}
                        >
                          {tag.labelKo}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-3 text-xl font-black">{review.title}</h3>
                    {review.issueSummary ? (
                      <p className="mt-2 text-base font-bold leading-7 text-neutral-700">
                        {review.issueSummary}
                      </p>
                    ) : null}
                    <p className="mt-3 line-clamp-4 text-sm font-semibold leading-6 text-neutral-600">
                      {review.body}
                    </p>
                    <p className="mt-4 text-xs font-black uppercase text-neutral-500">
                      문제 강도 {review.severityScore} · 증거 수준{" "}
                      {review.evidenceLevel}
                    </p>
                    {businessArea.responsesByReviewId.get(review.id)?.map(
                      (response) => (
                        <div
                          className="mt-5 border-l-4 border-ink bg-bone px-4 py-3"
                          key={response.id}
                        >
                          <p className="text-sm font-black">
                            사업자 공식 답변
                          </p>
                          <p className="mt-1 text-xs font-bold uppercase text-neutral-500">
                            {response.responseTypeLabel} · 이 답변은 승인된 공식
                            계정이 작성했습니다.
                          </p>
                          <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-neutral-700">
                            {response.body}
                          </p>
                        </div>
                      )
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="border border-line p-6">
            <h2 className="text-2xl font-black">사업자 개선 보고</h2>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-neutral-700">
              불만 이후 어떤 점을 개선했는지 사업자가 직접 남긴 내용입니다.
            </p>
            <div className="mt-5 divide-y divide-line border-y border-line">
              {businessArea.improvementPosts.map((post) => (
                <article className="py-5" key={post.id}>
                  <p className="text-xs font-black uppercase text-neutral-500">
                    {post.categoryLabel}
                  </p>
                  <h3 className="mt-2 text-xl font-black">{post.title}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-neutral-700">
                    {post.body}
                  </p>
                </article>
              ))}
              {businessArea.improvementPosts.length === 0 ? (
                <p className="py-6 text-sm font-bold text-neutral-600">
                  아직 공개된 개선 보고가 없습니다.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="border border-line p-5">
            <p className="text-sm font-black uppercase text-neutral-500">
              Official account
            </p>
            <p className="mt-4 text-xl font-black">
              {officialProfile ? "공식 인증 사업자" : "공식 계정 미인증"}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
              {officialProfile
                ? "이 배지는 서비스 품질 보증이 아니라 공식 계정 인증입니다."
                : "불만이 쌓이고 있습니다. 공식 입장을 등록하세요."}
            </p>
          </div>

          {officialProfile ? null : (
            <Link
              className="inline-flex h-12 w-full items-center justify-center border border-ink px-6 text-sm font-bold transition hover:bg-ink hover:text-paper"
              href={`/subjects/${encodeURIComponent(subject.slug)}/claim`}
            >
              이 업체의 공식 계정 신청
            </Link>
          )}

          <Link
            className="inline-flex h-12 w-full items-center justify-center bg-ink px-6 text-sm font-bold text-paper transition hover:bg-neutral-800"
            href={`/subjects/${encodeURIComponent(subject.slug)}/reviews/new`}
          >
            이 대상의 불만 작성하기
          </Link>
          <p className="text-sm font-semibold leading-6 text-neutral-600">
            작성된 불만은 pending 상태로 저장되고, 검토 전에는 공개되지
            않습니다.
          </p>

          <Link
            className="inline-flex h-12 w-full items-center justify-center border border-ink px-6 text-sm font-bold transition hover:bg-ink hover:text-paper"
            href="/subjects"
          >
            검색으로 돌아가기
          </Link>
        </aside>
      </section>
    </main>
  );
}
