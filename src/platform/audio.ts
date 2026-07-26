import { AUDIO_MANIFEST } from "../content/audio-manifest";
import { IPA } from "../content/ipa";
import type { AudioPlayer } from "./contracts";

export const SAY_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">'
  + '<path d="M11 4.5 5.8 8.6H2.6v6.8h3.2L11 19.5z" fill="currentColor"></path>'
  + '<path d="M14.8 8.7a4.7 4.7 0 0 1 0 6.6M17.8 5.9a8.8 8.8 0 0 1 0 12.2" '
  + 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"></path></svg>';

const voiceRank = [
  /Ava.*Premium/i, /Ava.*Enhanced/i, /Ava/i,
  /Zoe.*Premium/i, /Zoe.*Enhanced/i, /Zoe/i,
  /Samantha.*Enhanced/i, /Samantha/i,
  /Siri.*en[-_]?US/i, /Allison.*Enhanced/i, /Allison/i,
  /Nicky/i, /Google US English/i
];

const clipCache = new Map<string, HTMLAudioElement>();
let voices: SpeechSynthesisVoice[] = [];
let chosenVoice: SpeechSynthesisVoice | null = null;
let installed = false;

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function ipaOf(word: string): string {
  const ipa = (IPA as Readonly<Record<string, string>>)[word];
  return ipa ? `/${ipa}/` : "";
}

export function pronLine(word: string, pronunciation: string): string {
  const text = [ipaOf(word), pronunciation].filter(Boolean).join("\u2002·\u2002");
  const escaped = escapeAttribute(word);
  return `<div class="pron"><button class="say" type="button" data-say="${escaped}" `
    + `aria-label="Hear “${escaped}”">${SAY_ICON}</button><span class="pron-t">${text}</span></div>`;
}

function pickVoice(): SpeechSynthesisVoice | null {
  const american = voices.filter((voice) => /^en[-_]US/i.test(voice.lang));
  const pool = american.length
    ? american
    : voices.filter((voice) => voice.lang.slice(0, 2).toLowerCase() === "en");
  for (const pattern of voiceRank) {
    const match = pool.find((voice) => pattern.test(voice.name));
    if (match) return match;
  }
  return pool.find((voice) => voice.default) ?? american[0] ?? pool[0] ?? null;
}

function loadVoices(): void {
  try {
    voices = window.speechSynthesis.getVoices() ?? [];
  } catch {
    voices = [];
  }
  chosenVoice = pickVoice();
}

function speakWord(word: string, done?: () => void): void {
  if (!("speechSynthesis" in window)) {
    done?.();
    return;
  }
  if (!chosenVoice) chosenVoice = pickVoice();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.82;
  utterance.pitch = 1;
  if (chosenVoice) utterance.voice = chosenVoice;
  utterance.onend = utterance.onerror = () => done?.();
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function playClip(word: string, done?: () => void): boolean {
  const key = word.toLowerCase();
  const relativeUrl = AUDIO_MANIFEST[word] ?? AUDIO_MANIFEST[key];
  if (!relativeUrl) return false;
  let audio = clipCache.get(key);
  if (!audio) {
    audio = new Audio(new URL(relativeUrl, document.baseURI).href);
    audio.preload = "metadata";
    clipCache.set(key, audio);
  }
  let fellBack = false;
  const fallback = (): void => {
    if (fellBack) return;
    fellBack = true;
    speakWord(word, done);
  };
  audio.onended = () => done?.();
  audio.onerror = fallback;
  try {
    window.speechSynthesis.cancel();
    audio.pause();
    audio.currentTime = 0;
    const playback = audio.play();
    playback.catch(fallback);
  } catch {
    fallback();
  }
  return true;
}

function sayWord(word: string, button: HTMLElement | null): void {
  button?.classList.add("saying");
  const done = (): void => button?.classList.remove("saying");
  if (!playClip(word, done)) speakWord(word, done);
}

export function installAudio(): void {
  if (installed) return;
  installed = true;
  if ("speechSynthesis" in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLElement>("[data-say]");
    if (!button?.dataset.say) return;
    event.stopPropagation();
    sayWord(button.dataset.say, button);
  });
}

export function browserAudioPlayer(): AudioPlayer {
  return {
    install: installAudio,
    play: playClip
  };
}
