"use client";

import Script from "next/script";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useGoogleTagManager } from "@/lib/hooks/useGoogleTagManager";

interface Props {
  gtmId: string;
}

function isValidGtmId(gtmId: string) {
  return /^GTM-[A-Z0-9]+$/i.test(gtmId.trim());
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gtm = useGoogleTagManager();

  useEffect(() => {
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    gtm.pageView({
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [gtm, pathname, searchParams]);

  return null;
}

export default function GoogleTagManager({ gtmId }: Props) {
  const id = gtmId.trim();
  if (!isValidGtmId(id)) return null;

  return (
    <>
      <Script
        id="gtm-loader"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer',${JSON.stringify(id)});
          `,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${id}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
