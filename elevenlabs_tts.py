import os
import requests

ELEVENLABS_API_KEY = "YOUR_API_KEY_HERE"
VOICE_ID = "YOUR_VOICE_ID_HERE"
MODEL_ID = "eleven_turbo_v2_5"

def list_voices(api_key: str) -> list[dict]:
    response = requests.get(
        "https://api.elevenlabs.io/v1/voices",
        headers={"xi-api-key": api_key}
    )
    response.raise_for_status()
    return response.json()["voices"]

def text_to_speech(text: str, voice_id: str, api_key: str, output_file: str = "output.mp3") -> str:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }
    payload = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()

    with open(output_file, "wb") as f:
        f.write(response.content)

    print(f"Audio guardado en: {output_file}")
    return output_file


if __name__ == "__main__":
    api_key = ELEVENLABS_API_KEY
    voice_id = VOICE_ID

    text = input("Escribe el texto que quieres convertir a voz:\n> ")
    if not text.strip():
        print("El texto no puede estar vacío.")
        exit(1)

    output = input("Nombre del archivo de salida (Enter para 'output.mp3'): ").strip()
    if not output:
        output = "output.mp3"
    if not output.endswith(".mp3"):
        output += ".mp3"

    text_to_speech(text, voice_id, api_key, output)
