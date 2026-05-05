import { notFound } from "next/navigation";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { getProduct } from "@/lib/queries/getProducts";
import ProductDetailClient from "./ProductDetailClient";
import { requireTenantDomain } from "@/lib/utils/tenant";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const domain = await requireTenantDomain();

  const [tenantData, product] = await Promise.all([
    getTenantByDomain(domain),
    getTenantByDomain(domain).then((t) => (t ? getProduct(t.id, productSlug) : null)),
  ]);

  if (!tenantData || !product) notFound();

  return <ProductDetailClient product={product} tenantSlug={tenantData.slug} />;
}
