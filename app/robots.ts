import type { MetadataRoute } from "next";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { requireTenantDomain } from "@/lib/utils/tenant";

export default async function robots(): Promise<MetadataRoute.Robots> {
  try {
    const domain = await requireTenantDomain();
    const tenantData = await getTenantByDomain(domain);

    if (!tenantData) {
      return {
        rules: [],
        sitemap: [],
      };
    }

    const baseUrl = `https://${domain}`;

    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/", "/checkout/", "/keranjang/", "/order/"],
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  } catch {
    return {
      rules: [],
      sitemap: [],
    };
  }
}
