import { useMutation } from "@tanstack/react-query";

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
        let errorMessage = 'Failed to generate audio. Please try again.';
        try {
          const errData = await res.json();
          if (errData.error) errorMessage = errData.error;
        } catch {
          if (res.statusText) errorMessage = `${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const blob = await res.blob();
      
      if (blob.size === 0 || !blob.type.includes('audio')) {
        throw new Error("Received invalid audio format from server.");
      }
      
      return URL.createObjectURL(blob);
    }
  });
}
