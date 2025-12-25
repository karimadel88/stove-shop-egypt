import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  Check, 
  ArrowRight, 
  Truck, 
  Shield, 
  RotateCcw,
  Star,
  Minus,
  Plus
} from "lucide-react";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);
  const cartItem = items.find((item) => item.id === id);
  const relatedProducts = products.filter((p) => p.id !== id && p.brand === product?.brand).slice(0, 3);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">المنتج غير موجود</h2>
            <Button variant="gold" onClick={() => navigate("/products")}>
              <ArrowRight className="w-4 h-4" />
              العودة للمنتجات
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`تمت إضافة ${quantity} ${product.name} إلى السلة`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square bg-muted rounded-2xl overflow-hidden shadow-soft">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {discount > 0 && (
                <span className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-lg font-bold">
                  خصم {discount}%
                </span>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-background/80 rounded-2xl flex items-center justify-center">
                  <span className="bg-muted text-muted-foreground px-6 py-3 rounded-lg font-semibold text-lg">
                    غير متوفر حالياً
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  {product.brand}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {product.name}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Rating */}
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
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString()} ج.م
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground">المميزات:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              {product.inStock && (
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
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
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
                  { icon: Truck, title: "توصيل مجاني", desc: "لجميع المحافظات" },
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
                {relatedProducts.map((p) => (
                  <Link key={p.id} to={`/product/${p.id}`}>
                    <div className="bg-card rounded-xl p-4 shadow-soft hover:shadow-hover transition-all">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full aspect-square object-cover rounded-lg mb-4"
                      />
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{p.name}</h3>
                      <p className="text-primary font-bold">{p.price.toLocaleString()} ج.م</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
