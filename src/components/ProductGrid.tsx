import { useState, useEffect } from "react";
import { shopApi } from "@/lib/api";
import { ShopProduct } from "@/types/shop";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const ProductGrid = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await shopApi.listProducts({ limit: 6 });
        const data = response.data?.data || response.data || [];
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section id="products" className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            منتجاتنا المميزة
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            اختر من بين أفضل الماركات العالمية والمحلية بأسعار تنافسية
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
