"use client";

import { Volume2 } from "lucide-react";

export function AudioButton({ text, audioUrl }: { text: string; audioUrl?: string | null }) {
  function playAudio() {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      void audio.play();
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.78;
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <button className="audio-button" type="button" onClick={playAudio} aria-label={`Dengarkan ${text}`}>
      <Volume2 size={17} />
      <span>Dengar</span>
    </button>
  );
}
