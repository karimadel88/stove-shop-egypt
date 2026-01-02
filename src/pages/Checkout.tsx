import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { CheckCircle, CreditCard, Truck, Ticket } from "lucide-react";
import { shopApi } from "@/lib/api";
import { City, Country } from "@/types/shop";
import { getMediaUrl } from "@/lib/utils";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Locations
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  // Shipping & Pricing
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethodName, setShippingMethodName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    countryId: "",
    cityId: "",
    street: "",
    notes: "",
  });

  // Fetch countries on load
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await shopApi.getCountries();
        setCountries(response.data);
      } catch (error) {
        console.error("Failed to load countries", error);
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    if (!formData.countryId) {
      setCities([]);
      return;
    }
    
    const fetchCities = async () => {
      try {
        const response = await shopApi.getCities(formData.countryId);
        setCities(response.data);
      } catch (error) {
        console.error("Failed to load cities", error);
      }
    };
    fetchCities();
  }, [formData.countryId]);

  // Calculate shipping when city changes
  useEffect(() => {
    if (!formData.cityId) {
      setShippingCost(0);
      setShippingMethodName("");
      return;
    }

    const calculateShipping = async () => {
      try {
        const response = await shopApi.calculateShipping(formData.cityId);
        // Assuming response.data returns { price: number, method: string } or similar
        // Adjust based on your actual API response structure for calculateShipping
        const data = response.data;
        // In the API plan, it returns shipping methods suitable for the city
        // We might need to select one if multiple, or it returns the calculated cost directly
        // Based on implementation plan: Returns shipping options or cost
        
        // Let's assume it returns an array of methods or a single best method cost
        if (Array.isArray(data) && data.length > 0) {
            setShippingCost(data[0].price);
            setShippingMethodName(data[0].name);
        } else if (data.price !== undefined) {
             setShippingCost(data.price);
             setShippingMethodName(data.name || "توصيل قياسي");
        }
      } catch (error) {
        console.error("Failed to calculate shipping", error);
        setShippingCost(0); // Fallback or handle error
      }
    };
    calculateShipping();
  }, [formData.cityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    
    setIsValidatingCoupon(true);
    try {
      const response = await shopApi.validateCoupon(couponCode, totalPrice);
      if (response.data.isValid) {
        setCouponDiscount(response.data.discount);
        toast.success("تم تطبيق الكوبون بنجاح");
      } else {
        setCouponDiscount(0);
        toast.error(response.data.message || "كوبون غير صالح");
      }
    } catch (error: any) {
      setCouponDiscount(0);
      toast.error(error.response?.data?.message || "فشل التحقق من الكوبون");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.street || !formData.cityId || !formData.countryId) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find selected names for better display if needed, but ID is enough for backend
      const selectedCity = cities.find(c => c._id === formData.cityId);
      const selectedCountry = countries.find(c => c._id === formData.countryId);

      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          street: formData.street,
          city: selectedCity?.name || "",
          cityId: formData.cityId, // Prefer sending ID if backend supports it
          country: selectedCountry?.name || "",
          details: formData.notes
        },
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod: "cod",
        couponCode: couponDiscount > 0 ? couponCode : undefined,
        notes: formData.notes
      };

      await shopApi.placeOrder(orderData);
      
      setIsSubmitting(false);
      setOrderComplete(true);
      clearCart();
      toast.success("تم تأكيد طلبك بنجاح!");
    } catch (error: any) {
      setIsSubmitting(false);
      toast.error(error.response?.data?.message || "فشل في إنشاء الطلب");
    }
  };

  if (items.length === 0 && !orderComplete) {
    navigate("/cart");
    return null;
  }

  const finalTotal = totalPrice + shippingCost - couponDiscount;

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
                      <Label htmlFor="firstName">الاسم الأول *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">الاسم الأخير *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
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
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        dir="ltr"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="countryId">الدولة *</Label>
                      <Select 
                        value={formData.countryId} 
                        onValueChange={(val) => handleSelectChange("countryId", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدولة" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country._id} value={country._id}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cityId">المدينة *</Label>
                      <Select 
                        value={formData.cityId} 
                        onValueChange={(val) => handleSelectChange("cityId", val)}
                        disabled={!formData.countryId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المدينة" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city._id} value={city._id}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street">العنوان بالتفصيل *</Label>
                      <Input
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="الشارع - المنطقة - رقم المبنى"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
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
                        src={getMediaUrl(item.image)}
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

                {/* Coupon Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="كود الخصم"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponDiscount > 0}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleApplyCoupon}
                      disabled={!couponCode || couponDiscount > 0 || isValidatingCoupon}
                    >
                      {isValidatingCoupon ? "..." : <Ticket className="w-4 h-4" />}
                    </Button>
                  </div>
                  {couponDiscount > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      تم تطبيق خصم {couponDiscount.toLocaleString()} ج.م
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>المجموع الفرعي</span>
                    <span>{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                  {shippingCost > 0 && (
                     <div className="flex justify-between text-muted-foreground">
                       <span>الشحن ({shippingMethodName})</span>
                       <span>{shippingCost.toLocaleString()} ج.م</span>
                     </div>
                  )}
                  {couponDiscount > 0 && (
                     <div className="flex justify-between text-green-600">
                       <span>الخصم</span>
                       <span>-{couponDiscount.toLocaleString()} ج.م</span>
                     </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                    <span>الإجمالي</span>
                    <span className="text-primary">{Math.max(0, finalTotal).toLocaleString()} ج.م</span>
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
