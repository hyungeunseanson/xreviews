import Script from "next/script";
import { getPublicEnv } from "@xreviews/config";

export function ObservabilityPlaceholders() {
  const env = getPublicEnv();

  return (
    <>
      {env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-placeholder" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      ) : null}

      {env.NEXT_PUBLIC_CLARITY_PROJECT_ID ? (
        <Script id="clarity-placeholder" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
          `}
        </Script>
      ) : null}
    </>
  );
}
