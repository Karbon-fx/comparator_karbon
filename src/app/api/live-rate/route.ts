import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is not configured.' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
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

    return NextResponse.json({
      rate: inrRate,
      timestamp: new Date(data.time_last_update_unix * 1000).toISOString(),
    });

  } catch (error) {
    console.error('Error in /api/live-rate:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
