import { ClarityAnalytics } from "@/components/analytics/clarity";
import { Ga4Analytics } from "@/components/analytics/ga4";

export function ObservabilityPlaceholders() {
  return (
    <>
      <Ga4Analytics />
      <ClarityAnalytics />
    </>
  );
}
