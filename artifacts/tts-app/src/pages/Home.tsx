import React from "react";
import { TtsInterface } from "@/components/TtsInterface";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background text-foreground relative overflow-hidden">
      
      {/* Decorative Background Image / Blur */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden -z-10 opacity-40 pointer-events-none select-none">
        <img 
          src={`${import.meta.env.BASE_URL}images/abstract-waves.png`} 
          alt="" 
          className="w-full h-full object-cover object-top opacity-50 mix-blend-overlay blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Powered by ElevenLabs
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-foreground/70 tracking-tight mb-6">
            Breathe Life Into Your Words
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
            Transform any text into professional, lifelike speech instantly. Choose from premium voices to create high-quality audio for your next project.
          </p>
        </motion.div>

        <TtsInterface />
      </main>
      
      <footer className="absolute bottom-6 w-full text-center text-sm text-muted-foreground">
        Built with Replit Agent • Beautiful TTS
      </footer>
    </div>
  );
}
