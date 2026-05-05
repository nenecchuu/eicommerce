import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error("✗ Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}
if (!key) {
  console.error("✗ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
  console.error("  Dapatkan dari: Supabase Dashboard → Project Settings → API → service_role key");
  process.exit(1);
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
  global: {
    headers: { Authorization: `Bearer ${key}` },
  },
});
