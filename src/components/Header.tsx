import { ShoppingCart, Flame, Menu, X, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { totalItems } = useCart();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<{_id: string, name: string, parentId?: string}[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { shopApi } = await import("@/lib/api");
        const response = await shopApi.getCategories();
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const rootCategories = categories.filter(cat => !cat.parentId).slice(0, 8);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      {/* Top Bar - Logo, Search, Actions */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4 lg:gap-8 justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight">
                {settings?.storeName || "مصر للبوتجازات"}
              </h1>
            </div>
          </Link>

          {/* Search Bar - Center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex relative">
            <Input 
              type="search" 
              placeholder="ابحث عن ما تريد..." 
              className="w-full pl-12 pr-4 h-11 bg-muted/30 border-muted focus-visible:ring-primary/20 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute left-1 top-1 bottom-1 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Search className="w-4 h-4" />
            </Button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            <Link to="/login" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <User className="w-5 h-5" />
              <span>حسابي</span>
            </Link>

            <div className="h-6 w-px bg-border hidden sm:block"></div>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-[10px] rounded-full">
                    {totalItems}
                  </Badge>
                )}
                <span className="sr-only">عربة التسوق</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Search - Visible only on mobile */}
        <div className="mt-3 md:hidden">
           <form onSubmit={handleSearch} className="relative">
            <Input 
              type="search" 
              placeholder="ابحث عن منتج..." 
              className="w-full pl-10 h-10 bg-muted/50 border-muted rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
          </form>
        </div>
      </div>

      {/* Secondary Navigation - Categories */}
      <div className="border-t border-border/50 bg-muted/20 hidden md:block">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-6 py-2 overflow-x-auto text-sm font-medium scrollbar-hide">
             <Link to="/" className="text-primary whitespace-nowrap">الرئيسية</Link>
             <Link to="/products" className="hover:text-primary transition-colors whitespace-nowrap">جميع المنتجات</Link>
             <div className="h-4 w-px bg-border"></div>
             {rootCategories.map((cat) => (
               <Link key={cat._id} to={`/products?categoryId=${cat._id}`} className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                 {cat.name}
               </Link>
             ))}
             <Link to="/contact" className="mr-auto hover:text-primary transition-colors whitespace-nowrap">اتصل بنا</Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-background p-4 animate-in slide-in-from-top-5">
          <div className="flex flex-col gap-4">
            <Link to="/" className="font-medium p-2 hover:bg-muted rounded-md text-primary" onClick={() => setMobileMenuOpen(false)}>الرئيسية</Link>
            <Link to="/products" className="font-medium p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>جميع المنتجات</Link>
            <div className="h-px bg-border my-2"></div>
            {rootCategories.slice(0, 5).map(cat => (
               <Link key={cat._id} to={`/products?categoryId=${cat._id}`} className="font-medium p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                 {cat.name}
               </Link>
            ))}
            <Link to="/contact" className="font-medium p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>اتصل بنا</Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
