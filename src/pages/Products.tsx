import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, X, SlidersHorizontal } from "lucide-react";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const brands = [...new Set(products.map((p) => p.brand))];
  const maxPrice = Math.max(...products.map((p) => p.price));
  const minPrice = Math.min(...products.map((p) => p.price));

  const selectedBrands = searchParams.get("brands")?.split(",").filter(Boolean) || [];
  const priceRange = [
    Number(searchParams.get("minPrice")) || minPrice,
    Number(searchParams.get("maxPrice")) || maxPrice,
  ];
  const inStockOnly = searchParams.get("inStock") === "true";

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

  const filteredProducts = products.filter((product) => {
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    if (inStockOnly && !product.inStock) {
      return false;
    }
    return true;
  });

  const hasActiveFilters = selectedBrands.length > 0 || inStockOnly || 
    priceRange[0] !== minPrice || priceRange[1] !== maxPrice;

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

      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">السعر</h4>
        <Slider
          min={minPrice}
          max={maxPrice}
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

      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">التوفر</h4>
        <div className="flex items-center gap-3">
          <Checkbox
            id="inStock"
            checked={inStockOnly}
            onCheckedChange={(checked) => updateFilters("inStock", checked ? "true" : null)}
          />
          <Label htmlFor="inStock" className="cursor-pointer">متوفر فقط</Label>
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
                {filteredProducts.length} منتج
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
              {filteredProducts.length === 0 ? (
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
                      key={product.id}
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
