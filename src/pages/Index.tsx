import HomeCarousel from "@/components/HomeCarousel";
import ProductGrid from "@/components/ProductGrid";
import FeaturedCategories from "@/components/FeaturedCategories";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "@/lib/api";
import { HomeResponse } from "@/types/shop";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const queryClient = useQueryClient();
  const { data: homeData, isLoading } = useQuery({
    queryKey: ["home-data"],
    queryFn: async () => {
      const response = await shopApi.getHomeData();
      return response.data as HomeResponse;
    },
  });

  // Hydrate other queries to avoid double-fetching
  useEffect(() => {
    if (homeData) {
      if (homeData.settings) {
        queryClient.setQueryData(['shop-settings'], homeData.settings);
      }
      if (homeData.categories) {
        queryClient.setQueryData(['categories'], homeData.categories);
      }
    }
  }, [homeData, queryClient]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse text-lg">جاري تحميل المتجر...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <HomeCarousel 
        banners={homeData?.banners} 
        isLoading={isLoading} 
      />
      
      <FeaturedCategories 
        categories={homeData?.categories} 
        isLoading={isLoading} 
      />
      
      <ProductGrid 
        products={homeData?.featuredProducts} 
        isLoading={isLoading} 
        title="منتجات مختارة لك"
        subtitle="مجموعة من أفضل المنتجات المختارة بعناية لتناسب احتياجاتك"
      />

      <ProductGrid 
        products={homeData?.newArrivals} 
        isLoading={isLoading} 
        title="أحدث المنتجات لدينا"
        subtitle="استكشف آخر الموديلات والمنتجات التي وصلت حديثاً إلى معرضنا"
      />

      {/* <ProductGrid 
        products={homeData?.onSaleProducts} 
        isLoading={isLoading} 
        title="عروض حصرية"
        subtitle="اغتنم الفرصة مع أفضل العروض والخصومات المميزة"
      /> */}
    </div>
  );
};

export default Index;
