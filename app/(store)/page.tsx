import { notFound } from "next/navigation";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { getProducts } from "@/lib/queries/getProducts";
import { getHomepageConfig } from "@/lib/queries/getHomepageConfig";
import HomepageRenderer from "@/components/HomepageRenderer";
import { requireTenantDomain } from "@/lib/utils/tenant";

export default async function TenantHomePage() {
  const domain = await requireTenantDomain();
  const tenantData = await getTenantByDomain(domain);

  if (!tenantData) notFound();

  const [products, config] = await Promise.all([
    getProducts(tenantData.id),
    getHomepageConfig(tenantData.id),
  ]);

  if (!config) notFound();

  return (
    <HomepageRenderer
      config={config}
      tenantId={tenantData.id}
      allProducts={products}
    />
  );
}
