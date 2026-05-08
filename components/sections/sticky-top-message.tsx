"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { StickyTopMessageProps } from "@/lib/types/homepage";

const COOKIE_KEY = "sticky_dismissed";

function isCookieDismissed() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_KEY}=`));
}

export default function StickyTopMessageSection({ props }: { props: StickyTopMessageProps }) {
  const [visible, setVisible] = useState(() =>
    props.dismissible ? !isCookieDismissed() : true
  );

  const dismiss = () => {
    document.cookie = `${COOKIE_KEY}=1; path=/; max-age=${60 * 60 * 24 * 7}`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] text-xs font-medium py-2 px-4 flex items-center justify-center gap-3 relative">
      <span>
        {props.text}
        {props.link_url && props.link_label && (
          <>
            {" "}
            <Link href={props.link_url} className="underline font-semibold">
              {props.link_label}
            </Link>
          </>
        )}
      </span>
      {props.dismissible && (
        <button
          onClick={dismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Tutup"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
