import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Translator from "@/components/tools/Translator";

const TranslatorPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20">
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-8 md:mb-12 text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display animate-slide-up">
                AI Translator
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Translate English text to Tagalog using advanced AI powered by Gemini
              </p>
            </div>
            
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Translator />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TranslatorPage;
