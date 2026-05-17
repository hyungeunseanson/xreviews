"use server";

import { z } from "zod";
import { createEvidenceUploadSession, EvidenceWriteError } from "@/server/evidence";
import { requireUser, USER_ROLES, type UserRole } from "@/server/session";

function normalizeRole(value: unknown): UserRole {
  return USER_ROLES.includes(value as UserRole) ? (value as UserRole) : "user";
}

function getEvidenceErrorMessage(error: unknown) {
  if (error instanceof EvidenceWriteError) {
    if (error.code === "storage") {
      return "R2 설정이 없어 증거 업로드를 진행할 수 없습니다. 환경변수 설정 후 다시 시도해주세요.";
    }

    if (error.code === "database") {
      return "DATABASE_URL이 없어 증거 메타데이터를 저장할 수 없습니다.";
    }

    return "증거 파일을 준비하지 못했습니다. 파일 정보를 다시 확인해주세요.";
  }

  if (error instanceof z.ZodError) {
    return "허용되지 않는 파일 형식이거나 파일이 너무 큽니다.";
  }

  return "증거 업로드 준비 중 문제가 발생했습니다.";
}

export async function createEvidenceUploadIntentAction(formData: FormData) {
  const session = await requireUser();

  try {
    const uploadSession = await createEvidenceUploadSession(
      {
        fileName: formData.get("fileName"),
        fileType: formData.get("fileType"),
        fileSizeBytes: formData.get("fileSizeBytes"),
        evidenceType: formData.get("evidenceType")
      },
      {
        userId: session.user.id,
        role: normalizeRole(session.user.role)
      }
    );

    return {
      status: "ready" as const,
      uploadUrl: uploadSession.uploadUrl,
      expiresInSeconds: uploadSession.expiresInSeconds,
      evidence: {
        id: uploadSession.evidenceId,
        fileName: uploadSession.fileName,
        fileType: uploadSession.fileType,
        fileSizeBytes: uploadSession.fileSizeBytes,
        evidenceType: uploadSession.evidenceType
      }
    };
  } catch (error) {
    return {
      status: "error" as const,
      message: getEvidenceErrorMessage(error)
    };
  }
}
