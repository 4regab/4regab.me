import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Helper from '@/components/tools/Helper';

const HelperPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20">
        <div className="relative overflow-hidden">
          {/* Background gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-blue/10 pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-neon-orange/5 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative z-10">
            <Helper />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelperPage;
