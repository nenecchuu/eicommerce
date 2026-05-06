import { notFound } from "next/navigation";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { getFilteredProducts, getProductCategories } from "@/lib/queries/getProducts";
import { requireTenantDomain } from "@/lib/utils/tenant";
import CategoryPageClient from "./CategoryPageClient";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const categorySlug = slug.replace(/-/g, " ");
  return {
    title: `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}`,
    description: `Produk kategori ${categorySlug}`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const domain = await requireTenantDomain();
  const tenantData = await getTenantByDomain(domain);

  if (!tenantData) notFound();

  const { slug } = await params;
  const categoryQueryParams = await searchParams;

  const categories = await getProductCategories(tenantData.id);

  const categoryName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const categoryExists = categories.some(
    (cat) => cat.toLowerCase() === categoryName.toLowerCase()
  );

  if (!categoryExists && categories.length > 0) {
    notFound();
  }

  const page = categoryQueryParams.page ? parseInt(categoryQueryParams.page) : 1;
  const sort = (categoryQueryParams.sort as "terbaru" | "termurah" | "termahal" | "terlaris") || "terbaru";

  const productsResult = await getFilteredProducts(tenantData.id, {
    category: categoryName,
    sort,
    page,
    perPage: 12,
  });

  return (
    <CategoryPageClient
      tenantId={tenantData.id}
      tenantName={tenantData.name}
      categoryName={categoryName}
      productsResult={productsResult}
      categories={categories}
    />
  );
}
