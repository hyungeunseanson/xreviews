import Link from "next/link";
import { notFound } from "next/navigation";
import {
  approveReviewAction,
  disputeReviewAction,
  hideReviewAction,
  removeReviewAction
} from "@/app/admin/reviews/[id]/actions";
import { getAdminReviewDetail } from "@/server/admin/moderation";
import { requireAdmin } from "@/server/session";

export const dynamic = "force-dynamic";

type AdminReviewDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    result?: string;
  }>;
};

const resultMessages: Record<string, string> = {
  approve: "공개 승인 처리했습니다.",
  dispute: "분쟁 상태로 변경했습니다.",
  hide: "숨김 상태로 변경했습니다.",
  remove: "제거 상태로 변경했습니다.",
  "error-transition": "현재 상태에서는 해당 조치를 적용할 수 없습니다.",
  "error-not_found": "리뷰를 찾을 수 없습니다.",
  "error-database": "DATABASE_URL이 없어 관리자 조치를 저장할 수 없습니다.",
  "error-update": "관리자 조치 저장에 실패했습니다."
};

function formatDate(date: Date | null) {
  if (!date) {
    return "없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

function ActionForm({
  action,
  buttonLabel,
  defaultReason
}: {
  action: (formData: FormData) => Promise<void>;
  buttonLabel: string;
  defaultReason: string;
}) {
  return (
    <form action={action} className="space-y-3 border border-line p-4">
      <label className="block">
        <span className="text-xs font-black uppercase text-neutral-500">
          처리 사유
        </span>
        <input
          className="mt-2 h-10 w-full border border-neutral-400 bg-paper px-3 text-sm text-ink outline-none focus:border-ink"
          defaultValue={defaultReason}
          maxLength={200}
          name="reason"
        />
      </label>
      <label className="block">
        <span className="text-xs font-black uppercase text-neutral-500">
          관리자 메모
        </span>
        <textarea
          className="mt-2 min-h-24 w-full resize-y border border-neutral-400 bg-paper px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-ink"
          maxLength={1000}
          name="adminNote"
          placeholder="검토 근거를 짧게 남기세요. 이 메모는 공개되지 않습니다."
        />
      </label>
      <button
        className="h-10 w-full bg-ink px-4 text-sm font-black text-paper transition hover:bg-neutral-800"
        type="submit"
      >
        {buttonLabel}
      </button>
    </form>
  );
}

export default async function AdminReviewDetailPage({
  params,
  searchParams
}: AdminReviewDetailPageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const review = await getAdminReviewDetail(id);

  if (!review) {
    notFound();
  }

  const approveAction = approveReviewAction.bind(null, review.id);
  const disputeAction = disputeReviewAction.bind(null, review.id);
  const hideAction = hideReviewAction.bind(null, review.id);
  const removeAction = removeReviewAction.bind(null, review.id);
  const result = query?.result ? resultMessages[query.result] : undefined;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line bg-bone">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <Link
            className="text-sm font-bold text-neutral-600 underline underline-offset-4 transition hover:text-ink"
            href={`/admin/reviews?status=${review.status === "published" ? "pending" : review.status}`}
          >
            관리자 큐로 돌아가기
          </Link>
          <p className="mt-8 text-sm font-black uppercase text-neutral-500">
            Review moderation detail
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight">
            {review.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-neutral-700">
            증거 파일은 비공개입니다. 검토 목적으로만 임시 접근할 수 있습니다.
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
            <h2 className="text-xl font-black">리뷰 본문</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-black uppercase text-neutral-500">
                  상태
                </dt>
                <dd className="mt-1 font-black">{review.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-neutral-500">
                  대상
                </dt>
                <dd className="mt-1 font-black">
                  {review.subjectName} · {review.subjectCategoryLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-neutral-500">
                  작성자
                </dt>
                <dd className="mt-1 font-semibold text-neutral-700">
                  {review.authorLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-neutral-500">
                  접수
                </dt>
                <dd className="mt-1 font-semibold text-neutral-700">
                  {formatDate(review.createdAt)}
                </dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-sm font-black uppercase text-neutral-500">
                한 줄 문제 요약
              </p>
              <p className="mt-2 text-lg font-bold leading-8">
                {review.issueSummary}
              </p>
              <p className="mt-6 text-sm font-black uppercase text-neutral-500">
                상세 내용
              </p>
              <p className="mt-2 whitespace-pre-wrap text-base font-semibold leading-8 text-neutral-700">
                {review.body}
              </p>
            </div>
          </section>

          <section className="border border-line p-5">
            <h2 className="text-xl font-black">검토 신호</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <p className="border border-line p-3 text-sm font-bold">
                문제 강도
                <span className="mt-2 block text-2xl font-black">
                  {review.severityScore}
                </span>
              </p>
              <p className="border border-line p-3 text-sm font-bold">
                증거 수준
                <span className="mt-2 block text-2xl font-black">
                  {review.evidenceLevel}
                </span>
              </p>
              <p className="border border-line p-3 text-sm font-bold">
                의료 카테고리
                <span className="mt-2 block text-2xl font-black">
                  {review.isMedicalCategory ? "예" : "아니오"}
                </span>
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {review.riskTags.map((tag) => (
                <span
                  className="border border-line px-3 py-2 text-sm font-bold text-neutral-700"
                  key={tag.id}
                >
                  {tag.labelKo}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm font-bold text-neutral-600">
              긍정 콘텐츠 감지:{" "}
              {review.positiveContentDetected ? "검토 필요" : "없음"} · 책임 확인:{" "}
              {review.authorLiabilityConfirmed ? "완료" : "미완료"}
            </p>
          </section>

          <section className="border border-line p-5">
            <h2 className="text-xl font-black">증거 메타데이터</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-neutral-600">
              object key는 화면에 표시하지 않습니다. 임시 보기 버튼은 짧게
              만료되는 signed read URL을 발급합니다.
            </p>
            <div className="mt-5 divide-y divide-line border-y border-line">
              {review.evidence.map((evidence) => (
                <div
                  className="grid gap-3 py-4 sm:grid-cols-[1fr_auto]"
                  key={evidence.id}
                >
                  <div>
                    <p className="font-black">{evidence.fileName}</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-600">
                      {evidence.evidenceType} · {evidence.fileType} ·{" "}
                      {formatBytes(evidence.fileSizeBytes)}
                    </p>
                  </div>
                  <Link
                    className="inline-flex h-10 items-center justify-center border border-ink px-4 text-sm font-black transition hover:bg-ink hover:text-paper"
                    href={`/admin/reviews/${review.id}/evidence/${evidence.id}`}
                    target="_blank"
                  >
                    임시 보기
                  </Link>
                </div>
              ))}
              {review.evidence.length === 0 ? (
                <p className="py-6 text-sm font-bold text-neutral-600">
                  등록된 증거 파일이 없습니다.
                </p>
              ) : null}
            </div>
          </section>

          <section className="border border-line p-5">
            <h2 className="text-xl font-black">모더레이션 케이스</h2>
            <div className="mt-5 divide-y divide-line border-y border-line">
              {review.moderationCases.map((item) => (
                <article className="py-4" key={item.id}>
                  <p className="font-black">
                    {item.status} · {item.reason}
                  </p>
                  {item.decision ? (
                    <p className="mt-2 text-sm font-semibold leading-6 text-neutral-700">
                      {item.decision}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-bold text-neutral-500">
                    {formatDate(item.createdAt)} · updated{" "}
                    {formatDate(item.updatedAt)}
                  </p>
                </article>
              ))}
              {review.moderationCases.length === 0 ? (
                <p className="py-6 text-sm font-bold text-neutral-600">
                  아직 모더레이션 케이스가 없습니다.
                </p>
              ) : null}
            </div>
          </section>

          <section className="border border-line p-5">
            <h2 className="text-xl font-black">최근 audit history</h2>
            <div className="mt-5 divide-y divide-line border-y border-line">
              {review.auditLogs.map((item) => (
                <article className="py-3" key={item.id}>
                  <p className="font-black">{item.action}</p>
                  <p className="mt-1 text-xs font-bold text-neutral-500">
                    {formatDate(item.createdAt)}
                  </p>
                </article>
              ))}
              {review.auditLogs.length === 0 ? (
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
            buttonLabel="공개 승인"
            defaultReason="publishable_complaint"
          />
          <ActionForm
            action={disputeAction}
            buttonLabel="분쟁 처리"
            defaultReason="dispute_or_legal_review"
          />
          <ActionForm
            action={hideAction}
            buttonLabel="숨김 처리"
            defaultReason="temporary_risk_or_privacy_review"
          />
          <ActionForm
            action={removeAction}
            buttonLabel="제거 상태로 변경"
            defaultReason="policy_or_legal_violation"
          />
        </aside>
      </section>
    </main>
  );
}
