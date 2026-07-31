# Rootstock

Rootstock is an offline-first vocabulary trainer built as strict TypeScript, plain CSS, and a thin
SwiftUI/WKWebView shell. There is one supported web artifact: `dist/`. Cloudflare Pages publishes
it, and the iOS target bundles the same bytes.

## Develop

Prerequisites: Node 24 LTS and npm.

```sh
npm ci
npm run dev
```

The local app is served at `http://127.0.0.1:4173`. Edit `src/`, `public/`, or `legal/`; never
edit `dist/`.

## Verify

```sh
npm run check
npm run test:e2e
```

`npm run check` enforces repository hygiene, strict typing, content and engine tests, reproducible
audio seed files, and a production build. Playwright covers the complete gate loop, progress
resume, review, backup/restore, lexicons, Drill Hall, entitlement/native messages, preview
parameters, themes, service-worker offline restart, and bundled-file startup.
Shared screenshot baselines and horizontal-overflow assertions cover 320px, 390px, and 430px
mobile widths.

On macOS with Xcode installed:

```sh
npm run test:native
```

That builds `dist/`, bundles it into the iOS app, and verifies a WKWebView restart with every
HTTP/HTTPS request blocked. See [NATIVE.md](NATIVE.md) for the bridge contract and
[RELEASE.md](RELEASE.md) for release steps.

## Content and generated files

The runtime corpus lives only in `src/content/`. `words.json` and `roots.json` are generated
pronunciation seed lists:

```sh
npm run generate:seeds
```

Individual recordings and their typed manifest live in `public/audio/` and
`src/content/audio-manifest.ts`. No base64 audio bundle or runtime data sidecar is maintained.

### Authoring the word prose

Every headword carries a paragraph on how it came to mean what it means today, and about a
hundred and twenty also carry the sense they used to have. Where the evidence for a
derivation is unsettled, the entry says so rather than repeating the tidier story — much
popular etymology is confident invention, and an accurate hedge is worth more here than a
memorable one. The same rule bars inventing an earlier sense for a word that never shifted.

`npm run check` cannot enforce this. The content tests check shape — length, sentence count,
coverage, and that a former sense never names the word it is asking for — so a confidently
wrong entry passes them all. See the header of `src/content/depth.ts` before editing.
