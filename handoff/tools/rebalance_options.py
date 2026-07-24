#!/usr/bin/env python3
"""Guarded, all-or-nothing option-length rebalance for item 10.

Each source object is replaced only when its complete original text occurs exactly
once. The meaning-bearing distractor is retained; a brief grammatical qualifier
brings terse options into the same length band as their definition.
"""
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
FILES = [ROOT / "index.html", ROOT / "drill.js"]
OBJECT = re.compile(
    r'\{word:"(?:\\.|[^"\\])*".*?def:"(?P<definition>(?:\\.|[^"\\])*)"'
    r'.*?distractors:\[(?P<distractors>(?:"(?:\\.|[^"\\])*"\s*,?\s*)+)\]',
    re.DOTALL,
)
STRING = re.compile(r'"((?:\\.|[^"\\])*)"')


def lengthen(text, target):
    """Add the shortest complete qualifier that reaches the requested band."""
    if len(text) >= target:
        return text
    choices = [" now", " here", " in use", " in context", " in a related case",
               " in a specialized setting", " under a different interpretation"]
    suffix = next((s for s in choices if len(text) + len(s) >= target), choices[-1])
    if text.endswith("."):
        return text[:-1] + suffix + "."
    return text + suffix


def rewrite(path):
    rel = path.relative_to(ROOT).as_posix()
    # Rebuild from the committed functional baseline so a re-run is deterministic
    # and cannot compound a previous balancing pass.
    src = subprocess.check_output(["git", "show", f"HEAD:{rel}"], cwd=ROOT, text=True)
    edits = []
    for match in OBJECT.finditer(src):
        old = match.group(0)
        definition = match.group("definition")
        distractors = STRING.findall(match.group("distractors"))
        if len(distractors) != 3:
            continue
        # Two foils sit alongside the definition and the third remains slightly
        # shorter. One foil is definitely longer, removing the length cue.
        targets = [len(definition) + 1, len(definition), max(1, len(definition) - 6)]
        revised = [lengthen(d, t) for d, t in zip(distractors, targets)]
        if revised == distractors:
            continue
        replacement = old.replace(
            match.group("distractors"),
            ", ".join('"' + d + '"' for d in revised),
            1,
        )
        edits.append((old, replacement))

    out = src
    errors = []
    for old, new in edits:
        count = out.count(old)
        if count != 1:
            errors.append(f"{path.name}: expected one source object, found {count}")
            continue
        out = out.replace(old, new, 1)
    if errors:
        print("ABORT", *errors, sep="\n", file=sys.stderr)
        return False
    if not edits:
        print(f"ABORT {path.name}: no eligible definitions found", file=sys.stderr)
        return False
    path.write_text(out, encoding="utf-8")
    print(f"{path.name}: rebalanced {len(edits)} definitions")
    return True


if not all(rewrite(path) for path in FILES):
    sys.exit(1)
