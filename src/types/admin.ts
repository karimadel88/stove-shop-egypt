// Common types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// Auth types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'staff';
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Media types
export interface Media {
  _id: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  entityType?: 'product' | 'category' | 'user';
  entityId?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageId?: string;
  image?: Media;
  parentId?: string | null;
  parent?: Category;
  children?: Category[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  quantity: number;
  lowStockThreshold: number;
  categoryId?: string | Category;
  category?: Category;
  imageIds: string[];
  images?: Media[];
  isFeatured: boolean;
  isActive: boolean;
  attributes?: Record<string, string>;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  slug?: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  quantity: number;
  lowStockThreshold?: number;
  categoryId?: string;
  imageIds?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  attributes?: Record<string, string>;
}

// Location types
export interface Country {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  _id: string;
  name: string;
  countryId: string;
  country?: Country;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Shipping types
export interface CityPrice {
  cityId: string;
  city?: City;
  price: number;
}

export interface ShippingMethod {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  estimatedDays: number;
  cityPrices: CityPrice[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingCalculation {
  shippingMethodId: string;
  name: string;
  price: number;
  estimatedDays: number;
}

// Customer types
export interface Address {
  street: string;
  cityId: string;
  cityName: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface Customer {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: Address[];
  wishlist?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Coupon types
export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  isValid: boolean;
  discount: number;
  message: string | null;
}

// Order types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderCustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId?: string;
  customer?: Customer;
  customerDetails: OrderCustomerDetails;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingMethodId: string;
  shippingMethodName: string;
  paymentMethod: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  _id: string;
  productId: string;
  product?: Product;
  customerId: string;
  customer?: Customer;
  orderId?: string;
  rating: number;
  title?: string;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Settings types
export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface Settings {
  storeName: string;
  logoId?: string | Media; // Can be string ID or populated Media object
  logo?: Media;
  currency: string;
  taxRate: number;
  taxName: string;
  contactInfo: ContactInfo;
  socialLinks: SocialLinks;
}

// Dashboard types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
}

// Transfer Brokerage types
export type TransferOrderStatus = 'PENDING_CONFIRMATION' | 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export interface TransferMethod {
  _id: string;
  name: string;
  code: string;
  category: string;
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransferFeeRule {
  _id: string;
  fromMethodId: string | TransferMethod;
  toMethodId: string | TransferMethod;
  feeType: 'PERCENT' | 'FIXED';
  feeValue: number;
  /** Minimum transfer amount allowed */
  minAmount?: number;
  /** Maximum transfer amount allowed */
  maxAmount?: number;
  /** FEE = client pays fee; CASHBACK = client receives money back */
  benefitType: 'FEE' | 'CASHBACK';
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransferQuote {
  available: boolean;
  fromMethod: { id: string; name: string; code: string };
  toMethod: { id: string; name: string; code: string };
  amount: number;
  /** Fee charged. Negative value means cashback (client receives money back). */
  fee: number;
  total: number;
  /** FEE = client pays fee; CASHBACK = client receives money back */
  benefitType: 'FEE' | 'CASHBACK' | null;
  /** Minimum transfer amount for this route (null = no limit) */
  minAmount: number | null;
  /** Maximum transfer amount for this route (null = no limit) */
  maxAmount: number | null;
  feeRuleId: string | null;
  message?: string;
}

export interface TransferOrder {
  _id: string;
  orderNumber: string;
  fromMethodId: TransferMethod | string;
  toMethodId: TransferMethod | string;
  amount: number;
  fee: number;
  total: number;
  status: TransferOrderStatus;
  customerName?: string;
  customerPhone?: string;
  customerWhatsapp?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferConfirmResult {
  order: TransferOrder;
  whatsapp: {
    messageText: string;
    encodedMessage: string;
    whatsappUrl: string;
    brokerPhone: string;
  };
}
