import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-paper text-ink">
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl flex-col justify-center px-5 py-16 sm:px-8">
        <p className="text-sm font-black uppercase text-neutral-500">
          Check your email
        </p>
        <h1 className="mt-5 text-5xl font-black leading-tight">
          로그인 링크를 보냈습니다.
        </h1>
        <p className="mt-6 text-xl font-semibold leading-8 text-neutral-700">
          입력한 이메일로 보낸 링크를 확인해주세요. 링크를 열면 Xreviews
          계정으로 이동합니다.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex h-12 items-center justify-center bg-ink px-6 text-sm font-bold text-paper transition hover:bg-neutral-800"
            href="/login"
          >
            다른 이메일로 받기
          </Link>
          <Link
            className="inline-flex h-12 items-center justify-center border border-neutral-400 px-6 text-sm font-bold text-neutral-700 transition hover:border-ink hover:text-ink"
            href="/"
          >
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}
