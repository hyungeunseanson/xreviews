import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { getCurrentSession } from "@/server/session";

const navItems = [
  { label: "검색", href: "/subjects" },
  { label: "카테고리", href: "/#categories" },
  { label: "대상 등록", href: "/subjects/new" },
  { label: "원칙", href: "/#product-rules" }
] as const;

export async function SiteHeader() {
  const session = await getCurrentSession().catch(() => null);

  return (
    <header className="border-b border-line bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link className="text-lg font-black tracking-normal" href="/">
          Xreviews
        </Link>
        <nav aria-label="Main navigation" className="hidden gap-7 text-sm sm:flex">
          {navItems.map((item) => (
            <Link
              className="text-neutral-700 transition hover:text-ink"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {session ? (
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link
              className="border border-ink px-4 py-2 transition hover:bg-ink hover:text-paper"
              href="/account"
            >
              내 계정
            </Link>
            <form action={signOut}>
              <button
                className="px-2 py-2 text-neutral-600 transition hover:text-ink"
                type="submit"
              >
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <Link
            className="border border-ink px-4 py-2 text-sm font-semibold transition hover:bg-ink hover:text-paper"
            href="/login"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
