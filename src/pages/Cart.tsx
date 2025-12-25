import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">السلة فارغة</h2>
            <p className="text-muted-foreground mb-6">لم تقم بإضافة أي منتجات بعد</p>
            <Link to="/">
              <Button variant="gold">
                <ArrowRight className="w-4 h-4" />
                تصفح المنتجات
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-8">سلة المشتريات</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-xl p-4 shadow-soft flex gap-4"
                >
                  <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                          const icon = document.createElement('div');
                          icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package text-muted-foreground"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-10"/></svg>';
                          e.currentTarget.parentElement?.appendChild(icon);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>
                    <p className="text-lg font-bold text-primary">
                      {item.price.toLocaleString()} ج.م
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="ghost"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                مسح السلة
              </Button>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-soft sticky top-24">
                <h3 className="text-xl font-bold text-foreground mb-6">ملخص الطلب</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>المجموع الفرعي</span>
                    <span>{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>الشحن</span>
                    <span className="text-muted-foreground text-sm">يُحسب عند الدفع</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold text-foreground">
                      <span>الإجمالي</span>
                      <span className="text-primary">{totalPrice.toLocaleString()} ج.م</span>
                    </div>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button variant="gold" size="lg" className="w-full">
                    إتمام الشراء
                  </Button>
                </Link>

                <Link to="/" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    <ArrowRight className="w-4 h-4" />
                    متابعة التسوق
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
