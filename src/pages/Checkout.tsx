import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { CheckCircle, CreditCard, Truck } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setOrderComplete(true);
    clearCart();
    toast.success("تم تأكيد طلبك بنجاح!");
  };

  if (items.length === 0 && !orderComplete) {
    navigate("/cart");
    return null;
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center max-w-md mx-auto px-4 animate-fade-up">
            <div className="w-24 h-24 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6 shadow-gold">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">تم تأكيد طلبك!</h2>
            <p className="text-muted-foreground mb-8">
              شكراً لك على طلبك. سيتم التواصل معك خلال 24 ساعة لتأكيد موعد التوصيل.
            </p>
            <Button variant="gold" onClick={() => navigate("/")}>
              العودة للرئيسية
            </Button>
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
          <h1 className="text-3xl font-bold text-foreground mb-8">إتمام الطلب</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">بيانات التوصيل</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="01xxxxxxxxx"
                        required
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">العنوان بالتفصيل *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="الشارع - المنطقة - رقم المبنى"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">المدينة *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="القاهرة / الجيزة / الإسكندرية..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">ملاحظات إضافية</Label>
                      <Input
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="أي تعليمات للتوصيل"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">طريقة الدفع</h3>
                  </div>

                  <div className="p-4 bg-muted rounded-lg border-2 border-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      </div>
                      <span className="font-semibold text-foreground">الدفع عند الاستلام</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 mr-8">
                      ادفع نقداً عند استلام طلبك
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
                </Button>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-soft sticky top-24">
                <h3 className="text-xl font-bold text-foreground mb-6">ملخص الطلب</h3>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg bg-muted"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                        <p className="text-sm font-bold text-primary">
                          {(item.price * item.quantity).toLocaleString()} ج.م
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>المجموع الفرعي</span>
                    <span>{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>الشحن</span>
                    <span className="text-green-600 font-medium">مجاني</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                    <span>الإجمالي</span>
                    <span className="text-primary">{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
