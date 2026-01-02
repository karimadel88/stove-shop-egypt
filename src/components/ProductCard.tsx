import { memo, useState } from "react";
import { Product } from "@/types/product";
import { ShopProduct } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check, Package, Heart, Plus, Star, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getMediaUrl } from "@/lib/utils";

interface ProductCardProps {
  product: Product | ShopProduct;
}

const ProductCard = memo(({ product }: ProductCardProps) => {
  const { addToCart, items } = useCart();
  
  // Handle both old and new product types
  const isShopProduct = '_id' in product;
  const productId = isShopProduct ? product._id : (product as any).id;
  const isInCart = items.some((item) => item.id === productId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Convert ShopProduct to Product format for cart
    const cartProduct: Product = !isShopProduct ? (product as Product) : {
      id: (product as ShopProduct)._id,
      name: product.name,
      description: (product as ShopProduct).description || '',
      price: product.price,
      originalPrice: (product as ShopProduct).compareAtPrice,
      image: ((product as ShopProduct).images || (product as ShopProduct).imageIds)?.[0]?.url || '',
      brand: product.name.split(' ')[0], // Extract brand from name
      features: [], // Features not available in ShopProduct
      inStock: (product as ShopProduct).quantity > 0,
    };
    
    addToCart(cartProduct);
    toast.success(`تمت إضافة ${product.name} إلى السلة`);
  };

  // Get image URL
  let imageUrl = '';
  if (isShopProduct) {
    const p = product as ShopProduct;
    const mediaList = p.images || p.imageIds;
    const firstImg = mediaList?.[0];
    imageUrl = (firstImg as any)?.url || '';
  } else {
    imageUrl = (product as Product).image;
  }
  
  // Get stock status
  const inStock = 'inStock' in product 
    ? (product as Product).inStock 
    : (product as ShopProduct).quantity > 0;
  
  // Get brand
  const brand = (product as any).brand || product.name.split(' ')[0];
  
  // Get features
  const features = (product as any).features || [];
  
  // Calculate discount
  const originalPrice = (product as any).originalPrice || (product as any).compareAtPrice;
    
  const discount = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Get stock quantity
  const stockQuantity = (product as any).quantity || 10;
  const isLowStock = inStock && stockQuantity > 0 && stockQuantity <= 5;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "تم الإزالة من المفضلة" : "تمت الإضافة للمفضلة");
  };

  return (
    <Link to={`/product/${productId}`}>
      <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary/20 h-full flex flex-col">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {imageUrl ? (
            <img
              src={getMediaUrl(imageUrl)}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-200 ${
              isWishlisted 
                ? "bg-destructive text-white" 
                : "bg-white/80 text-muted-foreground hover:bg-white hover:text-destructive"
            } shadow-sm`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>

          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-bold shadow-sm">
              -{discount}%
            </span>
          )}

          <span className={`absolute right-3 bg-secondary/90 text-secondary-foreground px-2 py-0.5 rounded text-xs font-medium ${discount > 0 ? 'top-10' : 'top-3'}`}>
            {brand}
          </span>

          {isLowStock && (
            <div className="absolute bottom-3 right-3 left-3 flex items-center gap-1 bg-amber-500/90 text-white px-2 py-1 rounded text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              باقي {stockQuantity} فقط!
            </div>
          )}

          {inStock && !isInCart && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e); }}
              className="absolute bottom-3 left-3 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}

          {isInCart && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <Check className="w-3 h-3" />
              في السلة
            </div>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="bg-muted text-muted-foreground px-4 py-2 rounded-lg font-semibold">
                غير متوفر
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-foreground mb-2 line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {features.slice(0, 3).map((feature: string, index: number) => (
                <span
                  key={index}
                  className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
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
                  <Check className="w-4 h-4 ml-1" />
                  في السلة
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 ml-1" />
                  أضف للسلة
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
