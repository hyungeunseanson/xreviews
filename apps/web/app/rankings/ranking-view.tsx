import Link from "next/link";
import {
  CATEGORY_BY_RANKING_SLUG,
  CATEGORY_LABELS,
  CATEGORY_RANKING_COPY,
  CATEGORY_RANKING_SLUGS,
  MVP_CATEGORIES,
  type MvpCategory
} from "@xreviews/shared/constants";
import {
  getTopRiskSubjects,
  getTrendingRiskTags,
  recordRankingViewed,
  type XRiskSubject
} from "@/server/risk-score";
import { RankingSubjectLink } from "./ranking-subject-link";

type RankingViewProps = {
  category?: MvpCategory;
};

const categoryPathByCategory: Record<MvpCategory, string> = {
  medical_clinic: `/rankings/${CATEGORY_RANKING_SLUGS.medical_clinic}`,
  real_estate: `/rankings/${CATEGORY_RANKING_SLUGS.real_estate}`,
  auto_repair: `/rankings/${CATEGORY_RANKING_SLUGS.auto_repair}`
};

function getPageCopy(category?: MvpCategory) {
  if (!category) {
    return {
      eyebrow: "X-risk rankings",
      title: "지금 가장 많이 쌓인 불만",
      description:
        "좋은 후기는 이미 충분합니다. 이제 피해야 할 이유를 먼저 보세요."
    };
  }

  return {
    eyebrow: CATEGORY_LABELS[category],
    title: CATEGORY_RANKING_COPY[category].title,
    description: CATEGORY_RANKING_COPY[category].description
  };
}

function categoryHref(category: MvpCategory) {
  return categoryPathByCategory[category];
}

function RiskMeter({ score }: { score: number }) {
  return (
    <div aria-hidden="true" className="mt-3 h-2 border border-line bg-paper">
      <div className="h-full bg-ink" style={{ width: `${score}%` }} />
    </div>
  );
}

function RankingCard({
  index,
  item
}: {
  index: number;
  item: XRiskSubject;
}) {
  return (
    <article className="border border-line bg-paper p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-neutral-500">
            #{index + 1} · {item.categoryLabel}
          </p>
          <RankingSubjectLink
            className="mt-2 block text-2xl font-black leading-tight transition hover:text-neutral-600"
            category={item.category}
            href={`/subjects/${encodeURIComponent(item.slug)}`}
            name={item.name}
            score={item.score}
            subjectId={item.id}
          />
          <p className="mt-2 text-sm font-bold leading-6 text-neutral-600">
            {item.locationSummary}
          </p>
        </div>
        <div className="min-w-28 border border-line px-4 py-3 text-left sm:text-right">
          <p className="text-xs font-black uppercase text-neutral-500">
            X-risk
          </p>
          <p className="mt-1 text-3xl font-black">{item.score}</p>
        </div>
      </div>

      <RiskMeter score={item.score} />

      <div className="mt-5 grid gap-3 text-sm font-bold text-neutral-700 sm:grid-cols-4">
        <p>{item.breakdown.publishedComplaintCount}건 공개 불만</p>
        <p>{item.breakdown.evidenceBackedCount}건 증거 신호</p>
        <p>
          {item.officialBadgeEnabled ? "공식 계정 인증" : "공식 계정 미인증"}
        </p>
        <p>{item.hasImprovementPost ? "개선 보고 있음" : "개선 보고 없음"}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.topRiskTags.length > 0 ? (
          item.topRiskTags.map((tag) => (
            <span
              className="border border-line px-3 py-2 text-xs font-black text-neutral-700"
              key={tag.id}
            >
              {tag.labelKo} {tag.count}회
            </span>
          ))
        ) : (
          <span className="text-sm font-semibold text-neutral-500">
            반복 제보 태그는 아직 충분하지 않습니다.
          </span>
        )}
      </div>
    </article>
  );
}

export async function RankingView({ category }: RankingViewProps) {
  const copy = getPageCopy(category);
  const [rankings, trendingTags] = await Promise.all([
    getTopRiskSubjects({ category, limit: 30 }),
    getTrendingRiskTags({ category, limit: 8 })
  ]);

  recordRankingViewed({
    category: category ?? "all",
    subjectCount: rankings.length
  }).catch((error: unknown) => {
    console.error("[Xreviews rankings] Failed to record ranking view", error);
  });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-bone">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <p className="text-sm font-black uppercase text-neutral-500">
            {copy.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-3xl text-xl font-semibold leading-8 text-neutral-700">
            {copy.description}
          </p>
          <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-neutral-600">
            X-risk score는 별점이 아닙니다. 공개 승인된 불만, 증거 수준,
            반복 제보, 최근성, 사업자 대응 신호를 함께 본 리스크 신호입니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              className={`border px-4 py-2 text-sm font-black ${
                category
                  ? "border-line text-neutral-600 hover:border-ink hover:text-ink"
                  : "border-ink bg-ink text-paper"
              }`}
              href="/rankings"
            >
              전체
            </Link>
            {MVP_CATEGORIES.map((item) => (
              <Link
                className={`border px-4 py-2 text-sm font-black ${
                  category === item
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-neutral-600 hover:border-ink hover:text-ink"
                }`}
                href={categoryHref(item)}
                key={item}
              >
                {CATEGORY_LABELS[item]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {rankings.length > 0 ? (
            rankings.map((item, index) => (
              <RankingCard index={index} item={item} key={item.id} />
            ))
          ) : (
            <div className="border border-line p-8">
              <h2 className="text-2xl font-black">
                아직 공개 랭킹에 반영할 불만이 없습니다.
              </h2>
              <p className="mt-3 text-base font-semibold leading-7 text-neutral-700">
                pending, hidden, disputed, removed 상태의 리뷰는 랭킹에
                반영하지 않습니다.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <section className="border border-line p-5">
            <p className="text-sm font-black uppercase text-neutral-500">
              Trending signals
            </p>
            <h2 className="mt-4 text-2xl font-black">반복 제보 태그</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <span
                  className="border border-line px-3 py-2 text-xs font-black text-neutral-700"
                  key={tag.id}
                >
                  {tag.labelKo} {tag.count}회
                </span>
              ))}
              {trendingTags.length === 0 ? (
                <p className="text-sm font-bold leading-6 text-neutral-600">
                  공개 승인된 불만이 쌓이면 반복 제보 태그가 표시됩니다.
                </p>
              ) : null}
            </div>
          </section>

          <section className="border border-line p-5">
            <p className="text-sm font-black uppercase text-neutral-500">
              Ranking rule
            </p>
            <div className="mt-4 space-y-3 text-sm font-bold leading-6 text-neutral-700">
              <p>published 리뷰만 반영합니다.</p>
              <p>증거가 있는 불만은 더 높은 신뢰 신호로 봅니다.</p>
              <p>공식 답변과 개선 보고는 일부 완화 신호로 반영합니다.</p>
              <p>병원/클리닉은 의료 효과나 진단을 단정하지 않습니다.</p>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

export function getCategoryFromRankingSlug(slug: string) {
  return CATEGORY_BY_RANKING_SLUG[
    slug as keyof typeof CATEGORY_BY_RANKING_SLUG
  ];
}
