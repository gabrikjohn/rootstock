# Rootstock architecture

Rootstock remains an offline, framework-free web application. The maintained source is under
`src/`; `dist/` is generated and must never be edited by hand.

## Boundaries

- `src/content/` is the typed runtime corpus. Gate content is split one gate per file, while
  inference, drill, etymology, depth, cognates, similars, IPA, and audio metadata have dedicated
  modules.
- `src/domain/` contains deterministic learning rules. Time, random numbers, and storage enter
  through interfaces in `src/platform/`. The Review Docket is released once a day, at
  `DOCKET_RELEASE_HOUR` on the device's own clock: every due date is rounded to a release, each
  release serves `DOCKET_DAILY_SIZE` words (a thin day borrowing its shortfall from the words due
  within `DOCKET_LOOKAHEAD_MS`), and the release whose sitting has been worked is recorded so the
  docket cannot open twice in a day.
- `src/ui/` owns rendering and application coordination. `AppController` injects platform
  dependencies into the runtime; each screen family has a dedicated typed feature module.
- `public/` contains offline assets. Pronunciations are individual MP3 files and are never embedded
  in JavaScript.
- `ios/` is the StoreKit 2/WKWebView shell. Its build phase consumes only the generated `dist/`
  directory and bundles those exact files under `web/`.

The only app-owned global is `window.RS_setEntitlement`. Host-provided `window.webkit` and
`window.RootstockNative` bridge endpoints remain compatibility inputs; content and engine data are
never published as globals. The StoreKit request messages and the `rootstock_v2`,
`rootstock_v2_bak`, and `rootstock_theme_v1` storage contracts remain unchanged; `rootstock_v2`
gained one optional field, `docketDay`, which older saves simply lack.

## Development and releases

- `npm run dev` builds and serves the generated app at `http://127.0.0.1:4173`.
- `npm run check` runs strict type checking, content and engine tests, seed drift checks, and a
  production build.
- `npm run test:e2e` exercises onboarding, saved progress, themes, the native bridge, service-worker
  offline startup, and the bundled `file:` launch path, with shared visual baselines at 320px,
  390px, and 430px.
- `npm run generate:seeds` derives `words.json` and `roots.json` from typed content.

Cloudflare Pages uses `npm run build` and publishes `dist/`. The checked-in `wrangler.jsonc` records
that output directory. `ios/Rootstock.xcodeproj` likewise bundles the contents of `dist/` as its
`web/` folder and loads `web/index.html` with read access to that folder.
