// Placeholder image URLs for development
// In production, these would be replaced with actual product images

export const PLACEHOLDER_IMAGES = {
  // Hero images
  hero: {
    honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop',
    ghee: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&h=600&fit=crop',
    spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=600&fit=crop',
  },
  
  // Product images
  products: {
    honey: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400&h=400&fit=crop',
    ],
    ghee: [
      'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop',
    ],
    spices: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1599909533730-b4b4b3b5b4b5?w=400&h=400&fit=crop',
    ],
    traditional: [
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop',
    ],
  },
  
  // Category images
  categories: {
    honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=200&fit=crop',
    ghee: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=200&fit=crop',
    spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=200&fit=crop',
    traditional: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&h=200&fit=crop',
  },
  
  // About page images
  about: {
    story: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
    team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
    farm: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
  },
  
  // Default fallback
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
};

// Function to get product images based on category
export function getProductImages(category: string, count: number = 3): string[] {
  const categoryImages = PLACEHOLDER_IMAGES.products[category as keyof typeof PLACEHOLDER_IMAGES.products];
  
  if (categoryImages) {
    return categoryImages.slice(0, count);
  }
  
  // Fallback to default images
  return Array(count).fill(PLACEHOLDER_IMAGES.default);
}

// Function to get category image
export function getCategoryImage(category: string): string {
  return PLACEHOLDER_IMAGES.categories[category as keyof typeof PLACEHOLDER_IMAGES.categories] || PLACEHOLDER_IMAGES.default;
}

// Function to get hero image
export function getHeroImage(type: string): string {
  return PLACEHOLDER_IMAGES.hero[type as keyof typeof PLACEHOLDER_IMAGES.hero] || PLACEHOLDER_IMAGES.default;
}
