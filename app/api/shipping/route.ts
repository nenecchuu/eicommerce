import { NextRequest, NextResponse } from "next/server";
import type { ShippingService } from "./types";
import { mockRates } from "./dummy";

interface ShippingRateRequest {
  origin_area_id: string;
  destination_area_id: string;
  weight: number;
}

interface CachedRate {
  services: ShippingService[];
  timestamp: number;
}

const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;
const SHIPPING_DUMMY = process.env.SHIPPING_DUMMY === "true";
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

const rateCache = new Map<string, CachedRate>();

function cacheKey(originAreaId: string, destinationAreaId: string): string {
  return `${originAreaId}:${destinationAreaId}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ShippingRateRequest = await request.json();

    if (!body.origin_area_id || !body.destination_area_id || !body.weight) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: origin_area_id, destination_area_id, weight" },
        { status: 400 }
      );
    }

    if (body.weight <= 0 || body.weight > 50000) {
      return NextResponse.json(
        { success: false, error: "Weight harus antara 1g dan 50kg (dalam gram)" },
        { status: 400 }
      );
    }

    const key = cacheKey(body.origin_area_id, body.destination_area_id);
    const cached = rateCache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ success: true, services: cached.services, cached: true });
    }

    if (SHIPPING_DUMMY || !BITESHIP_API_KEY) {
      const mock = mockRates();
      rateCache.set(key, { services: mock, timestamp: now });
      return NextResponse.json({ success: true, services: mock });
    }

    const response = await fetch("https://api.biteship.com/v1/rates/couriers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BITESHIP_API_KEY}`,
      },
      body: JSON.stringify({
        origin_area_id: body.origin_area_id,
        destination_area_id: body.destination_area_id,
        couriers: "jne,jnt,sicepat,anteraja,wahana",
        items: [{ name: "Produk", value: 0, weight: body.weight, quantity: 1 }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[Shipping API] Biteship error:", text);

      if (cached) {
        return NextResponse.json({
          success: true,
          services: cached.services,
          cached: true,
          warning: "Biteship tidak tersedia, menampilkan data cache",
        });
      }

      return NextResponse.json(
        { success: false, error: "Layanan pengiriman sedang tidak tersedia. Coba lagi nanti." },
        { status: 503 }
      );
    }

    const data = await response.json();

    const services: ShippingService[] = (data.pricing ?? []).map(
      (p: {
        courier_code: string;
        courier_service_code: string;
        courier_name: string;
        courier_service_name: string;
        description: string;
        price: number;
        shipment_duration_range: string;
        shipment_duration_unit: string;
      }) => ({
        courier_code: p.courier_code,
        courier_service_code: p.courier_service_code,
        courier_name: p.courier_name,
        service: p.courier_service_name,
        description: p.description,
        price: p.price,
        etd: `${p.shipment_duration_range} ${p.shipment_duration_unit}`,
      })
    );

    rateCache.set(key, { services, timestamp: now });

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error("[Shipping API] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
