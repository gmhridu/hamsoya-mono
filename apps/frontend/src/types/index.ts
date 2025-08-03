export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  inStock: boolean;
  featured?: boolean;
  tags?: string[];
  weight?: string;
  origin?: string;
  benefits?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface ShippingAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod';
  createdAt: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image: string;
  productCount: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified?: boolean;
}

export interface ProductFilters {
  category?: string;
  priceRange?: [number, number];
  inStock?: boolean;
  search?: string;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'newest' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
