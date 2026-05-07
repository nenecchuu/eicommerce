import { NextRequest, NextResponse } from "next/server";

const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("input");

  if (!input || input.trim().length < 2) {
    return NextResponse.json(
      { success: false, error: "Parameter 'input' minimal 2 karakter" },
      { status: 400 }
    );
  }

  if (!BITESHIP_API_KEY) {
    return NextResponse.json({
      success: true,
      areas: MOCK_AREAS.filter((a) =>
        a.name.toLowerCase().includes(input.toLowerCase())
      ),
    });
  }

  try {
    const url = new URL("https://api.biteship.com/v1/maps/areas");
    url.searchParams.set("input", input);
    url.searchParams.set("type", "single");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${BITESHIP_API_KEY}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[Biteship Areas] Error:", text);
      return NextResponse.json(
        { success: false, error: "Gagal mengambil data area dari Biteship" },
        { status: 502 }
      );
    }

    const data = await response.json();

    const areas = (data.areas ?? []).map(
      (a: {
        id: string;
        name: string;
        administrative_division_level_1_name: string;
        administrative_division_level_2_name: string;
        administrative_division_level_3_name: string;
        postal_code: number;
      }) => ({
        biteship_area_id: a.id,
        name: a.name,
        district: a.administrative_division_level_3_name,
        city: a.administrative_division_level_2_name,
        province: a.administrative_division_level_1_name,
        postal_code: String(a.postal_code),
      })
    );

    return NextResponse.json({ success: true, areas });
  } catch (error) {
    console.error("[Biteship Areas] Exception:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

const MOCK_AREAS = [
  { biteship_area_id: "IDNP6IDNC60IDND266IDZ12220", name: "Pesanggrahan, Jakarta Selatan, DKI Jakarta. 12220", district: "Pesanggrahan", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12220" },
  { biteship_area_id: "IDNP6IDNC60IDND265IDZ12250", name: "Bintaro, Jakarta Selatan, DKI Jakarta. 12250", district: "Bintaro", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12250" },
  { biteship_area_id: "IDNP6IDNC60IDND268IDZ12440", name: "Kebayoran Baru, Jakarta Selatan, DKI Jakarta. 12440", district: "Kebayoran Baru", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12440" },
  { biteship_area_id: "IDNP6IDNC61IDND280IDZ10110", name: "Gambir, Jakarta Pusat, DKI Jakarta. 10110", district: "Gambir", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10110" },
  { biteship_area_id: "IDNP11IDNC113IDND1164IDZ40111", name: "Coblong, Bandung, Jawa Barat. 40111", district: "Coblong", city: "Bandung", province: "Jawa Barat", postal_code: "40111" },
  { biteship_area_id: "IDNP10IDNC99IDND1051IDZ60111", name: "Genteng, Surabaya, Jawa Timur. 60111", district: "Genteng", city: "Surabaya", province: "Jawa Timur", postal_code: "60111" },
];
