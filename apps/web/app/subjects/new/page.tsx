import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  MVP_CATEGORIES,
  type MvpCategory
} from "@xreviews/shared/constants";
import { mvpCategorySchema } from "@xreviews/validators";
import { createSubjectAction } from "@/app/subjects/actions";
import { requireUser } from "@/server/session";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  invalid: "입력값을 다시 확인해주세요. 대상명과 카테고리는 필수입니다.",
  database: "DATABASE_URL이 없어 대상을 등록할 수 없습니다.",
  create: "대상 등록에 실패했습니다. 잠시 뒤 다시 시도해주세요."
};

type NewSubjectPageProps = {
  searchParams?: Promise<{
    category?: string;
    error?: string;
  }>;
};

function parseDefaultCategory(value: string | undefined): MvpCategory {
  const parsed = mvpCategorySchema.safeParse(value);
  return parsed.success ? parsed.data : "medical_clinic";
}

export default async function NewSubjectPage({
  searchParams
}: NewSubjectPageProps) {
  await requireUser();
  const params = await searchParams;
  const defaultCategory = parseDefaultCategory(params?.category);
  const error = params?.error ? errorMessages[params.error] : undefined;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-black uppercase text-neutral-500">
            New Subject
          </p>
          <h1 className="mt-5 text-5xl font-black leading-tight">
            불만을 남길 대상을 먼저 등록하세요.
          </h1>
          <p className="mt-6 max-w-xl text-xl font-semibold leading-8 text-neutral-700">
            Xreviews는 병원/클리닉, 부동산, 카센터의 문제 경험을
            기록합니다.
          </p>
          <div className="mt-8 border-l-4 border-ink bg-bone px-5 py-4 text-sm font-bold leading-6 text-neutral-700">
            개인에 대한 리뷰 대상은 만들 수 없습니다. 병원/클리닉은 상담,
            가격, 환불, 대기, 위생, 광고불일치 같은 소비자 경험만 다룹니다.
            진단이나 치료 결과를 단정하는 대상 등록은 받지 않습니다.
          </div>
        </div>

        <form action={createSubjectAction} className="space-y-6 border border-line p-6">
          {error ? (
            <p className="border-l-4 border-ink bg-bone px-4 py-3 text-sm font-semibold leading-6 text-neutral-700">
              {error}
            </p>
          ) : null}

          <div>
            <label className="text-sm font-black uppercase text-neutral-600" htmlFor="name">
              대상명
            </label>
            <input
              className="mt-3 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
              id="name"
              maxLength={120}
              name="name"
              placeholder="상호명 또는 기관명"
              required
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-black uppercase text-neutral-600"
              htmlFor="category"
            >
              카테고리
            </label>
            <select
              className="mt-3 h-12 w-full border border-neutral-400 bg-paper px-4 text-base font-semibold text-ink outline-none focus:border-ink"
              defaultValue={defaultCategory}
              id="category"
              name="category"
              required
            >
              {MVP_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]} - {CATEGORY_DESCRIPTIONS[category]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="text-sm font-black uppercase text-neutral-600"
              htmlFor="description"
            >
              설명
            </label>
            <textarea
              className="mt-3 min-h-28 w-full resize-y border border-neutral-400 bg-paper px-4 py-3 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
              id="description"
              maxLength={500}
              name="description"
              placeholder="대상을 구분하는 데 필요한 설명만 적어주세요."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-black uppercase text-neutral-600" htmlFor="city">
                시/도
              </label>
              <input
                className="mt-3 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
                id="city"
                maxLength={80}
                name="city"
                placeholder="서울"
                type="text"
              />
            </div>
            <div>
              <label
                className="text-sm font-black uppercase text-neutral-600"
                htmlFor="district"
              >
                구/군
              </label>
              <input
                className="mt-3 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
                id="district"
                maxLength={80}
                name="district"
                placeholder="강남구"
                type="text"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-black uppercase text-neutral-600" htmlFor="address">
              주소
            </label>
            <input
              className="mt-3 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
              id="address"
              maxLength={240}
              name="address"
              placeholder="상세 주소 또는 위치 설명"
              type="text"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-black uppercase text-neutral-600" htmlFor="phone">
                전화번호
              </label>
              <input
                className="mt-3 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
                id="phone"
                maxLength={40}
                name="phone"
                placeholder="02-000-0000"
                type="tel"
              />
            </div>
            <div>
              <label className="text-sm font-black uppercase text-neutral-600" htmlFor="website">
                웹사이트
              </label>
              <input
                className="mt-3 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
                id="website"
                maxLength={2048}
                name="website"
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>

          <button
            className="h-12 w-full bg-ink px-6 text-sm font-bold text-paper transition hover:bg-neutral-800"
            type="submit"
          >
            대상 등록
          </button>
        </form>
      </section>
    </main>
  );
}
