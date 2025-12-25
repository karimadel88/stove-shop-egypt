import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, ShoppingBag, Timer, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl opacity-50" />
      </div>

      <section className="relative z-10 pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-8 border border-primary/20 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>وجهتك الأولى للتسوق</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                كل ما تحتاجه
              </span>
              <br />
              <span className="text-foreground">في مكان واحد</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              استكشف عالمًا من المنتجات المتنوعة التي تلبي كافة احتياجاتك.
              تجربة تسوق شاملة، سهلة، وموثوقة نضعها بين يديك.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/products">
                <Button size="lg" className="group min-w-[200px] text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                  ابـدأ التسـوق
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="min-w-[200px] text-lg rounded-full border-2 hover:bg-secondary/50 backdrop-blur-sm">
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Features Bar */}
      <div className="container mx-auto px-4 relative z-20 -mt-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card/60 backdrop-blur-xl border border-border/50 p-6 md:p-10 rounded-3xl shadow-2xl">
          {[
            { 
              icon: <Timer className="w-8 h-8" />, 
              title: "توصيل سريع", 
              desc: "خدمة شحن سريعة وموثوقة لجميع المحافظات" 
            },
            { 
              icon: <ShieldCheck className="w-8 h-8" />, 
              title: "منتجات أصلية", 
              desc: "نضمن لك جودة وأصالة جميع المنتجات" 
            },
            { 
              icon: <ShoppingBag className="w-8 h-8" />, 
              title: "تنوع هائل", 
              desc: "تشكيلة واسعة تناسب كل الأذواق والاحتياجات" 
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/5 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
