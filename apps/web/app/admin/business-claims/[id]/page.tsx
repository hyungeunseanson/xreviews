import Link from "next/link";
import { notFound } from "next/navigation";
import {
  approveBusinessClaimAction,
  rejectBusinessClaimAction,
  revokeBusinessClaimAction
} from "@/app/admin/business-claims/[id]/actions";
import { getAdminBusinessClaimDetail } from "@/server/business";
import { requireAdmin } from "@/server/session";

export const dynamic = "force-dynamic";

type AdminBusinessClaimDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    result?: string;
  }>;
};

const resultMessages: Record<string, string> = {
  approve: "공식 계정 신청을 승인했습니다.",
  reject: "공식 계정 신청을 거절했습니다.",
  revoke: "공식 계정 인증을 해지했습니다.",
  "error-transition": "현재 상태에서는 해당 조치를 적용할 수 없습니다.",
  "error-not_found": "신청을 찾을 수 없습니다.",
  "error-database": "DATABASE_URL이 없어 조치를 저장할 수 없습니다.",
  "error-update": "관리자 조치 저장에 실패했습니다."
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function ActionForm({
  action,
  label,
  placeholder
}: {
  action: (formData: FormData) => Promise<void>;
  label: string;
  placeholder: string;
}) {
  return (
    <form action={action} className="space-y-3 border border-line p-4">
      <label className="block">
        <span className="text-xs font-black uppercase text-neutral-500">
          관리자 메모
        </span>
        <textarea
          className="mt-2 min-h-24 w-full resize-y border border-neutral-400 bg-paper px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-ink"
          maxLength={1000}
          name="adminNote"
          placeholder={placeholder}
        />
      </label>
      <button
        className="h-10 w-full bg-ink px-4 text-sm font-black text-paper transition hover:bg-neutral-800"
        type="submit"
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminBusinessClaimDetailPage({
  params,
  searchParams
}: AdminBusinessClaimDetailPageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const claim = await getAdminBusinessClaimDetail(id);

  if (!claim) {
    notFound();
  }

  const approveAction = approveBusinessClaimAction.bind(null, claim.id);
  const rejectAction = rejectBusinessClaimAction.bind(null, claim.id);
  const revokeAction = revokeBusinessClaimAction.bind(null, claim.id);
  const result = query?.result ? resultMessages[query.result] : undefined;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-bone">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <Link
            className="text-sm font-bold text-neutral-600 underline underline-offset-4 transition hover:text-ink"
            href={`/admin/business-claims?status=${claim.status}`}
          >
            공식 계정 신청 큐로 돌아가기
          </Link>
          <p className="mt-8 text-sm font-black uppercase text-neutral-500">
            Business claim detail
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight">
            {claim.businessName}
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-neutral-700">
            승인 여부와 모든 조치는 감사 로그에 기록됩니다.
          </p>
          {result ? (
            <p className="mt-6 border-l-4 border-ink bg-paper px-4 py-3 text-sm font-bold text-neutral-700">
              {result}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="border border-line p-5">
            <h2 className="text-xl font-black">신청 내용</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-black uppercase text-neutral-500">
                  상태
                </dt>
                <dd className="mt-1 font-black">{claim.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-neutral-500">
                  대상
                </dt>
                <dd className="mt-1 font-black">
                  {claim.subjectName} · {claim.subjectCategoryLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-neutral-500">
                  신청자
                </dt>
                <dd className="mt-1 font-semibold text-neutral-700">
                  {claim.applicantName} · {claim.requesterLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-neutral-500">
                  접수
                </dt>
                <dd className="mt-1 font-semibold text-neutral-700">
                  {formatDate(claim.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-neutral-500">
                  연락 이메일
                </dt>
                <dd className="mt-1 font-semibold text-neutral-700">
                  {claim.contactEmail}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-neutral-500">
                  연락처
                </dt>
                <dd className="mt-1 font-semibold text-neutral-700">
                  {claim.contactPhone ?? "없음"}
                </dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-sm font-black uppercase text-neutral-500">
                설명/증빙 설명
              </p>
              <p className="mt-2 whitespace-pre-wrap text-base font-semibold leading-8 text-neutral-700">
                {claim.verificationNote ?? "없음"}
              </p>
              {claim.adminNote ? (
                <>
                  <p className="mt-6 text-sm font-black uppercase text-neutral-500">
                    관리자 메모
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-base font-semibold leading-8 text-neutral-700">
                    {claim.adminNote}
                  </p>
                </>
              ) : null}
            </div>
          </section>

          <section className="border border-line p-5">
            <h2 className="text-xl font-black">공식 프로필</h2>
            {claim.profile ? (
              <p className="mt-4 text-sm font-bold leading-6 text-neutral-700">
                {claim.profile.officialDisplayName ?? claim.businessName} · 배지{" "}
                {claim.profile.officialBadgeEnabled ? "활성" : "비활성"}
              </p>
            ) : (
              <p className="mt-4 text-sm font-bold leading-6 text-neutral-700">
                아직 생성된 공식 프로필이 없습니다.
              </p>
            )}
            <p className="mt-4 border-l-4 border-ink bg-bone px-4 py-3 text-sm font-bold leading-6 text-neutral-700">
              승인해도 사업자는 리뷰 상태를 바꾸거나 리뷰를 삭제할 수 없습니다.
            </p>
          </section>

          <section className="border border-line p-5">
            <h2 className="text-xl font-black">최근 audit history</h2>
            <div className="mt-5 divide-y divide-line border-y border-line">
              {claim.auditLogs.map((item) => (
                <article className="py-3" key={item.id}>
                  <p className="font-black">{item.action}</p>
                  <p className="mt-1 text-xs font-bold text-neutral-500">
                    {formatDate(item.createdAt)}
                  </p>
                </article>
              ))}
              {claim.auditLogs.length === 0 ? (
                <p className="py-6 text-sm font-bold text-neutral-600">
                  기록된 audit log가 없습니다.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <ActionForm
            action={approveAction}
            label="공식 계정 승인"
            placeholder="승인 근거를 남기세요."
          />
          <ActionForm
            action={rejectAction}
            label="신청 거절"
            placeholder="거절 사유를 남기세요."
          />
          <ActionForm
            action={revokeAction}
            label="공식 인증 해지"
            placeholder="해지 사유를 남기세요."
          />
        </aside>
      </section>
    </main>
  );
}
