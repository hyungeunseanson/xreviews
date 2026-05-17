import Link from "next/link";
import {
  categoryCards,
  heroCopy,
  productRules,
  whyXreviews
} from "@xreviews/shared/copy";
import { PRODUCT_RULES } from "@xreviews/shared/constants";

const navItems = ["검색", "카테고리", "공식계정"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link className="text-lg font-black tracking-normal" href="/">
          Xreviews
        </Link>
        <nav aria-label="Main navigation" className="hidden gap-7 text-sm sm:flex">
          {navItems.map((item) => (
            <a className="text-neutral-700 transition hover:text-ink" href="#search" key={item}>
              {item}
            </a>
          ))}
        </nav>
        <a
          className="border border-ink px-4 py-2 text-sm font-semibold transition hover:bg-ink hover:text-paper"
          href="#product-rules"
        >
          원칙 보기
        </a>
      </header>

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
            <a
              className="inline-flex h-12 items-center justify-center bg-ink px-6 text-sm font-bold text-paper transition hover:bg-neutral-800"
              href="#search"
            >
              {heroCopy.primaryCta}
            </a>
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
            <form className="flex flex-col gap-3 sm:flex-row" role="search">
              <input
                aria-label="불만 검색어"
                className="h-12 flex-1 border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
                placeholder="병원, 부동산, 카센터 검색"
                readOnly
                type="search"
              />
              <button
                aria-disabled="true"
                className="h-12 cursor-not-allowed bg-neutral-300 px-6 text-sm font-bold text-neutral-600"
                disabled
                type="button"
              >
                검색 준비 중
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <h2 className="text-3xl font-black">MVP Categories</h2>
          <p className="max-w-xl text-sm font-semibold leading-6 text-neutral-600">
            현재 MVP는 세 카테고리에서 시작합니다. 인물 리뷰 대상은 만들지 않습니다.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {categoryCards.map((category) => (
            <article
              className="min-h-56 border border-line p-5 transition hover:border-ink"
              key={category.id}
            >
              <p className="text-xs font-black uppercase text-neutral-500">
                {category.id}
              </p>
              <h3 className="mt-5 text-2xl font-black">{category.title}</h3>
              <p className="mt-4 text-base font-semibold leading-7 text-neutral-700">
                {category.problems}
              </p>
            </article>
          ))}
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
