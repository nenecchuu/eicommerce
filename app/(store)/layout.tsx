import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { derivePrimaryShades, getContrastText } from "@/lib/utils/color";
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";
import WhatsAppFloat from "@/components/tenant/WhatsAppFloat";
import { requireTenantDomain } from "@/lib/utils/tenant";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const domain = await requireTenantDomain();
    const data = await getTenantByDomain(domain);
    if (!data) return {};
    return {
      title: { default: data.name, template: `%s — ${data.name}` },
      description: data.cms.description ?? data.cms.tagline ?? undefined,
      icons: data.cms.favicon_url ? { icon: data.cms.favicon_url } : undefined,
      openGraph: {
        siteName: data.name,
        description: data.cms.description ?? data.cms.tagline ?? undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const domain = await requireTenantDomain();
  const data = await getTenantByDomain(domain);

  if (!data) notFound();
  if (!data.is_active) redirect("/not-active");

  const shades = derivePrimaryShades(data.cms.primary_color);
  const contrast = getContrastText(data.cms.primary_color);

  const cssVars = {
    "--tenant-primary": data.cms.primary_color,
    "--tenant-primary-hover": shades.hover,
    "--tenant-primary-muted": shades.muted,
    "--tenant-primary-tint": shades.tint,
    "--tenant-primary-contrast": contrast,
  } as React.CSSProperties;

  return (
    <div style={cssVars} className="h-screen flex flex-col overflow-hidden">
      <TenantHeader tenant={data} />
      <main className="flex-1 overflow-y-auto">
        {children}
        <TenantFooter cms={data.cms} />
      </main>
      {data.cms.whatsapp_number && (
        <WhatsAppFloat number={data.cms.whatsapp_number} />
      )}
    </div>
  );
}
