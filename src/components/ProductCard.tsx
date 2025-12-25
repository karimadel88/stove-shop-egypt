import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, items } = useCart();
  const isInCart = items.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`تمت إضافة ${product.name} إلى السلة`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 group">
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
            خصم {discount}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="bg-muted text-muted-foreground px-4 py-2 rounded-lg font-semibold">
              غير متوفر
            </span>
          </div>
        )}
        <span className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold">
          {product.brand}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-foreground mb-2 line-clamp-2 leading-relaxed">
          {product.name}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {product.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">
              {product.price.toLocaleString()} ج.م
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.originalPrice.toLocaleString()} ج.م
              </span>
            )}
          </div>

          <Button
            variant={isInCart ? "outline" : "gold"}
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock}
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
  );
};

export default ProductCard;
