import { SAY_ICON } from "../../platform/audio";

export function renderRootAudio(root: string): string {
  const speakable = root.split(/[\/,+]/)[0]?.replace(/[^\p{L}\s'’]/gu, "").trim() ?? "";
  if (!speakable) return "";
  return renderSmallAudio(speakable, `Hear the root ‘${escapeHtml(speakable)}’`);
}

export function renderWordAudio(word: string): string {
  return renderSmallAudio(word, `Hear ‘${escapeHtml(word)}’`);
}

function renderSmallAudio(word: string, label: string): string {
  return `<button class="say say-sm" type="button" data-say="${escapeAttribute(word)}" aria-label="${label}">${SAY_ICON}</button>`;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
