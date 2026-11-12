import Script from "next/script";

/**
 * GA4 + Microsoft Clarity, loaded only when their IDs are configured and only on the shop
 * (mounted in StoreShell, never in the admin). Scripts load after the page is interactive so
 * they don't affect LCP/INP.
 */
export function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID?.trim();
  const clarity = process.env.NEXT_PUBLIC_CLARITY_ID?.trim();
  const safe = (id: string) => /^[A-Za-z0-9-]+$/.test(id);

  return (
    <>
      {ga && safe(ga) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {clarity && safe(clarity) && (
        <Script id="clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}
        </Script>
      )}
    </>
  );
}
