import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessLegacyPage({ searchParams }: Props) {
  const { order } = await searchParams;

  if (order) {
    redirect(`/checkout/sukses/${encodeURIComponent(order)}`);
  }

  redirect("/checkout");
}
