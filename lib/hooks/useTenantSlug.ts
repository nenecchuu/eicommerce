import { useMemo } from "react";

/**
 * Extracts the tenant slug from the current hostname on the client side
 * This should only be used in client components.
 * Server components should use requireTenantDomain() instead.
 */
export function useTenantSlug(): string | null {
  if (typeof window === "undefined") return null;

  return useMemo(() => {
    const hostname = window.location.hostname;

    // Handle nip.io
    if (hostname.match(/\d+(-\d+)*\.nip\.io/)) {
      const match = hostname.match(/^([^.]+)\./);
      if (match && match[1] !== "127" && match[1] !== "192") {
        return match[1];
      }
      return null;
    }

    // Handle sslip.io
    if (hostname.includes("sslip.io")) {
      const match = hostname.match(/^([^.]+)\./);
      if (match && !match[1].match(/^\d/)) {
        return match[1];
      }
      return null;
    }

    // Handle localhost with subdomain
    if (hostname.includes("localhost")) {
      const match = hostname.match(/^([^.]+)\.localhost/);
      return match ? match[1] : null;
    }

    // Production: extract first subdomain
    const parts = hostname.split(".");
    if (parts.length > 2) {
      return parts[0];
    }

    return null;
  }, [window.location.hostname]);
}
