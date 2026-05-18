import Link from "next/link";
import {
  getAdminBusinessClaimQueue,
  getBusinessClaimStatus,
  getBusinessClaimStatuses,
  type BusinessClaimStatus
} from "@/server/business";
import { requireAdmin } from "@/server/session";

export const dynamic = "force-dynamic";

type AdminBusinessClaimsPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const statusLabels: Record<BusinessClaimStatus, string> = {
  pending: "검토 대기",
  approved: "승인",
  rejected: "거절",
  revoked: "해지"
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function AdminBusinessClaimsPage({
  searchParams
}: AdminBusinessClaimsPageProps) {
  await requireAdmin();
  const query = await searchParams;
  const status = getBusinessClaimStatus(query?.status);
  const queue = await getAdminBusinessClaimQueue({ status });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-bone">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="text-sm font-bold text-neutral-600 underline underline-offset-4 transition hover:text-ink"
              href="/admin/reviews"
            >
              리뷰 큐
            </Link>
          </div>
          <p className="mt-8 text-sm font-black uppercase text-neutral-500">
            Admin business claims
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight">
            공식 계정 신청 검토
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-neutral-700">
            승인 여부와 모든 조치는 감사 로그에 기록됩니다.
          </p>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-neutral-600">
            공식 계정은 리뷰를 지우기 위한 권한이 아닙니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-4">
          {getBusinessClaimStatuses().map((claimStatus) => {
            const active = claimStatus === status;

            return (
              <Link
                className={`border px-4 py-3 text-sm font-black transition ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-neutral-700 hover:border-ink hover:text-ink"
                }`}
                href={`/admin/business-claims?status=${claimStatus}`}
                key={claimStatus}
              >
                <span className="block">{statusLabels[claimStatus]}</span>
                <span className="mt-2 block text-2xl">
                  {queue.counts[claimStatus]}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 overflow-x-auto border border-line">
          <table className="min-w-[1080px] w-full border-collapse text-left text-sm">
            <thead className="bg-bone text-xs font-black uppercase text-neutral-500">
              <tr>
                <th className="border-b border-line px-4 py-3">신청</th>
                <th className="border-b border-line px-4 py-3">대상</th>
                <th className="border-b border-line px-4 py-3">신청자</th>
                <th className="border-b border-line px-4 py-3">연락처</th>
                <th className="border-b border-line px-4 py-3">접수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {queue.items.map((claim) => (
                <tr className="align-top" key={claim.id}>
                  <td className="px-4 py-4">
                    <Link
                      className="font-black underline underline-offset-4"
                      href={`/admin/business-claims/${claim.id}`}
                    >
                      {claim.businessName}
                    </Link>
                    <p className="mt-2 text-xs font-black uppercase text-neutral-500">
                      {claim.status}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-black">{claim.subjectName}</p>
                    <p className="mt-2 text-xs font-bold text-neutral-600">
                      {claim.subjectCategoryLabel}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-neutral-700">
                      {claim.applicantName}
                    </p>
                    <p className="mt-2 text-xs font-bold text-neutral-500">
                      {claim.requesterLabel}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-neutral-700">
                    <p>{claim.contactEmail}</p>
                    <p className="mt-2">{claim.contactPhone ?? "전화번호 없음"}</p>
                  </td>
                  <td className="px-4 py-4 font-semibold text-neutral-600">
                    {formatDate(claim.createdAt)}
                  </td>
                </tr>
              ))}
              {queue.items.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-10 text-center font-bold text-neutral-600"
                    colSpan={5}
                  >
                    이 상태의 공식 계정 신청이 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
