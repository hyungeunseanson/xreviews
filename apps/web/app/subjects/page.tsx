import Link from "next/link";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  MVP_CATEGORIES,
  type MvpCategory
} from "@xreviews/shared/constants";
import { mvpCategorySchema } from "@xreviews/validators";
import { searchSubjects } from "@/server/subjects";

export const dynamic = "force-dynamic";

type SubjectsPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
  }>;
};

function parseCategory(value: string | undefined): MvpCategory | undefined {
  const parsed = mvpCategorySchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export default async function SubjectsPage({ searchParams }: SubjectsPageProps) {
  const params = await searchParams;
  const q = params?.q?.trim() || undefined;
  const category = parseCategory(params?.category);
  const result = await searchSubjects({ q, category, limit: 24 });
  const hasSearch = Boolean(q || category);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-bone">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <p className="text-sm font-black uppercase text-neutral-500">
            Subject Search
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="text-5xl font-black leading-tight">
                가기 전에 먼저 확인하세요.
              </h1>
              <p className="mt-5 max-w-2xl text-xl font-semibold leading-8 text-neutral-700">
                병원, 부동산, 카센터의 불만을 검색해보세요.
              </p>
            </div>
            <form
              action="/subjects"
              className="grid gap-3 sm:grid-cols-[1fr_220px_auto]"
              role="search"
            >
              <input
                aria-label="불만 대상 검색어"
                className="h-12 border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
                defaultValue={q}
                name="q"
                placeholder="상호명, 지역, 주소 검색"
                type="search"
              />
              <select
                aria-label="카테고리"
                className="h-12 border border-neutral-400 bg-paper px-4 text-base font-semibold text-ink outline-none focus:border-ink"
                defaultValue={category ?? ""}
                name="category"
              >
                <option value="">전체 카테고리</option>
                {MVP_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {CATEGORY_LABELS[item]}
                  </option>
                ))}
              </select>
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

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-black">
              {hasSearch ? "검색 결과" : "최근 등록된 대상"}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-neutral-600">
              개인에 대한 리뷰 대상은 만들 수 없습니다. MVP는 세
              카테고리만 허용합니다.
            </p>
          </div>
          <Link
            className="inline-flex h-12 items-center justify-center border border-ink px-5 text-sm font-bold transition hover:bg-ink hover:text-paper"
            href="/subjects/new"
          >
            대상 등록
          </Link>
        </div>

        {!result.dbConfigured ? (
          <div className="border border-line bg-bone p-6">
            <p className="text-lg font-black">DATABASE_URL이 필요합니다.</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-neutral-700">
              Neon 연결 후 subject 검색과 등록을 확인할 수 있습니다.
            </p>
          </div>
        ) : null}

        {result.dbConfigured && result.items.length === 0 ? (
          <div className="border border-line p-8">
            <p className="text-2xl font-black">검색 결과가 없습니다.</p>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-neutral-700">
              아직 등록된 대상이 없거나 검색어와 맞는 대상이 없습니다.
              로그인 후 먼저 대상을 등록할 수 있습니다.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4">
          {result.items.map((subject) => (
            <Link
              className="grid gap-4 border border-line p-5 transition hover:border-ink md:grid-cols-[1fr_220px]"
              href={`/subjects/${encodeURIComponent(subject.slug)}`}
              key={subject.id}
            >
              <div>
                <p className="text-xs font-black uppercase text-neutral-500">
                  {subject.category}
                </p>
                <h3 className="mt-2 text-2xl font-black">{subject.name}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-neutral-700">
                  {subject.locationSummary}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
                  {CATEGORY_DESCRIPTIONS[subject.category]}
                </p>
              </div>
              <div className="border-t border-line pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <p className="text-sm font-black">{subject.categoryLabel}</p>
                <p className="mt-4 text-sm font-semibold text-neutral-600">
                  X-risk score
                </p>
                <p className="mt-1 text-3xl font-black">
                  {subject.riskScore ?? "준비 중"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
