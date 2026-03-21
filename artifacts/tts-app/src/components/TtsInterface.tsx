import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Play, Loader2, AlertCircle, Volume2, Download, Settings2 } from "lucide-react";
import { useGetVoices } from "@workspace/api-client-react";
import { useGenerateAudio } from "@/hooks/use-tts";

const MAX_CHARS = 5000;

export function TtsInterface() {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Fetch voices using the generated hook
  const { data: voicesData, isLoading: isLoadingVoices, error: voicesError } = useGetVoices();
  const voices = voicesData?.voices || [];

  // Generate audio mutation
  const generateAudio = useGenerateAudio();

  // Set default voice once loaded
  useEffect(() => {
    if (voices.length > 0 && !voiceId) {
      setVoiceId(voices[0].voice_id);
    }
  }, [voices, voiceId]);

  // Cleanup object URL on unmount or when generating a new one
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerate = () => {
    if (!text.trim() || !voiceId) return;
    
    // Revoke previous audio URL to avoid memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    generateAudio.mutate(
      { text, voice_id: voiceId },
      {
        onSuccess: (url) => {
          setAudioUrl(url);
        }
      }
    );
  };

  const isOverLimit = text.length > MAX_CHARS;
  const isCloseToLimit = text.length > MAX_CHARS * 0.9;
  const canGenerate = text.trim().length > 0 && !isOverLimit && !generateAudio.isPending && !!voiceId;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-border/50 bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display text-foreground">Studio Voice</h2>
              <p className="text-sm text-muted-foreground">Convert text to lifelike speech instantly</p>
            </div>
          </div>
          
          {/* Voice Selector */}
          <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-1 py-1 shadow-sm">
            <div className="pl-3 text-muted-foreground">
              <Settings2 className="w-4 h-4" />
            </div>
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              disabled={isLoadingVoices || !!voicesError}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 py-2 pr-8 pl-2 text-foreground disabled:opacity-50 cursor-pointer outline-none appearance-none w-48 truncate"
            >
              {isLoadingVoices && <option value="">Loading voices...</option>}
              {voicesError && <option value="">Error loading voices</option>}
              {!isLoadingVoices && !voicesError && voices.map((v) => (
                <option key={v.voice_id} value={v.voice_id}>
                  {v.name} ({v.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-8">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your script here to convert it to high-quality audio..."
              className="w-full min-h-[280px] p-6 bg-secondary/20 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl text-foreground text-lg leading-relaxed placeholder:text-muted-foreground/60 resize-y transition-all duration-300 outline-none"
            />
            
            {/* Character Counter */}
            <div className={`absolute bottom-4 right-4 text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-md transition-colors ${
              isOverLimit 
                ? "bg-destructive/10 text-destructive" 
                : isCloseToLimit
                  ? "bg-orange-500/10 text-orange-600"
                  : "bg-secondary text-muted-foreground"
            }`}>
              {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {generateAudio.isError && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-destructive text-sm font-medium bg-destructive/10 px-4 py-2 rounded-lg inline-flex"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{generateAudio.error.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="relative group overflow-hidden px-8 py-4 rounded-2xl font-display font-semibold text-white bg-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />
              <div className="relative flex items-center gap-2">
                {generateAudio.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Generate Speech</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Audio Player Result */}
        <AnimatePresence>
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0, borderTopColor: "transparent" }}
              animate={{ opacity: 1, height: "auto", borderTopColor: "var(--border)" }}
              exit={{ opacity: 0, height: 0, borderTopColor: "transparent" }}
              className="bg-primary/5 border-t overflow-hidden"
            >
              <div className="px-8 py-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Volume2 className="w-5 h-5" />
                    <span>Audio Ready</span>
                  </div>
                  <a
                    href={audioUrl}
                    download="generated-speech.mp3"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download MP3</span>
                  </a>
                </div>
                
                <div className="bg-background rounded-2xl p-2 shadow-sm border border-border/50">
                  <audio 
                    controls 
                    autoPlay
                    src={audioUrl} 
                    className="w-full h-12 outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
