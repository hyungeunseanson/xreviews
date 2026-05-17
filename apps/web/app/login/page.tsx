import Link from "next/link";
import { requestMagicLink } from "@/app/auth/actions";

const errorMessages: Record<string, string> = {
  "invalid-email": "이메일 형식을 다시 확인해주세요.",
  "missing-database-url":
    "DATABASE_URL이 없어 로그인 링크를 만들 수 없습니다. Neon 연결 후 다시 시도해주세요.",
  "magic-link": "로그인 링크 요청에 실패했습니다. 잠시 뒤 다시 시도해주세요."
};

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params?.error ? errorMessages[params.error] : undefined;

  return (
    <main className="min-h-[calc(100vh-73px)] bg-paper text-ink">
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-black uppercase text-neutral-500">
            Xreviews Auth
          </p>
          <h1 className="mt-5 max-w-2xl text-5xl font-black leading-tight sm:text-6xl">
            나쁜 후기부터 보는 사람들을 위한 로그인
          </h1>
          <p className="mt-6 max-w-xl text-xl font-semibold leading-8 text-neutral-700">
            Xreviews는 좋은 점을 묻지 않습니다. 피해야 할 이유를 남기기
            위해 먼저 로그인해주세요.
          </p>
        </div>

        <div className="border border-line bg-bone p-6 sm:p-8">
          <form action={requestMagicLink} className="space-y-5">
            <div>
              <label
                className="text-sm font-black uppercase text-neutral-600"
                htmlFor="email"
              >
                Email
              </label>
              <input
                autoComplete="email"
                className="mt-3 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none placeholder:text-neutral-500 focus:border-ink"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>
            {error ? (
              <p className="border-l-4 border-ink bg-paper px-4 py-3 text-sm font-semibold leading-6 text-neutral-700">
                {error}
              </p>
            ) : null}
            <button
              className="h-12 w-full bg-ink px-6 text-sm font-bold text-paper transition hover:bg-neutral-800"
              type="submit"
            >
              로그인 링크 받기
            </button>
          </form>
          <p className="mt-5 text-sm font-semibold leading-6 text-neutral-600">
            비밀번호 대신 이메일 링크로 로그인합니다. 링크는 짧은 시간 동안만
            유효합니다.
          </p>
          <Link
            className="mt-6 inline-flex text-sm font-bold text-ink underline underline-offset-4"
            href="/"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
