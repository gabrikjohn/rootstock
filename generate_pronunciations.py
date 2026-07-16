#!/usr/bin/env python3
"""
generate_pronunciations.py
Pre-generate high-quality word pronunciations for Rootstock using Google Cloud TTS.

Default output: pronunciations.json  ->  { "word": "data:audio/mpeg;base64,..." }
With --as-files: writes ./audio/<word>.mp3 and a manifest of relative paths.

Per-word IPA overrides (via SSML <phoneme>) let you FORCE correct pronunciation
on the obscure Latin/Greek roots the engine mishandles.

Setup:
  pip install google-cloud-texttospeech
  # then EITHER:
  gcloud auth application-default login
  # OR point at a service-account key:
  export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json

Run:
  python generate_pronunciations.py --in words.json --out pronunciations.json
  python generate_pronunciations.py --as-files          # separate mp3s instead
"""

from __future__ import annotations

import argparse
import base64
import html
import json
import sys
import time
from pathlib import Path

from google.cloud import texttospeech

# --- Config -----------------------------------------------------------------
VOICE_NAME = "en-US-Neural2-J"   # swap freely; Neural2 / Studio voices sound best
LANGUAGE_CODE = "en-US"
SPEAKING_RATE = 0.9              # slightly slow = clearer on isolated words
# Optional carrier phrase. "{word}" = the word alone. Use e.g.
# "The word is {word}." if a bare word gets odd prosody.
CARRIER = "{word}"
# ---------------------------------------------------------------------------


def build_input(word: str, ipa: str | None) -> "texttospeech.SynthesisInput":
    """SSML input. If ipa is given, force pronunciation with <phoneme>."""
    inner = (
        f'<phoneme alphabet="ipa" ph="{html.escape(ipa, quote=True)}">'
        f"{html.escape(word)}</phoneme>"
        if ipa
        else html.escape(word)
    )
    ssml = f"<speak>{CARRIER.format(word=inner)}</speak>"
    return texttospeech.SynthesisInput(ssml=ssml)


def synthesize(client, word: str, ipa: str | None) -> bytes:
    voice = texttospeech.VoiceSelectionParams(
        language_code=LANGUAGE_CODE, name=VOICE_NAME
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=SPEAKING_RATE,
    )
    resp = client.synthesize_speech(
        input=build_input(word, ipa), voice=voice, audio_config=audio_config
    )
    return resp.audio_content  # raw MP3 bytes


def load_words(path: Path):
    """Accept ["cat","dog"] OR [{"word":"cat","ipa":"kæt"}, {"word":"dog"}]."""
    data = json.loads(path.read_text(encoding="utf-8"))
    out = []
    for item in data:
        if isinstance(item, str):
            out.append((item, None))
        else:
            out.append((item["word"], item.get("ipa")))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="infile", default="words.json")
    ap.add_argument("--out", dest="outfile", default="pronunciations.json")
    ap.add_argument(
        "--as-files",
        action="store_true",
        help="Write ./audio/<word>.mp3 files instead of inlining base64",
    )
    args = ap.parse_args()

    client = texttospeech.TextToSpeechClient()
    words = load_words(Path(args.infile))
    manifest: dict[str, str] = {}

    audio_dir = Path("audio")
    if args.as_files:
        audio_dir.mkdir(exist_ok=True)

    for i, (word, ipa) in enumerate(words, 1):
        key = word.lower()
        if key in manifest:  # skip dupes across gates / INFER_POOL
            continue
        try:
            mp3 = synthesize(client, word, ipa)
        except Exception as e:  # keep going; report the failure
            print(f"  ! {word}: {e}", file=sys.stderr)
            continue

        if args.as_files:
            (audio_dir / f"{key}.mp3").write_bytes(mp3)
            manifest[key] = f"audio/{key}.mp3"
        else:
            b64 = base64.b64encode(mp3).decode("ascii")
            manifest[key] = f"data:audio/mpeg;base64,{b64}"

        print(f"  [{i}/{len(words)}] {word}{' (ipa)' if ipa else ''}")
        time.sleep(0.02)  # gentle on quota

    out_path = Path(args.outfile)
    out_path.write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
    kb = out_path.stat().st_size / 1024
    print(f"\nWrote {len(manifest)} entries to {out_path} ({kb:.0f} KB)")


if __name__ == "__main__":
    main()
