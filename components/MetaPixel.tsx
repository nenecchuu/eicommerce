"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import { flushMetaPixelQueue, trackMetaPixel } from "@/lib/hooks/useMetaPixel";

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skippedInitialPageView = useRef(false);

  useEffect(() => {
    if (!skippedInitialPageView.current) {
      skippedInitialPageView.current = true;
      return;
    }

    trackMetaPixel("PageView");
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel({ pixelId }: { pixelId: string }) {
  const id = pixelId.trim();
  if (!id) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onReady={flushMetaPixelQueue}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', ${JSON.stringify(id)});
            (window.__metaPixelQueue || []).forEach(function(item) {
              fbq(item[0], item[1], item[2]);
            });
            window.__metaPixelQueue = [];
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
