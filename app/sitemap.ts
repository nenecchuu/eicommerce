import type { MetadataRoute } from "next";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { getProducts, getProductCategories } from "@/lib/queries/getProducts";
import { requireTenantDomain } from "@/lib/utils/tenant";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const domain = await requireTenantDomain();
    const tenantData = await getTenantByDomain(domain);

    if (!tenantData) return [];

    const baseUrl = `https://${domain}`;

    const [products, categories] = await Promise.all([
      getProducts(tenantData.id),
      getProductCategories(tenantData.id),
    ]);

    const routes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/produk`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];

    // Add category pages
    for (const category of categories) {
      routes.push({
        url: `${baseUrl}/kategori/${category.toLowerCase().replace(/\s+/g, "-")}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    // Add product pages
    for (const product of products) {
      const lastModified = new Date(product.updated_at);
      routes.push({
        url: `${baseUrl}/produk/${product.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    return routes;
  } catch {
    return [];
  }
}
