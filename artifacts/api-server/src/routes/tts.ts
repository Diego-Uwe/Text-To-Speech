import { Router, type IRouter } from "express";
import { GenerateSpeechBody, GetVoicesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// @ts-ignore
const ELEVENLABS_API_KEY = (typeof process !== 'undefined' ? process.env.VITE_ELEVENLABS_API_KEY : undefined) || "";
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

const DEFAULT_VOICES = [
  { voice_id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", category: "premade" },
  { voice_id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", category: "premade" },
  { voice_id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", category: "premade" },
  { voice_id: "ErXwobaYiN019PkySvjV", name: "Antoni", category: "premade" },
  { voice_id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", category: "premade" },
  { voice_id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", category: "premade" },
  { voice_id: "VR6AewLTigWG4xSOukaG", name: "Arnold", category: "premade" },
  { voice_id: "pNInz6obpgDQGcFmaJgB", name: "Adam", category: "premade" },
  { voice_id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam", category: "premade" },
  { voice_id: "GBv7mTt0atIp3Br8iCZE", name: "Thomas", category: "premade" },
];

router.get("/tts/voices", async (req, res) => {
  try {
    const response = await fetch(`${ELEVENLABS_BASE}/voices`, {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY ?? "",
      },
    });

    if (!response.ok) {
      req.log.warn(
        { status: response.status },
        "ElevenLabs voices API unavailable, using defaults",
      );
      const parsed = GetVoicesResponse.parse({ voices: DEFAULT_VOICES });
      res.json(parsed);
      return;
    }

    const data = (await response.json()) as {
      voices: Array<{ voice_id: string; name: string; category?: string }>;
    };
    const voices = data.voices.map((v) => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category ?? "general",
    }));

    const parsed = GetVoicesResponse.parse({ voices });
    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "Failed to get voices, using defaults");
    const parsed = GetVoicesResponse.parse({ voices: DEFAULT_VOICES });
    res.json(parsed);
  }
});

router.post("/tts/generate", async (req, res) => {
  const parsed = GenerateSpeechBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text, voice_id, model_id } = parsed.data;

  try {
    const response = await fetch(
      `${ELEVENLABS_BASE}/text-to-speech/${voice_id}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY ?? "",
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: model_id ?? "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      req.log.error(
        { status: response.status, body: errorText },
        "ElevenLabs TTS error",
      );

      let userMessage = "Failed to generate speech. Please try again.";
      try {
        const errJson = JSON.parse(errorText);
        const code = errJson?.detail?.code ?? "";
        if (code === "paid_plan_required" || response.status === 402) {
          userMessage =
            "Free accounts cannot use library voices via the API. Please use a voice you own — paste its Voice ID from your ElevenLabs dashboard.";
        } else if (response.status === 401) {
          userMessage =
            "Invalid or missing ElevenLabs API key. Please check your key in Replit Secrets.";
        } else if (errJson?.detail?.message) {
          userMessage = errJson.detail.message;
        }
      } catch {
        // keep default message
      }

      res.status(500).json({ error: userMessage });
      return;
    }

    const audioBuffer = await response.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    req.log.error({ err }, "Failed to generate speech");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
