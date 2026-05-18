"use client";

import Link from "next/link";
import type { MvpCategory } from "@xreviews/shared/constants";
import { getScoreRange, trackAnalyticsEvent } from "@/lib/analytics";

type RankingSubjectLinkProps = {
  className?: string;
  href: string;
  name: string;
  subjectId: string;
  category: MvpCategory;
  score: number;
};

export function RankingSubjectLink({
  className,
  href,
  name,
  subjectId,
  category,
  score
}: RankingSubjectLinkProps) {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => {
        trackAnalyticsEvent("ranking_subject_clicked", {
          subjectId,
          category,
          scoreRange: getScoreRange(score)
        });
      }}
    >
      {name}
    </Link>
  );
}
