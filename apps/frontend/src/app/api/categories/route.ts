import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing
const mockCategories = [
  {
    id: 'all',
    name: 'All Products',
    description: 'Browse all available products',
    productCount: 4,
  },
  {
    id: 'honey',
    name: 'Honey',
    description: 'Pure, natural honey varieties',
    productCount: 4,
  },
  {
    id: 'beeswax',
    name: 'Beeswax Products',
    description: 'Natural beeswax candles and cosmetics',
    productCount: 0,
  },
  {
    id: 'propolis',
    name: 'Propolis',
    description: 'Bee propolis supplements and extracts',
    productCount: 0,
  },
];

// Get all categories
export async function GET(request: NextRequest) {
  try {
    // For testing, return mock data instead of calling backend
    // TODO: Replace with actual backend call when backend is available

    // Simulate network delay for testing
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      categories: mockCategories,
      total: mockCategories.length,
    });
  } catch (error) {
    console.error('Categories API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Create a new category (for admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const response = await fetch(`${backendUrl}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authentication headers
        ...(request.headers.get('authorization') && {
          authorization: request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.message || 'Failed to create category',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Create category API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
