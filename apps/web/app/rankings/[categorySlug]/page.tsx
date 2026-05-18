import { notFound } from "next/navigation";
import { RankingView, getCategoryFromRankingSlug } from "../ranking-view";

export const dynamic = "force-dynamic";

type CategoryRankingPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
};

export default async function CategoryRankingPage({
  params
}: CategoryRankingPageProps) {
  const { categorySlug } = await params;
  const category = getCategoryFromRankingSlug(categorySlug);

  if (!category) {
    notFound();
  }

  return <RankingView category={category} />;
}
