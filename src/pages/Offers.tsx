import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { Clock, Percent, Gift, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const Offers = () => {
  const offersProducts = products.filter((p) => p.originalPrice);
  
  // Countdown timer for limited offer
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-gold py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/20 px-4 py-2 rounded-full mb-6">
              <Zap className="w-5 h-5 text-primary-foreground" />
              <span className="text-primary-foreground font-semibold">عروض حصرية لفترة محدودة</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              خصومات تصل إلى 20%
            </h1>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              استغل الفرصة واحصل على أفضل البوتجازات بأسعار لا تُقاوم
            </p>

            {/* Countdown Timer */}
            <div className="flex justify-center gap-4">
              {[
                { value: timeLeft.days, label: "يوم" },
                { value: timeLeft.hours, label: "ساعة" },
                { value: timeLeft.minutes, label: "دقيقة" },
                { value: timeLeft.seconds, label: "ثانية" },
              ].map((item, index) => (
                <div key={index} className="bg-primary-foreground/20 backdrop-blur-sm rounded-xl p-4 min-w-[80px]">
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">
                    {item.value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-primary-foreground/70 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  icon: Percent, 
                  title: "خصومات حقيقية", 
                  desc: "تخفيضات تصل إلى 20% على جميع المنتجات" 
                },
                { 
                  icon: Gift, 
                  title: "هدايا مجانية", 
                  desc: "احصل على ملحقات مجانية مع كل شراء" 
                },
                { 
                  icon: Clock, 
                  title: "عرض محدود", 
                  desc: "العرض ساري لفترة محدودة فقط" 
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-card p-6 rounded-xl shadow-soft"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Offers Products */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">منتجات العروض</h2>
              <p className="text-muted-foreground">
                {offersProducts.length} منتج بأسعار مخفضة
              </p>
            </div>

            {offersProducts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {offersProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  لا توجد عروض حالياً - ترقبوا العروض القادمة!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Special Banner */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-secondary-foreground mb-4">
              🎁 عرض خاص للطلبات فوق 10,000 ج.م
            </h2>
            <p className="text-secondary-foreground/80 text-lg mb-6">
              احصل على توصيل مجاني + تركيب مجاني + ضمان إضافي سنة
            </p>
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold">
              <Gift className="w-5 h-5" />
              العرض ساري حتى نفاد الكمية
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Offers;
