export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  features: string[];
  inStock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}
