import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ObservabilityPlaceholders } from "@/components/observability-placeholders";
import { SiteHeader } from "@/components/site-header";
import { initializeSentry } from "@/lib/observability";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xreviews",
  description:
    "Xreviews는 사람들이 먼저 찾는 나쁜 후기와 불만만 모으는 부정 경험 전용 리뷰 플랫폼입니다.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  )
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  initializeSentry();

  return (
    <html data-scroll-behavior="smooth" lang="ko">
      <body>
        <ObservabilityPlaceholders />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
