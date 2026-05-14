"use client";

import { GoogleTagManager as NextGoogleTagManager } from "@next/third-parties/google";
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
      <NextGoogleTagManager gtmId={id} />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
