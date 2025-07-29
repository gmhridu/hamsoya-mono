import { Category, Product, Review } from '@/types';

export const mockProducts: Product[] = [
  {
    id: 'kalo-jira-flowers-honey',
    name: 'Kalo Jira Flowers Honey',
    description:
      'Pure natural honey collected from Kalo Jira (Black Cumin) flowers. Rich in antioxidants and natural healing properties.',
    price: 850,
    originalPrice: 950,
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400&h=400&fit=crop',
    ],
    category: 'honey',
    inStock: true,
    featured: true,
    tags: ['organic', 'natural', 'healing'],
    weight: '500g',
    origin: 'Sylhet, Bangladesh',
    benefits: [
      'Rich in antioxidants',
      'Natural antibacterial properties',
      'Boosts immunity',
      'Aids digestion',
    ],
  },
  {
    id: 'pure-ghee',
    name: 'Pure Desi Ghee',
    description:
      'Traditional clarified butter made from grass-fed cow milk. Perfect for cooking and Ayurvedic remedies.',
    price: 1200,
    originalPrice: 1350,
    images: [
      'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop',
    ],
    category: 'ghee',
    inStock: true,
    featured: true,
    tags: ['traditional', 'organic', 'ayurvedic'],
    weight: '500ml',
    origin: 'Pabna, Bangladesh',
    benefits: [
      'High smoke point for cooking',
      'Rich in vitamins A, D, E, K',
      'Supports digestion',
      'Traditional Ayurvedic medicine',
    ],
  },
  {
    id: 'green-chili-powder',
    name: 'Green Chili Powder',
    description:
      'Freshly ground green chili powder with authentic taste and aroma. Perfect for traditional Bengali cuisine.',
    price: 320,
    originalPrice: 380,
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    ],
    category: 'spices',
    inStock: true,
    featured: true,
    tags: ['spicy', 'traditional', 'fresh'],
    weight: '200g',
    origin: 'Bogura, Bangladesh',
    benefits: [
      'Rich in Vitamin C',
      'Boosts metabolism',
      'Natural preservative',
      'Authentic Bengali flavor',
    ],
  },
  {
    id: 'laccha-shemai',
    name: 'Laccha Shemai',
    description:
      'Traditional handmade vermicelli perfect for desserts and special occasions. Made with premium wheat flour.',
    price: 180,
    originalPrice: 220,
    images: [
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
    ],
    category: 'traditional',
    inStock: true,
    featured: true,
    tags: ['traditional', 'handmade', 'dessert'],
    weight: '400g',
    origin: 'Cumilla, Bangladesh',
    benefits: [
      'Handmade quality',
      'Perfect for traditional desserts',
      'Long shelf life',
      'Premium wheat flour',
    ],
  },
  {
    id: 'mustard-oil',
    name: 'Pure Mustard Oil',
    description:
      'Cold-pressed mustard oil with natural pungency and health benefits. Essential for Bengali cooking.',
    price: 450,
    images: ['https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop'],
    category: 'traditional',
    inStock: true,
    tags: ['cold-pressed', 'traditional', 'cooking'],
    weight: '500ml',
    origin: 'Faridpur, Bangladesh',
    benefits: [
      'Cold-pressed quality',
      'Rich in omega-3',
      'Natural antibacterial',
      'Traditional Bengali cooking',
    ],
  },
  {
    id: 'date-palm-jaggery',
    name: 'Date Palm Jaggery (Khejur Gur)',
    description:
      'Pure date palm jaggery collected during winter season. Natural sweetener with rich minerals.',
    price: 380,
    images: ['https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop'],
    category: 'traditional',
    inStock: false,
    tags: ['seasonal', 'natural', 'sweetener'],
    weight: '500g',
    origin: 'Jessore, Bangladesh',
    benefits: [
      'Natural sweetener',
      'Rich in iron and minerals',
      'Seasonal delicacy',
      'Traditional winter treat',
    ],
  },
];

export const mockCategories: Category[] = [
  {
    id: 'honey',
    name: 'Natural Honey',
    description: 'Pure honey from various flower sources',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=200&fit=crop',
    productCount: 3,
  },
  {
    id: 'ghee',
    name: 'Pure Ghee',
    description: 'Traditional clarified butter',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=200&fit=crop',
    productCount: 2,
  },
  {
    id: 'spices',
    name: 'Spices & Powders',
    description: 'Fresh ground spices and powders',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=200&fit=crop',
    productCount: 4,
  },
  {
    id: 'traditional',
    name: 'Traditional Foods',
    description: 'Authentic Bengali traditional foods',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&h=200&fit=crop',
    productCount: 5,
  },
];

export const mockReviews: Review[] = [
  {
    id: '1',
    productId: 'kalo-jira-flowers-honey',
    userName: 'Fatima Rahman',
    rating: 5,
    comment: 'Excellent quality honey! The taste is amazing and you can feel the natural purity.',
    createdAt: '2024-01-15',
    verified: true,
  },
  {
    id: '2',
    productId: 'pure-ghee',
    userName: 'Mohammad Ali',
    rating: 5,
    comment:
      "Best ghee I have ever used. The aroma and taste remind me of my grandmother's homemade ghee.",
    createdAt: '2024-01-10',
    verified: true,
  },
  {
    id: '3',
    productId: 'green-chili-powder',
    userName: 'Rashida Begum',
    rating: 4,
    comment: 'Very fresh and spicy. Perfect for our traditional cooking.',
    createdAt: '2024-01-08',
    verified: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return mockProducts.filter(product => product.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return mockProducts.filter(product => product.featured);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockProducts.filter(
    product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};
