import type { TenantWithCMS } from "@/types/schema-contract";

export interface NavLink {
  label: string;
  href: string;
}

export interface HeaderSharedProps {
  tenant: TenantWithCMS;
  navLinks: NavLink[];
}
