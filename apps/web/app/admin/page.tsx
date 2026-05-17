import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  redirect("/admin/reviews");
}
