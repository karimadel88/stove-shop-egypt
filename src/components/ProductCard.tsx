import { Product } from "@/types/product";
import { ShopProduct } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check, Package } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useState } from "react";

interface ProductCardProps {
  product: Product | ShopProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, items } = useCart();
  
  // Handle both old and new product types
  const isShopProduct = '_id' in product;
  const productId = isShopProduct ? product._id : product.id;
  const isInCart = items.some((item) => item.id === productId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Convert ShopProduct to Product format for cart
    const cartProduct: Product = !isShopProduct ? product : {
      id: product._id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.compareAtPrice,
      originalPrice: product.compareAtPrice,
      image: (product.images || product.imageIds)?.[0]?.url || '',
      brand: product.name.split(' ')[0], // Extract brand from name
      features: [], // Features not available in ShopProduct
      inStock: product.quantity > 0,
    };
    
    addToCart(cartProduct);
    toast.success(`تمت إضافة ${product.name} إلى السلة`);
  };

  // Get image URL
  let imageUrl = '';
  if (isShopProduct) {
    // Check both images and imageIds (backend might return either)
    // The backend seems to populate imageIds with the actual image objects
    const mediaList = product.images || product.imageIds;
    const firstImg = mediaList?.[0];
    
    if (firstImg) {
      // Handle case where it's an object with url or just a valid object
      imageUrl = (firstImg as any).url || '';
    }
  } else {
    imageUrl = product.image;
  }
  
  // Get stock status
  const inStock = 'inStock' in product 
    ? product.inStock 
    : product.quantity > 0;
  
  // Get brand
  const brand = 'brand' in product 
    ? product.brand 
    : product.name.split(' ')[0];
  
  // Get features
  const features = 'features' in product ? product.features : [];
  
  // Calculate discount
  const originalPrice = 'originalPrice' in product 
    ? product.originalPrice 
    : ('compareAtPrice' in product ? product.compareAtPrice : undefined);
    
  const discount = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${productId}`}>
      <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 group cursor-pointer">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
              خصم {discount}%
            </span>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="bg-muted text-muted-foreground px-4 py-2 rounded-lg font-semibold">
                غير متوفر
              </span>
            </div>
          )}
          <span className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            {brand}
          </span>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-foreground mb-2 line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary">
                {product.price.toLocaleString()} ج.م
              </span>
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {originalPrice.toLocaleString()} ج.م
                </span>
              )}
            </div>

            <Button
              variant={isInCart ? "outline" : "gold"}
              size="sm"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="min-w-[100px]"
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4" />
                  في السلة
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  أضف للسلة
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
