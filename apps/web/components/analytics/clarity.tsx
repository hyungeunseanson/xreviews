import Script from "next/script";
import { getPublicEnv } from "@xreviews/config";

export function ClarityAnalytics() {
  const env = getPublicEnv();
  const projectId = env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();

  if (!projectId) {
    return null;
  }

  return (
    <Script id="clarity-placeholder" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${projectId}");
      `}
    </Script>
  );
}
