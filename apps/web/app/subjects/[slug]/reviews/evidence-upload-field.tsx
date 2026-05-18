"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  ALLOWED_EVIDENCE_FILE_TYPES,
  EVIDENCE_TYPES,
  MAX_EVIDENCE_FILE_SIZE_BYTES,
  type EvidenceType
} from "@xreviews/validators";
import { createEvidenceUploadIntentAction } from "@/app/subjects/[slug]/reviews/evidence-actions";
import { getFileSizeRange, trackAnalyticsEvent } from "@/lib/analytics";

type UploadedEvidence = {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  evidenceType: EvidenceType;
};

const evidenceTypeLabels: Record<EvidenceType, string> = {
  receipt: "영수증",
  invoice: "청구서",
  estimate: "견적서",
  contract: "계약서",
  photo: "사진",
  video: "영상",
  message: "메시지 캡처",
  other: "기타"
};

const allowedFileTypeSet = new Set<string>(ALLOWED_EVIDENCE_FILE_TYPES);

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export function EvidenceUploadField() {
  const [selectedEvidenceType, setSelectedEvidenceType] =
    useState<EvidenceType>("receipt");
  const [uploadedEvidence, setUploadedEvidence] = useState<UploadedEvidence[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accept = useMemo(() => ALLOWED_EVIDENCE_FILE_TYPES.join(","), []);

  function handleUpload() {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setMessage("업로드할 증거 파일을 선택해주세요.");
      return;
    }

    if (!allowedFileTypeSet.has(file.type)) {
      setMessage("JPG, PNG, WebP, PDF 파일만 올릴 수 있습니다.");
      return;
    }

    if (file.size > MAX_EVIDENCE_FILE_SIZE_BYTES) {
      setMessage("증거 파일은 10MB 이하만 올릴 수 있습니다.");
      return;
    }

    const formData = new FormData();
    formData.set("fileName", file.name);
    formData.set("fileType", file.type);
    formData.set("fileSizeBytes", String(file.size));
    formData.set("evidenceType", selectedEvidenceType);
    setMessage(null);
    trackAnalyticsEvent("evidence_upload_started", {
      evidenceType: selectedEvidenceType,
      fileSizeRange: getFileSizeRange(file.size)
    });

    startTransition(async () => {
      const result = await createEvidenceUploadIntentAction(formData);

      if (result.status === "error") {
        setMessage(result.message);
        return;
      }

      const uploadResponse = await fetch(result.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });

      if (!uploadResponse.ok) {
        setMessage("R2 업로드에 실패했습니다. 잠시 뒤 다시 시도해주세요.");
        return;
      }

      trackAnalyticsEvent("evidence_uploaded", {
        evidenceType: result.evidence.evidenceType,
        fileSizeRange: getFileSizeRange(result.evidence.fileSizeBytes)
      });

      setUploadedEvidence((current) => [
        ...current,
        {
          id: result.evidence.id,
          fileName: result.evidence.fileName,
          fileType: result.evidence.fileType,
          fileSizeBytes: result.evidence.fileSizeBytes,
          evidenceType: result.evidence.evidenceType
        }
      ]);
      setMessage("증거 파일이 비공개로 보관되었습니다.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  }

  return (
    <section className="border border-line bg-bone p-5">
      <div>
        <h2 className="text-xl font-black">
          증거를 추가하면 불만의 신뢰도가 올라갑니다.
        </h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-neutral-700">
          영수증, 견적서, 계약서, 사진, 메시지 캡처 등을 올릴 수 있습니다.
          증거 파일은 기본적으로 공개되지 않습니다.
        </p>
        <p className="mt-3 border-l-4 border-ink bg-paper px-4 py-3 text-sm font-bold leading-6 text-neutral-700">
          Xreviews는 증거를 공개 자랑거리로 쓰지 않습니다. 검토와 분쟁
          대응을 위해 안전하게 보관합니다.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[180px_1fr_auto]">
        <label className="block">
          <span className="text-xs font-black uppercase text-neutral-600">
            증거 종류
          </span>
          <select
            className="mt-2 h-11 w-full border border-neutral-400 bg-paper px-3 text-sm font-bold text-ink outline-none focus:border-ink"
            onChange={(event) =>
              setSelectedEvidenceType(event.target.value as EvidenceType)
            }
            value={selectedEvidenceType}
          >
            {EVIDENCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {evidenceTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase text-neutral-600">
            파일
          </span>
          <input
            accept={accept}
            className="mt-2 w-full border border-neutral-400 bg-paper px-3 py-2 text-sm font-bold text-neutral-700 file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-sm file:font-bold file:text-paper"
            ref={fileInputRef}
            type="file"
          />
        </label>

        <button
          className="h-11 self-end border border-ink px-4 text-sm font-black transition hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400"
          disabled={isPending}
          onClick={handleUpload}
          type="button"
        >
          {isPending ? "보관 중" : "증거 추가"}
        </button>
      </div>

      {message ? (
        <p className="mt-4 text-sm font-bold leading-6 text-neutral-700">
          {message}
        </p>
      ) : null}

      {uploadedEvidence.length > 0 ? (
        <div className="mt-5 divide-y divide-line border-y border-line bg-paper">
          {uploadedEvidence.map((evidence) => (
            <div
              className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_auto]"
              key={evidence.id}
            >
              <input name="evidenceIds" type="hidden" value={evidence.id} />
              <p className="font-black text-ink">{evidence.fileName}</p>
              <p className="font-semibold text-neutral-600">
                {evidenceTypeLabels[evidence.evidenceType]} · {evidence.fileType} ·{" "}
                {formatBytes(evidence.fileSizeBytes)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
