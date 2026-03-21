import { useMutation } from "@tanstack/react-query";

// We use native fetch here instead of the generated Orval hook because 
// the generated hook attempts to parse the binary audio blob as JSON or 
// text depending on the configuration, which often fails or corrupts the audio.
// Handling blobs directly via native fetch ensures clean audio file generation.
export function useGenerateAudio() {
  return useMutation({
    mutationFn: async ({ text, voice_id }: { text: string; voice_id: string }) => {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice_id })
      });
      
      if (!res.ok) {
        // Attempt to parse JSON error message if possible
        let errorMessage = 'Failed to generate audio. Please try again.';
        try {
          const errData = await res.json();
          if (errData.error) errorMessage = errData.error;
        } catch {
          // If response isn't JSON, fallback to generic or status text
          if (res.statusText) errorMessage = `${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const blob = await res.blob();
      
      // Ensure we received actual audio data
      if (blob.size === 0 || !blob.type.includes('audio')) {
        throw new Error("Received invalid audio format from server.");
      }
      
      return URL.createObjectURL(blob);
    }
  });
}
