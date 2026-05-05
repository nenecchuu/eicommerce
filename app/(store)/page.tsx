import { notFound } from "next/navigation";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { getProducts } from "@/lib/queries/getProducts";
import { getHomepageConfig } from "@/lib/queries/getHomepageConfig";
import HomepageRenderer from "@/components/HomepageRenderer";
import { requireTenantDomain } from "@/lib/utils/tenant";

export default async function TenantHomePage() {
  const domain = await requireTenantDomain();

  const [tenantData, products] = await Promise.all([
    getTenantByDomain(domain),
    getTenantByDomain(domain).then((t) => (t ? getProducts(t.id) : [])),
  ]);

  if (!tenantData) notFound();

  const config = await getHomepageConfig(tenantData.id);

  if (!config) notFound();

  return (
    <HomepageRenderer
      config={config}
      tenantId={tenantData.id}
      allProducts={products}
    />
  );
}
