import Link from "next/link";
import { notFound } from "next/navigation";
import { submitBusinessClaimAction } from "@/app/subjects/[slug]/claim/actions";
import { recordAnalyticsEvent } from "@/server/analytics";
import { getBusinessClaimStateForSubject } from "@/server/business";
import { requireUser } from "@/server/session";
import { getSubjectBySlugOrId } from "@/server/subjects";

export const dynamic = "force-dynamic";

type ClaimPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    result?: string;
  }>;
};

const resultMessages: Record<string, string> = {
  submitted: "공식 계정 신청이 접수되었습니다. 관리자 검토 후 처리됩니다.",
  "error-invalid": "입력값을 다시 확인해주세요.",
  "error-database": "DATABASE_URL이 없어 신청을 저장할 수 없습니다.",
  "error-duplicate": "이미 신청했거나 승인된 공식 계정이 있습니다.",
  "error-not_found": "신청할 수 있는 대상이 아닙니다.",
  "error-forbidden": "이 계정으로는 공식 계정 신청을 할 수 없습니다."
};

export default async function SubjectClaimPage({
  params,
  searchParams
}: ClaimPageProps) {
  const [{ slug }, query, session] = await Promise.all([
    params,
    searchParams,
    requireUser()
  ]);
  const subject = await getSubjectBySlugOrId(slug);

  if (!subject || subject.status !== "active") {
    notFound();
  }

  const claimState = await getBusinessClaimStateForSubject({
    subjectId: subject.id,
    userId: session.user.id
  });
  const result = query?.result ? resultMessages[query.result] : undefined;
  const action = submitBusinessClaimAction.bind(null, subject.slug, subject.id);
  const approvedProfile = claimState.approvedProfile?.officialBadgeEnabled
    ? claimState.approvedProfile
    : null;
  const userClaim = claimState.userClaim;

  recordAnalyticsEvent(
    "business_claim_started",
    {
      subjectId: subject.id,
      category: subject.category
    },
    {
      actorUserId: session.user.id,
      actorRole: session.user.role
    }
  ).catch((analyticsError: unknown) => {
    console.error(
      "[Xreviews analytics] Failed to record business_claim_started",
      analyticsError
    );
  });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-bone">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
          <Link
            className="text-sm font-bold text-neutral-600 underline underline-offset-4 transition hover:text-ink"
            href={`/subjects/${encodeURIComponent(subject.slug)}`}
          >
            대상 페이지로 돌아가기
          </Link>
          <p className="mt-8 text-sm font-black uppercase text-neutral-500">
            Business official account
          </p>
          <h1 className="mt-4 text-5xl font-black leading-tight">
            이 업체의 공식 계정 신청
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-neutral-700">
            승인되면 공식 답변과 개선 포스트를 작성할 수 있습니다.
          </p>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-neutral-600">
            사업자는 리뷰를 삭제할 수 없습니다.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_320px]">
        <div>
          {result ? (
            <p className="mb-6 border-l-4 border-ink bg-bone px-4 py-3 text-sm font-bold leading-6 text-neutral-700">
              {result}
            </p>
          ) : null}

          {approvedProfile ? (
            <div className="border border-line p-6">
              <h2 className="text-2xl font-black">공식 인증 사업자</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-neutral-700">
                이 대상은 이미 Xreviews에서 공식 계정을 인증했습니다. 이 배지는
                서비스 품질 보증이 아니라 공식 계정 인증입니다.
              </p>
            </div>
          ) : userClaim && ["pending", "approved"].includes(userClaim.status) ? (
            <div className="border border-line p-6">
              <h2 className="text-2xl font-black">신청 상태: {userClaim.status}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-neutral-700">
                이미 접수된 신청이 있습니다. 승인 여부와 모든 조치는 감사 로그에
                기록됩니다.
              </p>
            </div>
          ) : (
            <form action={action} className="space-y-6">
              <label className="block">
                <span className="text-sm font-black uppercase text-neutral-600">
                  사업자명
                </span>
                <input
                  className="mt-2 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none focus:border-ink"
                  defaultValue={subject.name}
                  maxLength={140}
                  minLength={2}
                  name="businessName"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-black uppercase text-neutral-600">
                  담당자명
                </span>
                <input
                  className="mt-2 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none focus:border-ink"
                  maxLength={100}
                  minLength={2}
                  name="applicantName"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-black uppercase text-neutral-600">
                  연락 이메일
                </span>
                <input
                  className="mt-2 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none focus:border-ink"
                  defaultValue={session.user.email}
                  maxLength={254}
                  name="contactEmail"
                  required
                  type="email"
                />
              </label>
              <label className="block">
                <span className="text-sm font-black uppercase text-neutral-600">
                  전화번호
                </span>
                <input
                  className="mt-2 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none focus:border-ink"
                  maxLength={40}
                  name="contactPhone"
                />
              </label>
              <label className="block">
                <span className="text-sm font-black uppercase text-neutral-600">
                  사업자등록번호 또는 내부 확인값
                </span>
                <input
                  className="mt-2 h-12 w-full border border-neutral-400 bg-paper px-4 text-base text-ink outline-none focus:border-ink"
                  maxLength={80}
                  name="registrationNumber"
                />
              </label>
              <label className="block">
                <span className="text-sm font-black uppercase text-neutral-600">
                  설명/증빙 설명
                </span>
                <textarea
                  className="mt-2 min-h-40 w-full resize-y border border-neutral-400 bg-paper px-4 py-3 text-base leading-7 text-ink outline-none focus:border-ink"
                  maxLength={1000}
                  minLength={10}
                  name="verificationNote"
                  placeholder="이 업체와의 관계, 확인 가능한 정보, 관리자에게 전달할 내용을 적어주세요."
                  required
                />
              </label>
              <button
                className="h-12 w-full bg-ink px-6 text-sm font-black text-paper transition hover:bg-neutral-800"
                type="submit"
              >
                공식 계정 신청하기
              </button>
            </form>
          )}
        </div>

        <aside className="border border-line p-5">
          <p className="text-sm font-black uppercase text-neutral-500">
            Claim target
          </p>
          <h2 className="mt-4 text-2xl font-black">{subject.name}</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-neutral-600">
            {subject.categoryLabel} · {subject.locationSummary}
          </p>
          <p className="mt-5 border-l-4 border-ink bg-bone px-4 py-3 text-sm font-bold leading-6 text-neutral-700">
            공식 계정은 리뷰를 지우기 위한 도구가 아닙니다. 공개된 불만에
            답변하고, 개선 내용을 남기기 위한 채널입니다.
          </p>
        </aside>
      </section>
    </main>
  );
}
