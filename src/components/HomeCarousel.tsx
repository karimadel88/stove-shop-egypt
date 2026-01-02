import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { shopApi } from "@/lib/api";
import { ShopBanner } from "@/types/shop";
import { Skeleton } from "@/components/ui/skeleton";
import { getMediaUrl } from "@/lib/utils";

interface HomeCarouselProps {
  banners?: ShopBanner[];
  isLoading?: boolean;
}

const HomeCarousel = ({ banners: initialBanners, isLoading: initialLoading }: HomeCarouselProps) => {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );
  
  const [banners, setBanners] = useState<ShopBanner[]>(initialBanners || []);
  const [isLoading, setIsLoading] = useState(initialLoading ?? !initialBanners);

  useEffect(() => {
    if (initialBanners) {
      setBanners(initialBanners);
      setIsLoading(initialLoading ?? false);
      return;
    }

    const fetchBanners = async () => {
      try {
        const response = await shopApi.getBanners();
        setBanners(response.data);
      } catch (error) {
        console.error("Failed to fetch banners", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, [initialBanners, initialLoading]);

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-6">
        <Skeleton className="w-full h-[200px] md:h-[400px] rounded-2xl" />
      </section>
    );
  }

  if (banners.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-6">
      <Carousel
        plugins={[plugin.current]}
        className="w-full rounded-2xl overflow-hidden shadow-lg"
        dir="rtl"
        opts={{
          loop: true,
          direction: 'rtl',
        }}
      >
        <CarouselContent className="-ml-0">
          {banners.map((banner) => (
            <CarouselItem key={banner._id} className="pl-0">
              <div className="relative h-[200px] md:h-[350px] lg:h-[400px] w-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800">
                
                {/* Background Image */}
                {(banner.image?.url || (typeof banner.imageId === 'object' && banner.imageId?.url)) ? (
                    <img 
                      src={getMediaUrl(banner.image?.url || (banner.imageId as any).url)} 
                      alt={banner.title} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    // Fallback Gradient if no image
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-800" />
                )}

                {/* Overlay - Only show if there is text content */}
                {(banner.title || banner.subtitle) && (
                  <>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative z-10 text-center text-white px-4 animate-in fade-in zoom-in duration-500">
                      {banner.title && (
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight drop-shadow-md">
                          {banner.title}
                        </h2>
                      )}
                      {banner.subtitle && (
                        <p className="text-lg md:text-xl lg:text-2xl opacity-90 mb-8 max-w-2xl mx-auto font-medium shadow-sm">
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.link && (
                        <Link to={banner.link}>
                          <Button size="lg" className="bg-white text-foreground hover:bg-white/90 border-0 text-base md:text-lg px-8 py-6 rounded-full font-bold shadow-xl hover:scale-105 transition-transform">
                            {banner.buttonText || "تسوق الآن"}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </>
                )}
                
                {/* If no text but has link, make the whole slide clickable or show button? 
                    For now, if no text but has link, we might want to overlay the button or just make it clickable.
                    Let's assume image-only banners usually have text embedded in the image.
                */}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
};

export default HomeCarousel;
