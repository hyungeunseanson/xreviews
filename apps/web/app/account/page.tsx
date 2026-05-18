import { recordAnalyticsEvent } from "@/server/analytics";
import { requireUser } from "@/server/session";

export const dynamic = "force-dynamic";

type AccountPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const [session, params] = await Promise.all([requireUser(), searchParams]);
  const role = session.user.role;

  recordAnalyticsEvent(
    "login_completed",
    {},
    {
      actorUserId: session.user.id,
      actorRole: role === "business" || role === "admin" ? role : "user"
    }
  ).catch((error: unknown) => {
    console.error("[Xreviews analytics] Failed to record login_completed", error);
  });

  return (
    <main className="min-h-[calc(100vh-73px)] bg-paper text-ink">
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <p className="text-sm font-black uppercase text-neutral-500">
          Account
        </p>
        <h1 className="mt-5 text-5xl font-black leading-tight">내 계정</h1>
        <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-neutral-700">
          인증 상태만 확인합니다. 역할은 사용자가 직접 바꿀 수 없습니다.
        </p>

        {params?.error === "forbidden" ? (
          <p className="mt-8 border-l-4 border-ink bg-bone px-4 py-3 text-sm font-semibold leading-6 text-neutral-700">
            이 계정으로는 해당 작업을 할 수 없습니다.
          </p>
        ) : null}

        <dl className="mt-10 divide-y divide-line border-y border-line">
          <div className="grid gap-2 py-5 sm:grid-cols-[180px_1fr]">
            <dt className="text-sm font-black uppercase text-neutral-500">
              Email
            </dt>
            <dd className="font-semibold text-neutral-800">
              {session.user.email}
            </dd>
          </div>
          <div className="grid gap-2 py-5 sm:grid-cols-[180px_1fr]">
            <dt className="text-sm font-black uppercase text-neutral-500">
              Name
            </dt>
            <dd className="font-semibold text-neutral-800">
              {session.user.name || "이름 없음"}
            </dd>
          </div>
          <div className="grid gap-2 py-5 sm:grid-cols-[180px_1fr]">
            <dt className="text-sm font-black uppercase text-neutral-500">
              Role
            </dt>
            <dd className="font-semibold text-neutral-800">{role}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
