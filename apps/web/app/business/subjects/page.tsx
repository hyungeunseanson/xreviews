import Link from "next/link";
import { getBusinessSubjectsForActor } from "@/server/business";
import { requireBusinessOrAdmin } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function BusinessSubjectsPage() {
  const session = await requireBusinessOrAdmin();
  const subjects = await getBusinessSubjectsForActor({
    userId: session.user.id,
    role: session.user.role
  });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-bone">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <p className="text-sm font-black uppercase text-neutral-500">
            Business dashboard
          </p>
          <h1 className="mt-4 text-5xl font-black leading-tight">
            공식 계정 관리
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-neutral-700">
            공개된 불만에 답변하고, 개선 내용을 남길 수 있습니다.
          </p>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-neutral-600">
            삭제권이 아니라 대응권입니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-4">
          {subjects.map((item) => (
            <Link
              className="grid gap-4 border border-line p-5 transition hover:border-ink sm:grid-cols-[1fr_auto]"
              href={`/business/subjects/${item.subjectId}`}
              key={item.profileId}
            >
              <div>
                <p className="text-xs font-black uppercase text-neutral-500">
                  {item.subjectCategoryLabel}
                </p>
                <h2 className="mt-2 text-2xl font-black">{item.subjectName}</h2>
                <p className="mt-3 text-sm font-bold text-neutral-600">
                  {item.officialBadgeEnabled
                    ? "공식 인증 사업자"
                    : "공식 계정 미인증"}
                </p>
              </div>
              <div className="text-sm font-bold text-neutral-700 sm:text-right">
                <p>{item.subscriptionPlanLabel}</p>
                <p className="mt-2 uppercase">{item.subscriptionStatus ?? "active"}</p>
              </div>
            </Link>
          ))}
          {subjects.length === 0 ? (
            <div className="border border-line p-6">
              <h2 className="text-2xl font-black">승인된 공식 계정이 없습니다.</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-neutral-700">
                대상 페이지에서 공식 계정을 신청하고 관리자 승인을 기다려주세요.
                일반 사용자가 스스로 business 역할을 선택할 수는 없습니다.
              </p>
              <Link
                className="mt-6 inline-flex h-11 items-center justify-center border border-ink px-4 text-sm font-black transition hover:bg-ink hover:text-paper"
                href="/subjects"
              >
                대상 검색하기
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
