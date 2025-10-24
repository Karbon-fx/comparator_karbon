import { NextResponse } from 'next/server';

let cache = {
  data: null as any,
  timestamp: 0,
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const now = Date.now();
  if (cache.data && (now - cache.timestamp < CACHE_TTL)) {
    return NextResponse.json(cache.data);
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY || 'c60119e771fbf3fb5dd2e75f'; // Fallback for dev

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is not configured.' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`, {
      next: { revalidate: 300 }, // Next.js built-in caching
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to fetch live rate from external API.', details: errorData },
        { status: 502 } // Bad Gateway
      );
    }
    
    const data = await response.json();

    if (data.result === 'error') {
       return NextResponse.json(
        { error: 'External API returned an error.', details: data['error-type'] },
        { status: 502 }
      );
    }

    const inrRate = data.conversion_rates.INR;

    if (!inrRate) {
      return NextResponse.json(
        { error: 'INR rate not found in API response.' },
        { status: 502 }
      );
    }
    
    const responsePayload = {
      rate: inrRate,
      timestamp: new Date(data.time_last_update_unix * 1000).toISOString(),
    };

    // Update in-memory cache
    cache = {
      data: responsePayload,
      timestamp: now,
    };
    
    return NextResponse.json(responsePayload);

  } catch (error) {
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
