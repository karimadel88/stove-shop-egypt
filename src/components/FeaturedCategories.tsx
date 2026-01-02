import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { shopApi } from "@/lib/api";
import { ShopCategory } from "@/types/shop";
import { LayoutGrid } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMediaUrl } from "@/lib/utils";

interface FeaturedCategoriesProps {
  categories?: ShopCategory[];
  isLoading?: boolean;
}

const FeaturedCategories = ({ categories: initialCategories, isLoading: initialLoading }: FeaturedCategoriesProps) => {
  const [categories, setCategories] = useState<ShopCategory[]>(initialCategories || []);
  const [isLoading, setIsLoading] = useState(initialLoading ?? !initialCategories);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageLoadErrors(prev => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    if (initialCategories) {
      setCategories(initialCategories);
      setIsLoading(initialLoading ?? false);
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await shopApi.getCategories();
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setCategories(data); // Get all categories for the rail
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [initialCategories, initialLoading]);

  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="py-4 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>تسوق حسب الفئة</span>
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">استكشف</span>
        </h2>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-[100px]">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="w-16 h-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {categories.map((category, index) => (
              <Link
                key={category._id}
                to={`/products?categoryId=${category._id}`}
                className="flex flex-col items-center gap-3 min-w-[100px] group snap-start"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted border-2 border-transparent group-hover:border-primary transition-all duration-300 overflow-hidden flex items-center justify-center relative shadow-sm group-hover:shadow-md">
                   {(() => {
                    const imageUrl = category.image?.url || category.imageId?.url;
                    return imageUrl && !imageLoadErrors[category._id] ? (
                      <img
                        src={getMediaUrl(imageUrl)}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => handleImageError(category._id)}
                      />
                    ) : (
                       <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
                        index % 4 === 0 ? 'from-blue-100 to-blue-200 text-blue-500' :
                        index % 4 === 1 ? 'from-purple-100 to-purple-200 text-purple-500' :
                        index % 4 === 2 ? 'from-orange-100 to-orange-200 text-orange-500' :
                        'from-green-100 to-green-200 text-green-500'
                      }`}>
                        <LayoutGrid className="w-8 h-8 opacity-70" />
                      </div>
                    );
                  })()}
                </div>
                <span className="text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors line-clamp-2 w-[100px]">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
