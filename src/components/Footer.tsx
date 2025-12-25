import { Flame, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold">مصر للبوتجازات</h3>
            </div>
            <p className="text-secondary-foreground/70 mb-4">
              وجهتك الأولى لشراء أفضل البوتجازات في مصر بأسعار منافسة وجودة عالية
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-secondary-foreground/70 hover:text-primary transition-colors">الرئيسية</a></li>
              <li><a href="#products" className="text-secondary-foreground/70 hover:text-primary transition-colors">المنتجات</a></li>
              <li><a href="#" className="text-secondary-foreground/70 hover:text-primary transition-colors">العروض</a></li>
              <li><a href="#" className="text-secondary-foreground/70 hover:text-primary transition-colors">سياسة الإرجاع</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-secondary-foreground/70" dir="ltr">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-secondary-foreground/70">info@egygas.com</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-secondary-foreground/70">القاهرة، مصر</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center">
          <p className="text-secondary-foreground/50">
            © 2025 مصر للبوتجازات. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
