import { notFound } from "next/navigation";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { requireTenantDomain } from "@/lib/utils/tenant";

export default async function NotActivePage() {
  try {
    const domain = await requireTenantDomain();
    const data = await getTenantByDomain(domain);

    if (!data) notFound();

    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {data.name} is not active
          </h1>
          <p className="text-gray-600">
            This tenant is currently inactive. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
