import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolsList from "@/components/tools/ToolsList";

const Tools = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20">
        <section className="py-12 md:py-20">          <div className="container mx-auto px-4 max-w-6xl">            <div className="mb-8 md:mb-12 text-center">
              <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Discover our collection of AI-powered tools designed to enhance your productivity. 
                From translation to speech generation, explore cutting-edge AI capabilities.
              </p>
            </div>
            
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <ToolsList />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Tools;
