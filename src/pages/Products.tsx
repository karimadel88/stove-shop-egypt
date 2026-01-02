import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { shopApi } from "@/lib/api";
import { ShopProduct } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, X, SlidersHorizontal, AlertCircle, ArrowUpDown, Grid3X3, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract unique brands and calculate price range from fetched products
  // Memoized to prevent O(N) recalculations on every render
  const brands = useMemo(() => [...new Set(products.map((p) => p.name.split(' ')[0]))], [products]);
  const availableMaxPrice = useMemo(() => products.length > 0 ? Math.max(...products.map((p) => p.price)) : 20000, [products]);
  const availableMinPrice = useMemo(() => products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0, [products]);

  const selectedBrands = useMemo(() => searchParams.get("brands")?.split(",").filter(Boolean) || [], [searchParams]);
  
  // URL Params for filtering
  const paramMinPrice = searchParams.get("minPrice");
  const paramMaxPrice = searchParams.get("maxPrice");
  const categoryId = searchParams.get("categoryId") || undefined;
  const search = searchParams.get("search") || undefined;

  // Local slider state for smooth UI (debounced before updating URL)
  const [localPriceRange, setLocalPriceRange] = useState<number[]>([
    paramMinPrice ? Number(paramMinPrice) : availableMinPrice,
    paramMaxPrice ? Number(paramMaxPrice) : availableMaxPrice,
  ]);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state when URL params or available range changes
  useEffect(() => {
    setLocalPriceRange([
      paramMinPrice ? Number(paramMinPrice) : availableMinPrice,
      paramMaxPrice ? Number(paramMaxPrice) : availableMaxPrice,
    ]);
  }, [paramMinPrice, paramMaxPrice, availableMinPrice, availableMaxPrice]);

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

  const updateFilters = useCallback((key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const toggleBrand = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    updateFilters("brands", newBrands.length > 0 ? newBrands.join(",") : null);
  };

  // Debounced price change handler
  const handlePriceChange = useCallback((values: number[]) => {
    setLocalPriceRange(values);
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new debounced update
    debounceTimerRef.current = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("minPrice", values[0].toString());
      newParams.set("maxPrice", values[1].toString());
      setSearchParams(newParams);
    }, 400);
  }, [searchParams, setSearchParams]);

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Client-side filtering for brands (if needed)
  const filteredProducts = useMemo(() => products.filter((product) => {
    if (selectedBrands.length > 0) {
      const productBrand = product.name.split(' ')[0];
      if (!selectedBrands.includes(productBrand)) return false;
    }
    return true;
  }), [products, selectedBrands]);

  const hasActiveFilters = selectedBrands.length > 0 || categoryId || search ||
    paramMinPrice || paramMaxPrice;

  // Sorting state
  const sortBy = searchParams.get("sort") || "featured";
  
  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "featured") {
      newParams.delete("sort");
    } else {
      newParams.set("sort", value);
    }
    setSearchParams(newParams);
  };

  // Client-side sorting
  const sortedProducts = useMemo(() => [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      default:
        return 0; // featured - keep original order
    }
  }), [filteredProducts, sortBy]);

  // Remove specific filter
  const removeFilter = (key: string, value?: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === "brands" && value) {
      const newBrands = selectedBrands.filter(b => b !== value);
      if (newBrands.length > 0) {
        newParams.set("brands", newBrands.join(","));
      } else {
        newParams.delete("brands");
      }
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Extract FilterPanel to a proper component to isolate re-renders
  const FilterPanel = memo(({ 
    brands, 
    selectedBrands, 
    toggleBrand, 
    availableMinPrice, 
    availableMaxPrice, 
    localPriceRange, 
    handlePriceChange,
    hasActiveFilters,
    clearFilters
  }: any) => (
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
            {brands.map((brand: string) => (
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
          value={localPriceRange}
          onValueChange={handlePriceChange}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{localPriceRange[0].toLocaleString()} ج.م</span>
          <span>{localPriceRange[1].toLocaleString()} ج.م</span>
        </div>
      </div>
    </div>
  ));
  
  FilterPanel.displayName = "FilterPanel";

  return (
    <div className="flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header Section - Amazon/Noon Style */}
          <div className="mb-6 space-y-4">
            {/* Results Count & Sorting Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {search ? `نتائج البحث: "${search}"` : "جميع المنتجات"}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {isLoading ? (
                    "جاري التحميل..."
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">{sortedProducts.length}</span> منتج
                      {hasActiveFilters && " (بعد الفلترة)"}
                    </>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Sorting Dropdown */}
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] bg-card">
                    <ArrowUpDown className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="ترتيب حسب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">الأكثر رواجاً</SelectItem>
                    <SelectItem value="price_asc">السعر: من الأقل للأعلى</SelectItem>
                    <SelectItem value="price_desc">السعر: من الأعلى للأقل</SelectItem>
                    <SelectItem value="newest">الأحدث</SelectItem>
                  </SelectContent>
                </Select>

                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  الفلاتر
                </Button>
              </div>
            </div>

            {/* Active Filter Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
                
                {search && (
                  <button
                    onClick={() => removeFilter("search")}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                  >
                    بحث: {search}
                    <X className="w-3 h-3" />
                  </button>
                )}
                
                {categoryId && (
                  <button
                    onClick={() => removeFilter("categoryId")}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                  >
                    تصنيف
                    <X className="w-3 h-3" />
                  </button>
                )}
                
                {selectedBrands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => removeFilter("brands", brand)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-sm hover:bg-secondary/20 transition-colors"
                  >
                    {brand}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                
                {(paramMinPrice || paramMaxPrice) && (
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete("minPrice");
                      newParams.delete("maxPrice");
                      setSearchParams(newParams);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm hover:bg-accent/20 transition-colors"
                  >
                    السعر: {localPriceRange[0].toLocaleString()} - {localPriceRange[1].toLocaleString()} ج.م
                    <X className="w-3 h-3" />
                  </button>
                )}
                
                <button
                  onClick={clearFilters}
                  className="text-sm text-destructive hover:underline"
                >
                  مسح الكل
                </button>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="hidden lg:block">
              <div className="bg-card rounded-xl p-6 shadow-soft sticky top-24">
                <FilterPanel 
                  brands={brands}
                  selectedBrands={selectedBrands}
                  toggleBrand={toggleBrand}
                  availableMinPrice={availableMinPrice}
                  availableMaxPrice={availableMaxPrice}
                  localPriceRange={localPriceRange}
                  handlePriceChange={handlePriceChange}
                  hasActiveFilters={hasActiveFilters}
                  clearFilters={clearFilters}
                />
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
                  <FilterPanel 
                    brands={brands}
                    selectedBrands={selectedBrands}
                    toggleBrand={toggleBrand}
                    availableMinPrice={availableMinPrice}
                    availableMaxPrice={availableMaxPrice}
                    localPriceRange={localPriceRange}
                    handlePriceChange={handlePriceChange}
                    hasActiveFilters={hasActiveFilters}
                    clearFilters={clearFilters}
                  />
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
              ) : sortedProducts.length === 0 ? (
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
                  {sortedProducts.map((product, index) => (
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
    </div>
  );
};

export default Products;
