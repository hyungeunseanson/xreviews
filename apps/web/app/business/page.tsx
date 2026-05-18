import { redirect } from "next/navigation";
import { requireBusinessOrAdmin } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function BusinessPage() {
  await requireBusinessOrAdmin();
  redirect("/business/subjects");
}
