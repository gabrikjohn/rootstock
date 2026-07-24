# Rootstock — Implementation Handoff

This document specifies the **remaining** work on the app-changes evaluation plan, written so
another coding agent (Codex) can execute it end-to-end. It is self-contained: read §1–§4 first,
then do the tasks in §5. Verification tooling is in `handoff/tools/` (§4) and the finished work
so far is described in §3 so you don't redo it.

---

## 1. What this app is (orientation)

- **Rootstock** teaches English vocabulary through Latin/Greek roots. It is a **plain vanilla
  HTML/CSS/JS PWA** — **no framework, no bundler, no package.json, no test suite.** You run it by
  opening `index.html`; a **Cloudflare Pages** preview builds automatically on every push to the PR.
- **Almost everything lives in `index.html`** (~4080 lines): all CSS, all engine logic, and most
  content data. Four sibling data files: `drill.js` (`window.DRILL_POOL`), `depth.js`
  (`window.DEPTH`), `rootdeep.js` (`window.ROOT_DEEP`), plus the `ETYM` map inline in `index.html`.
  `words.json`/`roots.json` are **only** seeds for `generate_pronunciations.py` (audio) — **not** the
  runtime lexicon; do not edit them for content.
- **`index.html` is ~650k tokens.** Do **not** open it whole. Locate code with `grep -n` / `sed -n`,
  and **edit via scripts with exact-match assertions** (§4), never by hand-scrolling.

## 2. Ground rules

- **Never break parse.** After every edit to `index.html`, run `node handoff/tools/check_syntax.js`
  (must report `0 failed`). Keep the Cloudflare preview green.
- **Edit method:** write a small Python script that does `str.replace(old, new)` with an
  **assert-count** guard (see §4 pattern). All-or-nothing: if any anchor doesn't match exactly once
  (or the intended count), write nothing and fix the anchor. This is how the shipped work was done.
- **Anchors:** line numbers drift as you edit — reference **function names / unique code strings**
  and `grep` for them, don't trust absolute line numbers in this doc.
- **Scope discipline:** these are content + small-logic changes. Do not refactor the engine or
  restyle the app beyond what a task requires.
- **Git:** work on branch `claude/app-changes-evaluation-plan-9qzlcs` (PR #14, draft) unless told
  otherwise. Commit per task with a descriptive message; push; keep the PR a draft until the human
  says it's ready.

## 3. Already done — do NOT redo (shipped on the branch)

| Item | What shipped | New helpers added (grep to find) |
|---|---|---|
| 13 safe-area whitespace | `viewport-fit=cover`; each theme's header fills `env(safe-area-inset-top)`; theme-color default synced | — |
| 9 no word twice in a row | serve-time guard in `trialItem` and `rootDrillItem`; penalty rep spaced apart | `itemKey`, `avoidRepeat`, `requeueMiss` |
| 8 teach on wrong root | in-gate root drill miss reveals gloss + etymology note | `rootEtymNote` |
| 5 inference feedback | correct+wrong inference feedback shows morphology + classical roots | `inferDeep` |
| 12 "infallible" scene | explained (it's the intentional `DEPTH['infallible'].v` vignette) — no code | — |

Those helpers already exist in `index.html`; reuse them. **Remaining items: 1, 2, 3, 4, 6, 7, 10, 11.**

## 4. Verification tooling (`handoff/tools/`, run from repo root)

- **`node handoff/tools/check_syntax.js`** — parses every inline `<script>` with Node `vm`. Run
  after each edit; must be `0 failed`.
- **`node handoff/tools/audit_infer.js`** — the item 6/7 audit. Prints categories A (truly untaught),
  B (taught late), C (form-only). **Goal: A and B both 0** (exit 0). Re-run after each gate edit.
- **`node handoff/tools/corpus_length.js`** — the item 10 analyzer. Prints per-pool "correct is
  longest" % (chance ≈25%) and writes `length_report.md` (offenders + short defs) and
  `root_corpus.txt` (all roots + ETYM). **Goal: each pool ≤ ~33%.**

**Exact-match edit pattern (use for every `index.html` change):**
```python
import sys
PATH="index.html"
EDITS=[("desc", OLD, NEW, 1)]           # (label, exact old text, new text, expected count)
src=open(PATH,encoding="utf-8").read(); out=src; errs=[]
for d,o,n,c in EDITS:
    k=out.count(o)
    if k!=c: errs.append(f"[{d}] want {c} got {k}"); continue
    out=out.replace(o,n,c)
if errs: print("ABORT",errs); sys.exit(1)
open(PATH,"w",encoding="utf-8").write(out); print("applied",len(EDITS))
```

## 5. Tasks

### Data schemas (reference)
- **Gate** (in `GATES_A`…`GATES_E`, concatenated into `LEVELS`): `{id, title, theme, roots:[{root, lang, gloss}], words:[…]}`. Compound roots may be `"a + b"` (split by `splitRootEntry`) or `"a / b"`/`"a, b"` (variants, split by `rootForms`). `lv.quizRoots` is derived at load — don't hand-edit it.
- **Gate word** (REC): `{word, parts:[[surface,gloss],…], pron, def, sentence, distractors:[d1,d2,d3], kin:[…]}`. `def` is the correct MC answer.
- **Inference word** (`INFER_POOL`): `{word, parts:[[surface,gloss],…], req, def, distractors:[3], roots:"prose etymology"}`. `req` = LEVELS index of the gate that must be **sealed** before it can surface.
- **Drill word** (`DRILL_POOL` in `drill.js`): gate-word shape plus `{req, b, ety}`.
- **`ETYM`** (inline map): `{ "<root string>": "one-line etymology" }`. **`ROOT_DEEP`** (`rootdeep.js`): `{ "<root or split form>": "multi-sentence note" }`. **`DEPTH`** (`depth.js`): `{ "<word>": {v:"scene vignette", e:"etymology story"} }`.

---

### Task A — item 10: rebalance definitions & multiple-choice answers  *(biggest visible win)*

**Problem (measured):** the correct answer is the longest/tied option **79%** of gate items, 62%
inference, 67% drill (chance ≈25%). Distractors are systematically shorter/thinner than the correct
`def`, and PR#1 also thinned the definitions.

**Rule:** for every MC item make the four options sit in **one length band** and make distractors
**substantive near-misses**, while **restoring richer definitions**. Enrich thin distractors; trim
the few outlier-long correct answers; lengthen definitions PR#1 clipped. Never make the correct
answer reliably the longest or the shortest.

**Where:** gate words inside `GATES_A`…`GATES_E`; `INFER_POOL`; `DRILL_POOL` (`drill.js`). Edit the
`def` and `distractors` fields only (leave `parts`/`pron`/`sentence`/`kin` alone).

**Worked samples (before → after):**
- `biopsy` def "Examination of tissue from a living body." (keep); distractors "An examination after death." / "A written record of a life." / "The study of living things." → **"Examination of tissue taken after death." / "A written account of a person's life." / "The laboratory study of living tissue."** (all ~38–41; now true near-misses: autopsy/biography/biology).
- `congenital` def "Existing from birth." → **"Present from birth rather than acquired later."**; nudge distractors into the same band.
- `optician` def "One who grinds lenses and fills prescriptions." (46) → **"One who grinds and fits corrective lenses."** (42); raise distractors to ~40–42.
- `nonpareil` (drill) distractors "A very close second." / "An unproven newcomer." / "A jack of all trades." → **"A close and worthy second." / "A promising but unproven talent." / "A jack of all trades, master of none."**

**Method:** work in batches (one pool, then gate-by-gate). After each batch run
`node handoff/tools/corpus_length.js` and read `length_report.md` (top offenders + shortest defs).
**Acceptance:** every pool ≤ ~33% "correct longest"; no pool avg-def/avg-distractor gap > ~2 chars;
`check_syntax.js` clean. Commit per pool.

---

### Task B — items 6 & 7: inference root coverage

**Problem:** `inferPick` (grep `function inferPick`) only requires the word's `req` gate to be
sealed — it never checks that the word's **roots were actually taught**. `audit_infer.js` shows
**~33 words** whose root is taught by **no** gate (category A, the philharmonic/"harmony" class) and
**~16** whose root is taught only **later** than `req` (category B). Because the Lexicon and drill
roots list derive from gate roots, teaching a root in a gate also makes it appear there (**item 7**).

**Fix:**
1. **Category A** — for each truly-untaught root, add a root to an appropriate gate **at or before**
   the word's `req`: append `{root, lang, gloss}` to that gate's `roots` array, and add a matching
   `ETYM["<root>"]` line (quality like the existing corpus). Optionally add a `ROOT_DEEP` note.
2. **Category B** — bump the `req:` in the `INFER_POOL` entry to the latest gate that teaches its
   roots (from the audit's `taught@N`).
3. Re-run `node handoff/tools/audit_infer.js` until **A = 0 and B = 0** (exit 0).

**Seed roots for the common Category-A gaps** (root string · lang · gloss · ETYM · target gate ≤ req):
| root | lang | gloss | ETYM | gate |
|---|---|---|---|---|
| oculus | Latin | eye | Latin 'eye'; ocular, oculist, binocular. | ≤1 |
| harmonia | Greek | harmony | Greek 'joining, concord'; harmony, harmonic, philharmonic. | ≤3 |
| philos / philein | Greek | loving, to love | Greek 'dear; to love'; philosophy, bibliophile, philanthropy. | ≤3 |
| sophia / sophos | Greek | wisdom, wise | Greek 'wisdom; wise'; philosophy, sophist, sophomore. | ≤3 |
| gyne | Greek | woman | Greek 'woman'; gynecology, misogyny, philogyny. | ≤3 |
| fides | Latin | faith, trust | Latin 'faith, trust'; fidelity, confide, perfidy, infidel. | ≤5 |
| centrum / kentron | Latin/Greek | center | Latin/Greek 'center, sharp point'; center, eccentric, concentric. | ≤5 |
| omnis | Latin | all | Latin 'all'; omnipotent, omniscient, omnivore. | ≤6 |
| vorare | Latin | to devour | Latin 'to swallow'; carnivore, voracious, devour. | ≤6 |
| caro, carnis | Latin | flesh | Latin 'flesh'; carnal, carnivore, incarnate. | ≤6 |
| ambulare | Latin | to walk | Latin 'to walk'; amble, ambulance, somnambulist. | ≤6 |
| phobos | Greek | fear | Greek 'fear, panic'; phobia, xenophobia, necrophobia. | ≤9 |
| aristos | Greek | best | Greek 'best'; aristocracy, aristocrat. | ≤10 |
| pan, pantos | Greek | all | Greek 'all'; panorama, pandemic, panacea. | ≤10 |
| kosmos | Greek | world, order | Greek 'order, world'; cosmos, cosmopolitan, microcosm. | ≤16 |
| taphos | Greek | tomb | Greek 'tomb'; epitaph, cenotaph. | ≤19 |

Run the audit for the **complete** list and apply the same pattern to the remainder (e.g. `venter`
belly, `tiro` recruit, `titillare` to tickle, `caelebs` unmarried, `sinister` left, `ateleia` tax
exemption). Category **C** (form-only, ~29) is acceptable — leave it.

**Optional defense-in-depth:** add an `inferReady(f)` check inside `inferPick` that withholds a word
until every substantive part-root is covered by a **sealed** gate (reuse `sealedRoots`, `normRoot`,
`rootForms`; skip affixes). Once the data above is fixed this is belt-and-suspenders — implement only
if you want a guarantee that no future data gap can surface an unbuildable word.

**Finding to preserve:** the gate at LEVELS index X is the (X+1)-th gate object in source order across
`GATES_A`→`GATES_E`; locate it by its `title`/`id` and append to its `roots`.

---

### Task C — item 4 (optional): etymology gloss tweaks

The 212 gate roots were audited and are accurate — **no substantive errors.** Apply these small
gloss refinements only if the human wants them: `ana-` "back, against" → "up, back, again";
`chronos` "the god Chronos" → soften to "personified as Time"; `ego` "self, I" → note "I" is literal;
`asketes` "monk, hermit" → literally "one who trains"; align `male` (adverb "badly") vs `malus`
(adjective "bad"). Each is a one-line `str.replace` in `ETYM`/gloss.

---

### Task D — items 2 & 3: fix "grows into" + add cognates

**Problem:** the "Grows into" list is **computed live** by `rootFamily(r, lim)` (grep) via loose
form-prefix + gloss-substring matching against every word's `parts`, so it lists etymologically
**unrelated** words. Rendered by `rootDeepHtml` (drill "Learn more") and `rootView` (Lexicon root
detail) — grep both.

**Fix (authored data):**
1. Add an authored map near the data block:
   `const COGNATES = { "<gate root string>": ["derived1","derived2", …], … }` keyed by the exact
   `root` string (e.g. `"graphein"`, `"verto / versus"`). Values are English words that **genuinely
   descend** from that root — prefer words that exist in the app (so `defOfWord` can annotate them).
2. Rewrite `rootFamily` so that when `COGNATES` has an entry for `r.root` (or any `rootForms(r)`) it
   returns **only** those (mapped to `{word, def}` via `defOfWord`); otherwise fall back to the
   existing heuristic **with gloss-substring matching removed** (keep only genuine shared-form
   matches) to cut false positives. Keep the return shape/limit so `rootDeepHtml`/`rootView` are
   unchanged.
3. **Cognates surface (item 3):** the same data powers an accurate "Grows into / cognates" block.
   At minimum this makes the existing block correct; if you want a distinct display, add a "Cognates"
   line in `rootView` listing cross-language relatives (authored). Reuse the `fb-line`/`root-hint`
   classes for styling.

**Acceptance:** for a sample of roots (e.g. `graphein`, `bios`, `logos`, `vertere`, `phone`), every
word shown under "Grows into" genuinely contains that root; no unrelated words appear. `check_syntax`
clean.

---

### Task E — item 11: add "similars" to root challenges

**Problem:** there is no concept of confusable/look-alike roots; the root-foil logic (grep `rootOpts`
and the ROOTS/ROOTT branches in `renderTrialPrompt`) actively **avoids** similar glosses — the
opposite of what teaches the distinction.

**Fix (authored data + reveal):**
1. Add `const SIMILARS = { "<root string>": ["<other root string>", …], … }` grouping easily-confused
   roots, e.g. `similis`↔`simulare`, `vir`↔`vivere`, `verus`↔`vertere/versus`, `mori/mort-`↔`mos`,
   `pater`↔`patria`. Make it symmetric (list both directions) or add a helper that looks both ways.
2. **Surface it in root challenges:** on the reveal in `rootDrillItem` (and the ROOTS/ROOTT feedback
   in `renderTrialPrompt`), if the current root has similars, append a
   `Don't confuse with — <root> (<gloss>)` line (reuse `rootEtymNote`/`fb-line`).
3. **Optional (stronger):** deliberately include a similar root's gloss as one distractor in the
   root challenge so the quiz itself tests the distinction (opt-in; keep at most one similar foil so
   the item stays fair).

**Acceptance:** drilling a root that has similars shows the contrast note; if you add the foil,
confirm the correct answer is still unambiguous. `check_syntax` clean.

---

## 6. Definition of done

- [ ] Item 10: `corpus_length.js` ≤ ~33% per pool; definitions read fuller; distractors are real near-misses.
- [ ] Items 6 & 7: `audit_infer.js` reports A = 0, B = 0; new roots visible in the Lexicon/roots list.
- [ ] Item 2 & 3: "Grows into" shows only true derivatives; a cognates surface exists.
- [ ] Item 11: similars appear on root challenges.
- [ ] (opt) Item 4 gloss tweaks applied.
- [ ] `node handoff/tools/check_syntax.js` → 0 failed after every change; Cloudflare preview green.
- [ ] Commits are per-task with clear messages; PR #14 updated.

## 7. Handy anchors (grep these; names are stable, line numbers are not)
`GATES_A` · `const INFER_POOL` · `const ETYM` · `function inferPick` · `function renderTrialPrompt`
· `function trialItem` · `function rootDrillItem` · `function rootFamily` · `function rootDeepHtml`
· `function rootView` · `function rootLexicon` · `function sealedRoots` · `function buildFocusPool`
· `function rootOpts` · `function normRoot` · `function rootForms` · `function splitRootEntry`
· helpers already added: `function itemKey` · `avoidRepeat` · `requeueMiss` · `rootEtymNote` · `inferDeep`
