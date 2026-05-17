import Link from "next/link";
import {
  getAdminQueueStatus,
  getAdminReviewQueue,
  getQueueStatuses,
  type AdminQueueStatus
} from "@/server/admin/moderation";
import { requireAdmin } from "@/server/session";

export const dynamic = "force-dynamic";

type AdminReviewsPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const statusLabels: Record<AdminQueueStatus, string> = {
  pending: "승인 대기",
  disputed: "분쟁",
  hidden: "숨김",
  removed: "제거"
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function AdminReviewsPage({
  searchParams
}: AdminReviewsPageProps) {
  await requireAdmin();
  const query = await searchParams;
  const status = getAdminQueueStatus(query?.status);
  const queue = await getAdminReviewQueue({ status });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-bone">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <p className="text-sm font-black uppercase text-neutral-500">
            Admin moderation
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight">
            관리자 리뷰 검토 큐
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-neutral-700">
            승인 전 불만은 공개되지 않습니다.
          </p>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-neutral-600">
            관리자는 리뷰를 삭제하지 않습니다. 상태를 변경하고 모든 조치를
            기록합니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-4">
          {getQueueStatuses().map((queueStatus) => {
            const active = queueStatus === status;

            return (
              <Link
                className={`border px-4 py-3 text-sm font-black transition ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-neutral-700 hover:border-ink hover:text-ink"
                }`}
                href={`/admin/reviews?status=${queueStatus}`}
                key={queueStatus}
              >
                <span className="block">{statusLabels[queueStatus]}</span>
                <span className="mt-2 block text-2xl">
                  {queue.counts[queueStatus]}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 overflow-x-auto border border-line">
          <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
            <thead className="bg-bone text-xs font-black uppercase text-neutral-500">
              <tr>
                <th className="border-b border-line px-4 py-3">리뷰</th>
                <th className="border-b border-line px-4 py-3">대상</th>
                <th className="border-b border-line px-4 py-3">작성자</th>
                <th className="border-b border-line px-4 py-3">태그</th>
                <th className="border-b border-line px-4 py-3">신호</th>
                <th className="border-b border-line px-4 py-3">증거</th>
                <th className="border-b border-line px-4 py-3">접수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {queue.items.map((review) => (
                <tr className="align-top" key={review.id}>
                  <td className="px-4 py-4">
                    <Link
                      className="font-black underline underline-offset-4"
                      href={`/admin/reviews/${review.id}`}
                    >
                      {review.title}
                    </Link>
                    <p className="mt-2 max-w-sm font-semibold leading-6 text-neutral-600">
                      {review.issueSummary}
                    </p>
                    <p className="mt-2 text-xs font-black uppercase text-neutral-500">
                      {review.status} · 문제 강도 {review.severityScore}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-black">{review.subjectName}</p>
                    <p className="mt-2 text-xs font-bold text-neutral-600">
                      {review.subjectCategoryLabel}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-semibold text-neutral-700">
                    {review.authorLabel}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {review.riskTags.map((tag) => (
                        <span
                          className="border border-line px-2 py-1 text-xs font-bold text-neutral-700"
                          key={tag}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold leading-6 text-neutral-700">
                    <p>
                      긍정 감지:{" "}
                      {review.positiveContentDetected ? "검토 필요" : "없음"}
                    </p>
                    <p>
                      의료 카테고리:{" "}
                      {review.isMedicalCategory ? "예" : "아니오"}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-black">
                    {review.evidenceCount}
                  </td>
                  <td className="px-4 py-4 font-semibold text-neutral-600">
                    {formatDate(review.createdAt)}
                  </td>
                </tr>
              ))}
              {queue.items.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-10 text-center font-bold text-neutral-600"
                    colSpan={7}
                  >
                    이 상태의 검토 대상 리뷰가 없습니다.
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
