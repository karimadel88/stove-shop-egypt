import { Flame, Phone, Mail, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "@/context/SettingsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const { settings, isLoading, isError } = useSettings();
  const year = new Date().getFullYear();

  // Show loading skeleton
  if (isLoading) {
    return (
      <footer className="bg-secondary text-secondary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-32 h-6" />
              </div>
              <Skeleton className="w-full h-16" />
            </div>
            <div className="space-y-4">
              <Skeleton className="w-24 h-5" />
              <div className="space-y-2">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-20 h-4" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="w-24 h-5" />
              <div className="space-y-3">
                <Skeleton className="w-36 h-4" />
                <Skeleton className="w-40 h-4" />
                <Skeleton className="w-32 h-4" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Show error state
  if (isError) {
    return (
      <footer className="bg-secondary text-secondary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">حدث خطأ في تحميل البيانات</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              حاول مرة أخرى
            </Button>
          </div>
        </div>
      </footer>
    );
  }

  // Don't render if no settings
  if (!settings) return null;

  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary-foreground" />
              </div>
              {settings.storeName && (
                <h3 className="text-xl font-bold">{settings.storeName}</h3>
              )}
            </div>
            <p className="text-secondary-foreground/70 mb-4">
              وجهتك الأولى لشراء أفضل البوتجازات في مصر بأسعار منافسة وجودة عالية
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-secondary-foreground/70 hover:text-primary transition-colors">الرئيسية</Link></li>
              <li><Link to="/products" className="text-secondary-foreground/70 hover:text-primary transition-colors">المنتجات</Link></li>
              <li><Link to="/offers" className="text-secondary-foreground/70 hover:text-primary transition-colors">العروض</Link></li>
              <li><Link to="/contact" className="text-secondary-foreground/70 hover:text-primary transition-colors">اتصل بنا</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              {settings.contactInfo?.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-secondary-foreground/70" dir="ltr">
                    {settings.contactInfo.phone}
                  </span>
                </li>
              )}
              {settings.contactInfo?.email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-secondary-foreground/70">
                    {settings.contactInfo.email}
                  </span>
                </li>
              )}
              {settings.contactInfo?.address && (
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-secondary-foreground/70">
                    {settings.contactInfo.address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center">
          <p className="text-secondary-foreground/50">
            © {year} {settings.storeName || "المتجر"}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

