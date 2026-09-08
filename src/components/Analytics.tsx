import Script from "next/script";

/**
 * 可选统计：在 Netlify 等环境配置其一即可。
 * - Plausible：NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
 *   自托管脚本：另设 NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL=https://stats.example.com/js/script.js
 * - GA4：NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX
 */
export function Analytics() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
  const plausibleScript =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL?.trim() ||
    (plausibleDomain ? "https://plausible.io/js/script.js" : "");
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  return (
    <>
      {plausibleDomain && plausibleScript ? (
        <Script
          defer
          data-domain={plausibleDomain}
          src={plausibleScript}
          strategy="afterInteractive"
        />
      ) : null}
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaId)}, { anonymize_ip: true });
            `.trim()}
          </Script>
        </>
      ) : null}
    </>
  );
}
