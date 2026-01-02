import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { shopApi } from "@/lib/api";
import { ShopProduct } from "@/types/shop";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingCart, 
  Check, 
  ArrowRight, 
  Truck, 
  Shield, 
  RotateCcw,
  Star,
  Minus,
  Plus,
  Package,
  AlertCircle
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        let response;
        // Check if id is a valid MongoDB ObjectId (24 hex characters)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

        if (isObjectId) {
          response = await shopApi.getProduct(id);
        } else {
          response = await shopApi.getProductBySlug(id);
        }
        
        const data = response.data;
        setProduct(data);
        
        // Fetch related products if we have a category
        let catId: string | undefined;
        
        // Handle case where categoryId is populated as object or is just a string
        if (data.categoryId) {
          catId = typeof data.categoryId === 'object' 
            ? data.categoryId._id 
            : data.categoryId;
        } else if (data.category) {
           catId = data.category._id;
        }

        if (catId) {
          const relatedRes = await shopApi.listProducts({ 
            categoryId: catId,
            limit: 4 
          });
          const related = (relatedRes.data?.data || relatedRes.data || [])
            .filter((p: ShopProduct) => p._id !== data._id)
            .slice(0, 3);
          setRelatedProducts(related);
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError("فشل في تحميل تفاصيل المنتج");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <main className="flex-1 py-12 container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl w-full" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col">
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {error || "المنتج غير موجود"}
            </h2>
            <Button variant="gold" onClick={() => navigate("/products")}>
              <ArrowRight className="w-4 h-4" />
              العودة للمنتجات
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const cartItem = items.find((item) => item.id === product._id);
  
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    // Determine image URL
    const mediaList = product.images || product.imageIds;
    const imageUrl = mediaList?.[0]?.url || '';
    
    // Create product compatible with CartItem
    const cartProduct = {
      id: product._id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.compareAtPrice,
      image: imageUrl,
      brand: product.name.split(' ')[0],
      features: [],
      inStock: product.quantity > 0,
    };

    for (let i = 0; i < quantity; i++) {
        addToCart(cartProduct);
    }
    toast.success(`تمت إضافة ${quantity} ${product.name} إلى السلة`);
  };

  const mediaList = product.images || product.imageIds || [];
  const mainImage = mediaList[activeImageIndex]?.url || null;

  return (
    <div className="flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary transition-colors">المنتجات</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden shadow-soft group">
                {mainImage ? (
                  <img
                    src={getMediaUrl(mainImage)}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-muted-foreground opacity-20" />
                  </div>
                )}
                
                {discount > 0 && (
                  <span className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-lg font-bold">
                    خصم {discount}%
                  </span>
                )}
                {!product.isActive || product.quantity <= 0 ? (
                  <div className="absolute inset-0 bg-background/80 rounded-2xl flex items-center justify-center">
                    <span className="bg-muted text-muted-foreground px-6 py-3 rounded-lg font-semibold text-lg">
                      غير متوفر حالياً
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Thumbnails */}
              {mediaList.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {mediaList.map((img, index) => (
                    <button
                      key={img._id || index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeImageIndex === index 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <img 
                        src={getMediaUrl(img.url)} 
                        alt={`${product.name} - ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  {product.name.split(' ')[0]}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {product.name}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* Rating (Static for now as API doesn't have ratings yet) */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= 4 ? "text-primary fill-primary" : "text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">(4.0) - 24 تقييم</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-primary">
                  {product.price.toLocaleString()} ج.م
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {product.compareAtPrice.toLocaleString()} ج.م
                  </span>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              {product.isActive && product.quantity > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-foreground">الكمية:</span>
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.quantity} قطعة متبقية
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant={cartItem ? "outline" : "gold"}
                      size="lg"
                      onClick={handleAddToCart}
                      className="flex-1"
                    >
                      {cartItem ? (
                        <>
                          <Check className="w-5 h-5" />
                          في السلة - أضف المزيد
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          أضف للسلة
                        </>
                      )}
                    </Button>
                    <Link to="/cart">
                      <Button variant="secondary" size="lg">
                        اذهب للسلة
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                {[
                  { icon: Truck, title: "توصيل سريع", desc: "لجميع المحافظات" },
                  { icon: Shield, title: "ضمان شامل", desc: "سنتين كاملتين" },
                  { icon: RotateCcw, title: "استرجاع سهل", desc: "خلال 14 يوم" },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-8">منتجات مشابهة</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((p) => {
                  const pImg = p.images?.[0]?.url || p.imageIds?.[0]?.url || null;
                  return (
                    <Link key={p._id} to={`/product/${p._id}`}>
                      <div className="bg-card rounded-xl p-4 shadow-soft hover:shadow-hover transition-all h-full flex flex-col">
                        <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
                          {pImg ? (
                            <img
                              src={getMediaUrl(pImg)}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-muted-foreground opacity-50" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{p.name}</h3>
                        <p className="text-primary font-bold mt-auto">{p.price.toLocaleString()} ج.م</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
