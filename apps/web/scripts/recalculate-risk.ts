import path from "node:path";
import dotenv from "dotenv";
import { MVP_CATEGORIES, type MvpCategory } from "@xreviews/shared/constants";
import { recalculateRiskScores } from "../server/risk-score";

function getCategoryArg() {
  const inlineArg = process.argv.find((arg) => arg.startsWith("--category="));

  if (inlineArg) {
    return inlineArg.slice("--category=".length).trim();
  }

  const categoryFlagIndex = process.argv.indexOf("--category");

  return categoryFlagIndex >= 0
    ? process.argv[categoryFlagIndex + 1]?.trim()
    : undefined;
}

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const categoryArg = getCategoryArg();
const category = categoryArg ? (categoryArg as MvpCategory) : undefined;

if (category && !MVP_CATEGORIES.includes(category)) {
  console.error(
    JSON.stringify({
      ok: false,
      error: "Invalid category.",
      allowedCategories: MVP_CATEGORIES
    })
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL?.trim()) {
  console.error(JSON.stringify({ ok: false, error: "DATABASE_URL is required." }));
  process.exit(1);
}

const result = await recalculateRiskScores({ category });

console.log(
  JSON.stringify(
    {
      ok: true,
      category: category ?? "all",
      recalculatedCount: result.recalculatedCount,
      rankedCount: result.rankedCount,
      calculatedAt: result.calculatedAt.toISOString(),
      topSubjects: result.topSubjects
    },
    null,
    2
  )
);
