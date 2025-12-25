import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck, Shield, Headphones } from "lucide-react";

const Hero = () => {
  return (
    <section className="gradient-hero py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto animate-fade-up">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
            🔥 عروض حصرية - خصم حتى 20%
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient">أفضل البوتجازات</span>
            <br />
            <span className="text-foreground">بأسعار مصرية</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            تشكيلة واسعة من أفضل الماركات العالمية والمحلية مع ضمان وخدمة ما بعد البيع
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" className="group">
              تسوق الآن
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              تصفح العروض
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            { icon: Truck, title: "توصيل مجاني", desc: "لجميع أنحاء مصر" },
            { icon: Shield, title: "ضمان شامل", desc: "حتى 5 سنوات" },
            { icon: Headphones, title: "دعم فني", desc: "24/7 متاح دائماً" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-card p-6 rounded-xl shadow-soft hover:shadow-hover transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
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
  );
};

export default Hero;
