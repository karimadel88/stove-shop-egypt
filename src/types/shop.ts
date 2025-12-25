// Shop (Front Office) Type Definitions
export interface ShopProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  categoryId?: string | ShopCategory;
  category?: ShopCategory;
  images?: ShopMedia[];
  imageIds?: ShopMedia[];
  isFeatured: boolean;
  isActive: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShopMedia {
  _id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface ShopCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: ShopMedia;
  imageId?: ShopMedia;
  parentId?: string;
  children?: ShopCategory[];
  isActive: boolean;
}

export interface ShopSettings {
  storeName: string;
  currency: string;
  taxRate: number;
  taxName: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface OrderRequest {
  customer: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    details?: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface City {
  _id: string;
  name: string;
  countryId: string;
  isActive: boolean;
}

export interface Country {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface CouponValidation {
  isValid: boolean;
  discount: number;
  message: string | null;
}

export interface ShippingCalculation {
  shippingMethodId: string;
  name: string;
  price: number;
  estimatedDays: number;
}

export interface ShopBanner {
  _id: string;
  title?: string;
  subtitle?: string;
  imageId: ShopMedia | string; // Can be object or string ID depending on population
  link?: string;
  buttonText?: string;
  sortOrder: number;
  isActive: boolean;
  image?: ShopMedia; // Sometimes populated here
}
