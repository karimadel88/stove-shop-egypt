import { ShoppingCart, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

const Header = () => {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
              <Flame className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">مصر للبوتجازات</h1>
              <p className="text-xs text-muted-foreground">أفضل الماركات بأقل الأسعار</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              الرئيسية
            </Link>
            <a href="#products" className="text-muted-foreground hover:text-primary transition-colors">
              المنتجات
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              العروض
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              اتصل بنا
            </a>
          </nav>

          <Link to="/cart">
            <Button variant="cart" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
