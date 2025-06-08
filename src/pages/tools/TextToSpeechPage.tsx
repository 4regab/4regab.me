import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TextToSpeech from "@/components/tools/TextToSpeech";

const TextToSpeechPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20">
        <div className="relative overflow-hidden">
          {/* Background gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-purple/10 pointer-events-none" />
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-neon-orange/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative z-10">
            <TextToSpeech />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TextToSpeechPage;
