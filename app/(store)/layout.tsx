import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { getHomepageConfig } from "@/lib/queries/getHomepageConfig";
import {
  derivePrimaryShades,
  getAccessiblePrimaryColor,
  getContrastText,
} from "@/lib/utils/color";
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";
import WhatsAppFloat from "@/components/tenant/WhatsAppFloat";
import DemoWatermark from "@/components/tenant/DemoWatermark";
import StickyTopMessageSection from "@/components/sections/sticky-top-message";
import { requireTenantDomain } from "@/lib/utils/tenant";
import { FontScaleProvider } from "@/lib/context/font-scale-context";
import MetaPixel from "@/components/MetaPixel";
import GoogleTagManager from "@/components/GoogleTagManager";

function getTenantDescription(data: NonNullable<Awaited<ReturnType<typeof getTenantByDomain>>>) {
  return (
    data.cms.description?.trim() ||
    data.cms.tagline?.trim() ||
    `Belanja produk pilihan dari ${data.name} dengan proses mudah dan aman.`
  );
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const domain = await requireTenantDomain();
    const data = await getTenantByDomain(domain);
    if (!data) return {};
    const description = getTenantDescription(data);
    return {
      title: { default: data.name, template: `%s — ${data.name}` },
      description,
      icons: data.cms.favicon_url ? { icon: data.cms.favicon_url } : undefined,
      openGraph: {
        siteName: data.name,
        description,
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
  const config = data ? await getHomepageConfig(data.id) : null;

  if (!data) notFound();
  if (!data.is_active) redirect("/not-active");

  const stickySection = config?.sections.find(
    (s): s is Extract<typeof s, { type: "sticky_top_message" }> =>
      s.type === "sticky_top_message" && s.visible
  );

  const primaryColor = getAccessiblePrimaryColor(data.cms.primary_color);
  const shades = derivePrimaryShades(primaryColor);
  const contrast = getContrastText(primaryColor);
  const metaPixelId =
    !data.is_demo && process.env.NODE_ENV === "production"
      ? data.cms.meta_pixel_id?.trim()
      : "";

  const cssVars = {
    "--tenant-primary": primaryColor,
    "--tenant-primary-hover": shades.hover,
    "--tenant-primary-muted": shades.muted,
    "--tenant-primary-tint": shades.tint,
    "--tenant-primary-contrast": contrast,
  } as React.CSSProperties;

  return (
    <FontScaleProvider scale={data.cms.font_size ?? "regular"}>
      {data.cms.google_tag_manager_id && (
        <GoogleTagManager gtmId={data.cms.google_tag_manager_id} />
      )}
      {metaPixelId && <MetaPixel pixelId={metaPixelId} />}
      <div style={cssVars} className="h-screen flex flex-col overflow-hidden">
        {stickySection && <StickyTopMessageSection props={stickySection.props} />}
        <TenantHeader tenant={data} />
        <main className="flex-1 overflow-y-auto">
          {children}
          <TenantFooter cms={data.cms} />
        </main>
        {data.cms.whatsapp_number && (
          <WhatsAppFloat number={data.cms.whatsapp_number} />
        )}
        {data.is_demo && <DemoWatermark />}
      </div>
    </FontScaleProvider>
  );
}
