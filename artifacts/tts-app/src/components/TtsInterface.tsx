import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Play, Loader2, AlertCircle, Volume2, Download, Settings2, Info, ExternalLink } from "lucide-react";
import { useGenerateAudio } from "@/hooks/use-tts";

const MAX_CHARS = 5000;

export function TtsInterface() {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);

  const generateAudio = useGenerateAudio();

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleGenerate = () => {
    if (!text.trim() || !voiceId.trim()) return;
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    generateAudio.mutate(
      { text, voice_id: voiceId.trim() },
      {
        onSuccess: (url) => setAudioUrl(url),
      }
    );
  };

  const isOverLimit = text.length > MAX_CHARS;
  const isCloseToLimit = text.length > MAX_CHARS * 0.9;
  const canGenerate =
    text.trim().length > 0 &&
    voiceId.trim().length > 0 &&
    !isOverLimit &&
    !generateAudio.isPending;

  const errorMsg = generateAudio.isError ? (generateAudio.error as Error).message : "";
  const isPermissionError =
    errorMsg.includes("permission") ||
    errorMsg.includes("library voices") ||
    errorMsg.includes("paid") ||
    errorMsg.includes("upgrade");

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">

      {/* Voice ID Setup Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 bg-primary/10 text-primary rounded-lg mt-0.5 shrink-0">
              <Settings2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-foreground">Your ElevenLabs Voice ID</h3>
                <button
                  onClick={() => setShowVoiceHelp(!showVoiceHelp)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                placeholder="Paste your Voice ID here (e.g. 21m00Tcm4TlvDq8ikWAM)"
                className="w-full bg-secondary/30 border border-border/60 focus:border-primary/40 rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors"
              />
            </div>
          </div>
          <a
            href="https://elevenlabs.io/app/voice-lab"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mt-1"
          >
            ElevenLabs <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <AnimatePresence>
          {showVoiceHelp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4 pt-0">
                <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">How to find your Voice ID (free):</p>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>Go to <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">elevenlabs.io</a> and sign in</li>
                    <li>Click <strong>Voices</strong> in the left sidebar</li>
                    <li>Click any voice in <strong>"My Voices"</strong> (or add one via Instant Voice Clone)</li>
                    <li>Copy the <strong>Voice ID</strong> shown at the bottom of the voice details panel</li>
                    <li>Paste it above and generate!</li>
                  </ol>
                  <p className="text-xs pt-1 text-muted-foreground/70">
                    Note: ElevenLabs free API keys can only use voices you own — not premade library voices.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main TTS Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-border/50 bg-secondary/30 flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display text-foreground">Studio Voice</h2>
            <p className="text-sm text-muted-foreground">Convert text to lifelike speech instantly</p>
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
            <div
              className={`absolute bottom-4 right-4 text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-md transition-colors ${
                isOverLimit
                  ? "bg-destructive/10 text-destructive"
                  : isCloseToLimit
                  ? "bg-orange-500/10 text-orange-600"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {generateAudio.isError && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-1"
                  >
                    <div className="flex items-start gap-2 text-destructive text-sm font-medium bg-destructive/10 px-4 py-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p>{errorMsg}</p>
                        {isPermissionError && (
                          <p className="text-xs mt-1 font-normal text-destructive/80">
                            Your ElevenLabs free account can only use voices you own.{" "}
                            <button
                              onClick={() => setShowVoiceHelp(true)}
                              className="underline font-medium"
                            >
                              See how to find your Voice ID
                            </button>
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
                {!voiceId.trim() && !generateAudio.isError && (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-muted-foreground"
                  >
                    Enter your Voice ID above to get started
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="shrink-0 relative group overflow-hidden px-8 py-4 rounded-2xl font-display font-semibold text-white bg-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-300"
            >
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

        {/* Audio Player */}
        <AnimatePresence>
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-primary/5 border-t border-border/50 overflow-hidden"
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
                  <audio controls autoPlay src={audioUrl} className="w-full h-12 outline-none" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
