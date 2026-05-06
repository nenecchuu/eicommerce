import { NextRequest, NextResponse } from "next/server";

interface BiteshipRequest {
  origin: string;
  destination: string;
  weight: number;
}

interface BiteshipService {
  service: string;
  description: string;
  price: number;
  etd: string;
}

interface BiteshipResponse {
  success: boolean;
  services?: BiteshipService[];
  error?: string;
}

interface CachedRate {
  services: BiteshipService[];
  timestamp: number;
}

const BITESHIP_API_URL = "https://api.biteship.com/v1/rates";
const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;

// In-memory cache for shipping rates (in production, use Redis or similar)
const rateCache = new Map<string, CachedRate>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(origin: string, destination: string): string {
  return `${origin}:${destination}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: BiteshipRequest = await request.json();

    // Validate input
    if (!body.origin || !body.destination || !body.weight) {
      return NextResponse.json(
        { error: "Missing required fields: origin, destination, weight" },
        { status: 400 }
      );
    }

    if (body.weight <= 0 || body.weight > 50) {
      return NextResponse.json(
        { error: "Weight must be between 0.1kg and 50kg" },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = getCacheKey(body.origin, body.destination);
    const cached = rateCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        services: cached.services,
        cached: true,
      });
    }

    // Call Biteship API
    let biteshipResponse: BiteshipResponse;

    if (!BITESHIP_API_KEY) {
      // Demo mode - return mock data
      biteshipResponse = {
        success: true,
        services: [
          {
            service: "JNE_REG",
            description: "JNE Reguler",
            price: 9000 + Math.ceil(body.weight * 2000),
            etd: "2-3 hari kerja",
          },
          {
            service: "JNE_YES",
            description: "JNE YES",
            price: 12000 + Math.ceil(body.weight * 2500),
            etd: "1-2 hari kerja",
          },
          {
            service: "JTR_REG",
            description: "J&T Reguler",
            price: 10000 + Math.ceil(body.weight * 2200),
            etd: "1-3 hari kerja",
          },
        ],
      };
    } else {
      // Production mode - call Biteship API
      const response = await fetch(BITESHIP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${BITESHIP_API_KEY}`,
        },
        body: JSON.stringify({
          origin: body.origin,
          destination: body.destination,
          weight: body.weight,
        }),
      });

      if (!response.ok) {
        // Biteship down or error
        const errorText = await response.text();
        console.error("[Shipping API] Biteship error:", errorText);

        // Try to return cached data even if expired
        if (cached) {
          return NextResponse.json({
            success: true,
            services: cached.services,
            cached: true,
            warning: "Biteship API unavailable, showing cached rates",
          });
        }

        return NextResponse.json(
          {
            success: false,
            error: "Layanan pengiriman sedang tidak tersedia. Silakan coba lagi nanti.",
          },
          { status: 503 }
        );
      }

      biteshipResponse = await response.json();
    }

    if (!biteshipResponse.success || !biteshipResponse.services) {
      return NextResponse.json(
        { error: "Failed to get shipping rates" },
        { status: 500 }
      );
    }

    // Cache the result
    rateCache.set(cacheKey, {
      services: biteshipResponse.services!,
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      services: biteshipResponse.services,
    });

  } catch (error) {
    console.error("[Shipping API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
