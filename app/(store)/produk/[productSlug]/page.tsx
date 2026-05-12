import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { getProduct } from "@/lib/queries/getProducts";
import ProductDetailClient from "./ProductDetailClient";
import { requireTenantDomain } from "@/lib/utils/tenant";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}): Promise<Metadata> {
  const { productSlug } = await params;
  const domain = await requireTenantDomain();
  const tenantData = await getTenantByDomain(domain);

  if (!tenantData) return {};

  const product = await getProduct(tenantData.id, productSlug);

  if (!product) return {};

  const productImage = product.images?.[0]?.url;
  const description = product.description || `${product.name} - ${tenantData.name}`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      siteName: tenantData.name,
      images: productImage
        ? [{ url: productImage, width: 800, height: 800, alt: product.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: productImage ? [productImage] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const domain = await requireTenantDomain();
  const tenantData = await getTenantByDomain(domain);

  if (!tenantData) notFound();

  const product = await getProduct(tenantData.id, productSlug);

  if (!product) notFound();

  return <ProductDetailClient product={product} tenantSlug={tenantData.slug} />;
}
