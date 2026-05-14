import { notFound } from "next/navigation";
import { getProducts } from "@/lib/queries/getProducts";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { requireTenantDomain } from "@/lib/utils/tenant";
import CartPageClient from "./CartPageClient";

export default async function CartPage() {
  const domain = await requireTenantDomain();
  const tenantData = await getTenantByDomain(domain);

  if (!tenantData) notFound();

  const products = await getProducts(tenantData.id);

  return <CartPageClient recommendedProducts={products} />;
}
