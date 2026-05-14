import { notFound } from "next/navigation";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { getOrderByIdAndEmail } from "@/lib/queries/getOrder";
import { requireTenantDomain } from "@/lib/utils/tenant";
import OrderPageClient from "./OrderPageClient";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ email?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Order ${id}`,
    description: "Cek status pesanan Anda",
  };
}

export default async function OrderPage({ params, searchParams }: Props) {
  const domain = await requireTenantDomain();
  const tenantData = await getTenantByDomain(domain);

  if (!tenantData) notFound();

  const { id } = await params;
  const { email } = await searchParams;

  let order = null;
  if (email && email.includes("@")) {
    order = await getOrderByIdAndEmail(tenantData.id, id, email);
  }

  return (
    <OrderPageClient
      orderId={id}
      initialEmail={email}
      order={order}
    />
  );
}
