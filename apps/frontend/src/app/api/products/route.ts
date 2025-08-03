import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing
const mockProducts = [
  {
    id: '1',
    name: 'Premium Organic Honey',
    description:
      'Pure, raw honey sourced from local beekeepers. Rich in antioxidants and natural enzymes.',
    price: 24.99,
    category: 'honey',
    tags: ['organic', 'raw', 'local'],
    inStock: true,
    rating: 4.8,
    reviewCount: 127,
    image: '/images/products/honey-1.jpg',
  },
  {
    id: '2',
    name: 'Wildflower Honey',
    description: 'Delicate wildflower honey with a complex floral taste profile.',
    price: 19.99,
    category: 'honey',
    tags: ['wildflower', 'natural'],
    inStock: true,
    rating: 4.6,
    reviewCount: 89,
    image: '/images/products/honey-2.jpg',
  },
  {
    id: '3',
    name: 'Manuka Honey',
    description: 'Premium Manuka honey from New Zealand with unique healing properties.',
    price: 89.99,
    category: 'honey',
    tags: ['manuka', 'premium', 'healing'],
    inStock: false,
    rating: 4.9,
    reviewCount: 203,
    image: '/images/products/honey-3.jpg',
  },
  {
    id: '4',
    name: 'Clover Honey',
    description: 'Light and mild clover honey, perfect for everyday use.',
    price: 16.99,
    category: 'honey',
    tags: ['clover', 'mild', 'everyday'],
    inStock: true,
    rating: 4.4,
    reviewCount: 156,
    image: '/images/products/honey-4.jpg',
  },
];

// Get all products with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // For testing, return mock data instead of calling backend
    // TODO: Replace with actual backend call when backend is available

    let filteredProducts = [...mockProducts];

    // Apply filters
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }

    // Sorting
    filteredProducts.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Simulate network delay for testing
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      products: filteredProducts,
      total: filteredProducts.length,
      page: 1,
      limit: 50,
    });
  } catch (error) {
    console.error('Products API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Create a new product (for admin/seller)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const response = await fetch(`${backendUrl}/products`, {
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
          error: errorData.message || 'Failed to create product',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Create product API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
