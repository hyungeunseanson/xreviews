import { NextResponse } from "next/server";
import {
  AdminModerationError,
  getAdminEvidenceSignedReadUrl
} from "@/server/admin/moderation";
import { requireAdmin } from "@/server/session";

export const dynamic = "force-dynamic";

type EvidenceReadRouteProps = {
  params: Promise<{
    id: string;
    evidenceId: string;
  }>;
};

export async function GET(_request: Request, { params }: EvidenceReadRouteProps) {
  const session = await requireAdmin();
  const { id, evidenceId } = await params;

  try {
    const { readUrl } = await getAdminEvidenceSignedReadUrl({
      reviewId: id,
      evidenceId,
      actor: {
        userId: session.user.id,
        role: "admin"
      }
    });

    return NextResponse.redirect(readUrl);
  } catch (error) {
    if (error instanceof AdminModerationError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.code === "not_found" ? 404 : 403 }
      );
    }

    console.error("[Xreviews admin] Failed to create evidence read URL", error);
    return NextResponse.json(
      { error: { code: "signed_read_failed", message: "Evidence read failed." } },
      { status: 500 }
    );
  }
}
