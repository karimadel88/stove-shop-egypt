import { memo, useState } from "react";
import { Product } from "@/types/product";
import { ShopProduct } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check, Package, Heart, Plus, Truck, Star, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getMediaUrl } from "@/lib/utils";

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

  // Wishlist state (local for now - can be connected to backend later)
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Get stock quantity for low stock warning
  const stockQuantity = 'quantity' in product ? product.quantity : 10;
  const isLowStock = inStock && stockQuantity > 0 && stockQuantity <= 5;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "تم الإزالة من المفضلة" : "تمت الإضافة للمفضلة");
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart(e);
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
          
          {/* Wishlist Heart Button - Top Left */}
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

          {/* Discount Badge - Top Right */}
          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-bold shadow-sm">
              -{discount}%
            </span>
          )}

          {/* Brand Badge - Top Right (below discount if exists, else at top) */}
          <span className={`absolute right-3 bg-secondary/90 text-secondary-foreground px-2 py-0.5 rounded text-xs font-medium ${discount > 0 ? 'top-10' : 'top-3'}`}>
            {brand}
          </span>

          {/* Low Stock Warning */}
          {isLowStock && (
            <div className="absolute bottom-3 right-3 left-3 flex items-center gap-1 bg-amber-500/90 text-white px-2 py-1 rounded text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              باقي {stockQuantity} فقط!
            </div>
          )}

          {/* Quick Add Button - Floating */}
          {inStock && !isInCart && (
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-3 left-3 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}

          {/* In Cart Indicator */}
          {isInCart && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <Check className="w-3 h-3" />
              في السلة
            </div>
          )}

          {/* Out of Stock Overlay */}
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

export default memo(ProductCard);
