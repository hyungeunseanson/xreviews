import Link from "next/link";
import { notFound } from "next/navigation";
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

  const [riskTags, publishedReviews] = await Promise.all([
    getSubjectRiskTags(subject.category),
    getPublishedReviewsBySubject(subject.id)
  ]);

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
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
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
            <div className="border border-line bg-paper p-5">
              <p className="text-sm font-black uppercase text-neutral-500">
                X-risk score
              </p>
              <p className="mt-4 text-5xl font-black">
                {subject.riskScore ?? "준비 중"}
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
                공개 불만과 반복 제보가 쌓이면 계산됩니다.
              </p>
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
                Phase 3 placeholder
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {riskTags.map((tag) => (
                <span
                  className="border border-line px-3 py-2 text-sm font-bold text-neutral-700"
                  key={tag.id}
                >
                  {tag.labelKo}
                </span>
              ))}
              {riskTags.length === 0 ? (
                <p className="text-sm font-semibold leading-6 text-neutral-600">
                  카테고리별 위험 태그 seed가 필요합니다.
                </p>
              ) : null}
            </div>
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
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="border border-line p-5">
            <p className="text-sm font-black uppercase text-neutral-500">
              Official account
            </p>
            <p className="mt-4 text-xl font-black">
              {subject.officialBadgeEnabled ? "공식 계정 인증됨" : "공식 계정 미인증"}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
              사업자 공식 계정 기능은 이후 Phase에서 연결합니다.
            </p>
          </div>

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
