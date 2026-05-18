import Link from "next/link";
import {
  categoryCards,
  heroCopy,
  productRules,
  whyXreviews
} from "@xreviews/shared/copy";
import { PRODUCT_RULES } from "@xreviews/shared/constants";
import { getTopRiskSubjects } from "@/server/risk-score";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const topRiskSubjects = await getTopRiskSubjects({ limit: 3 });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-6xl content-center px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div className="flex flex-col justify-center">
          <p className="mb-5 max-w-2xl text-base font-semibold text-neutral-600">
            {heroCopy.insight}
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.96] tracking-normal sm:text-7xl lg:text-8xl">
            {heroCopy.titleLines.map((line) => (
              <span className="block" key={line}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-2xl text-xl font-semibold leading-8 text-neutral-700 sm:text-2xl sm:leading-9">
            {heroCopy.description}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-12 items-center justify-center bg-ink px-6 text-sm font-bold text-paper transition hover:bg-neutral-800"
              href="/subjects"
            >
              {heroCopy.primaryCta}
            </Link>
            <button
              aria-disabled="true"
              className="inline-flex h-12 cursor-not-allowed items-center justify-center border border-neutral-400 px-6 text-sm font-bold text-neutral-500"
              disabled
              type="button"
            >
              {heroCopy.secondaryCta}
            </button>
          </div>
        </div>

        <aside className="mt-14 border-l-4 border-ink bg-neutral-100 p-6 lg:mt-0 lg:self-center">
          <p className="text-sm font-black uppercase text-neutral-500">
            Product Law
          </p>
          <p className="mt-6 text-3xl font-black leading-tight">
            {PRODUCT_RULES[0]}
          </p>
          <div className="mt-8 space-y-4 text-base font-semibold leading-7 text-neutral-700">
            {PRODUCT_RULES.slice(1, 4).map((rule) => (
              <p key={rule}>{rule}</p>
            ))}
          </div>
        </aside>
      </section>

      <section className="border-y border-line bg-bone" id="search">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <h2 className="text-3xl font-black leading-tight">
                가기 전에 먼저 확인하세요.
              </h2>
              <p className="mt-3 text-base font-semibold leading-7 text-neutral-700">
                병원, 부동산, 카센터의 불만을 검색해보세요.
              </p>
            </div>
            <form
              action="/subjects"
              className="flex flex-col gap-3 sm:flex-row"
              role="search"
            >
              <input
                aria-label="불만 검색어"
                className="h-12 flex-1 border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
                name="q"
                placeholder="병원, 부동산, 카센터 검색"
                type="search"
              />
              <button
                className="h-12 bg-ink px-6 text-sm font-bold text-paper transition hover:bg-neutral-800"
                type="submit"
              >
                검색
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8" id="categories">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <h2 className="text-3xl font-black">MVP Categories</h2>
          <p className="max-w-xl text-sm font-semibold leading-6 text-neutral-600">
            현재 MVP는 세 카테고리에서 시작합니다. 인물 리뷰 대상은 만들지 않습니다.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {categoryCards.map((category) => (
            <Link
              className="min-h-56 border border-line p-5 transition hover:border-ink"
              href={`/subjects?category=${category.id}`}
              key={category.id}
            >
              <p className="text-xs font-black uppercase text-neutral-500">
                {category.id}
              </p>
              <h3 className="mt-5 text-2xl font-black">{category.title}</h3>
              <p className="mt-4 text-base font-semibold leading-7 text-neutral-700">
                {category.problems}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-bone">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase text-neutral-500">
                X-risk rankings
              </p>
              <h2 className="mt-3 text-3xl font-black">
                지금 가장 많이 쌓인 불만
              </h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-neutral-700">
                사람들은 리뷰를 볼 때 1점부터 봅니다. Xreviews는 그 이유를
                모읍니다.
              </p>
            </div>
            <Link
              className="inline-flex h-12 items-center justify-center border border-ink px-6 text-sm font-bold transition hover:bg-ink hover:text-paper"
              href="/rankings"
            >
              랭킹 보기
            </Link>
          </div>

          {topRiskSubjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {topRiskSubjects.map((subject) => (
                <Link
                  className="min-h-60 border border-line bg-paper p-5 transition hover:border-ink"
                  href={`/subjects/${encodeURIComponent(subject.slug)}`}
                  key={subject.id}
                >
                  <p className="text-xs font-black uppercase text-neutral-500">
                    {subject.categoryLabel}
                  </p>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-black leading-tight">
                      {subject.name}
                    </h3>
                    <div className="border border-line px-3 py-2 text-right">
                      <p className="text-xs font-black uppercase text-neutral-500">
                        X-risk
                      </p>
                      <p className="text-2xl font-black">{subject.score}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-bold leading-6 text-neutral-600">
                    {subject.breakdown.publishedComplaintCount}건 공개 불만 ·{" "}
                    {subject.breakdown.evidenceBackedCount}건 증거 신호
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {subject.topRiskTags.slice(0, 3).map((tag) => (
                      <span
                        className="border border-line px-2 py-1 text-xs font-black text-neutral-600"
                        key={tag.id}
                      >
                        {tag.labelKo} {tag.count}회
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-line bg-paper p-6">
              <p className="text-base font-bold leading-7 text-neutral-700">
                공개 승인된 불만이 쌓이면 랭킹이 표시됩니다. pending 상태의
                불만은 랭킹에 반영하지 않습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <h2 className="text-4xl font-black leading-tight sm:text-5xl">
            {whyXreviews.title}
          </h2>
          <div className="space-y-5 text-lg font-semibold leading-8 text-neutral-200">
            {whyXreviews.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8" id="product-rules">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <h2 className="text-4xl font-black leading-tight">
            Product Rules
          </h2>
          <div className="divide-y divide-line border-y border-line">
            {productRules.map((rule) => (
              <p className="py-5 text-xl font-bold leading-8" key={rule}>
                {rule}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
