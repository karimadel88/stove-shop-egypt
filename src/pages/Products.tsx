import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { shopApi } from "@/lib/api";
import { ShopProduct } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, X, SlidersHorizontal, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract unique brands and calculate price range from fetched products
  // These should be calculated from products but NOT fed back into the fetch params automatically
  const brands = [...new Set(products.map((p) => p.name.split(' ')[0]))]; 
  const availableMaxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 20000;
  const availableMinPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;

  const selectedBrands = searchParams.get("brands")?.split(",").filter(Boolean) || [];
  
  // URL Params for filtering
  const paramMinPrice = searchParams.get("minPrice");
  const paramMaxPrice = searchParams.get("maxPrice");
  const categoryId = searchParams.get("categoryId") || undefined;
  const search = searchParams.get("search") || undefined;

  // Visual Slider State
  const priceRange = [
    paramMinPrice ? Number(paramMinPrice) : availableMinPrice,
    paramMaxPrice ? Number(paramMaxPrice) : availableMaxPrice,
  ];

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await shopApi.listProducts({
          categoryId,
          search,
          // Only send price params if they exist in URL
          minPrice: paramMinPrice ? Number(paramMinPrice) : undefined,
          maxPrice: paramMaxPrice ? Number(paramMaxPrice) : undefined,
        });
        setProducts(response.data?.data || response.data || []);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'فشل في تحميل المنتجات';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, search, paramMinPrice, paramMaxPrice]);

  const updateFilters = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const toggleBrand = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    updateFilters("brands", newBrands.length > 0 ? newBrands.join(",") : null);
  };

  const handlePriceChange = (values: number[]) => {
    updateFilters("minPrice", values[0].toString());
    updateFilters("maxPrice", values[1].toString());
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Client-side filtering for brands (if needed)
  const filteredProducts = products.filter((product) => {
    if (selectedBrands.length > 0) {
      const productBrand = product.name.split(' ')[0];
      if (!selectedBrands.includes(productBrand)) return false;
    }
    return true;
  });

  const hasActiveFilters = selectedBrands.length > 0 || categoryId || search ||
    paramMinPrice || paramMaxPrice;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Filter className="w-5 h-5" />
          الفلاتر
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
            <X className="w-4 h-4" />
            مسح الكل
          </Button>
        )}
      </div>

      {brands.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">الماركة</h4>
          <div className="space-y-3">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center gap-3">
                <Checkbox
                  id={brand}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                />
                <Label htmlFor={brand} className="cursor-pointer">{brand}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">السعر</h4>
        <Slider
          min={availableMinPrice}
          max={availableMaxPrice}
          step={100}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{priceRange[0].toLocaleString()} ج.م</span>
          <span>{priceRange[1].toLocaleString()} ج.م</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">جميع المنتجات</h1>
              <p className="text-muted-foreground">
                {isLoading ? "جاري التحميل..." : `${filteredProducts.length} منتج`}
                {hasActiveFilters && " (بعد الفلترة)"}
              </p>
            </div>
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              الفلاتر
            </Button>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block">
              <div className="bg-card rounded-xl p-6 shadow-soft sticky top-24">
                <FilterPanel />
              </div>
            </aside>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
                <div className="fixed inset-y-0 right-0 w-80 bg-card shadow-xl p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">الفلاتر</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <FilterPanel />
                  <Button
                    variant="gold"
                    className="w-full mt-6"
                    onClick={() => setShowFilters(false)}
                  >
                    عرض النتائج ({filteredProducts.length})
                  </Button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-square w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <p className="text-muted-foreground text-lg mb-4">{error}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    إعادة المحاولة
                  </Button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">
                    لا توجد منتجات تطابق معايير البحث
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    مسح الفلاتر
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
