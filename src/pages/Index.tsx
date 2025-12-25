import Header from "@/components/Header";
import HomeCarousel from "@/components/HomeCarousel";
import ProductGrid from "@/components/ProductGrid";
import FeaturedCategories from "@/components/FeaturedCategories";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      <Header />
      <main className="flex-1 space-y-2">
        <HomeCarousel />
        <FeaturedCategories />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
