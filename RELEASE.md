# Release

Rootstock has one release input and one release output:

```text
src/ + public/ + legal/  →  npm run build  →  dist/
```

Never publish source files directly and never hand-edit `dist/`.

## Web release

1. From a clean checkout of the release commit, run:

   ```sh
   npm ci
   npm run check
   npm run test:e2e
   ```

2. Deploy and test a preview:

   ```sh
   npx wrangler pages deploy dist --project-name rootstock --branch preview
   PLAYWRIGHT_BASE_URL=https://preview.rootstock1.pages.dev npm run test:e2e
   ```

   Use the deployment URL Wrangler returns when it differs from the stable branch URL.

3. Publish the verified bytes:

   ```sh
   npx wrangler pages deploy dist --project-name rootstock --branch main
   ```

4. Verify `/`, `/legal/privacy.html`, `/legal/terms.html`, and `/legal/support.html`, then restart
   the installed PWA offline.

The production Pages origin is `https://rootstock1.pages.dev`.

## iOS release

1. Run `npm run test:native`.
2. In Xcode, select the publisher’s Apple Developer team without changing the bundle ID
   `com.rootstock.app`.
3. Confirm the archived app contains the exact current `dist/` tree under `web/`.
4. With a Sandbox Apple ID, verify monthly and annual purchase, restore, manage-subscription,
   localized prices, expiry/revocation, and trial state.
5. On a physical iPhone, enable Airplane Mode, force-quit Rootstock, relaunch it, complete a
   learning interaction, play a pronunciation, and confirm saved progress after a second launch.
6. Archive, validate, and upload the Release build. Submit the first app version and both
   subscriptions together.

The web app icon lives in `public/icons/`; the iOS app icon lives in
`ios/Rootstock/Assets.xcassets/`. Current 6.9-inch store images live in `store/screenshots/`.
Re-capture them from the release build if UI pixels change.

## App Store Connect

- Name: **Rootstock**
- Subtitle: **Vocabulary by its roots**
- Primary / secondary category: **Education / Reference**
- Primary language: **English (U.S.)**
- Age rating: **4+**, subject to the current questionnaire
- Subscription group: **Rootstock Full**
- Monthly product: `com.rootstock.full.monthly`, USD 4.99 reference price
- Annual product: `com.rootstock.full.annual`, USD 39.99 reference price
- Introductory offer: 3 days free on each product
- Privacy: **Data Not Collected** only while the app remains account-free and contains no
  analytics, ads, tracking, cloud sync, or third-party telemetry
- Privacy URL: `https://rootstock1.pages.dev/legal/privacy.html`
- Terms URL: `https://rootstock1.pages.dev/legal/terms.html`
- Support URL: `https://rootstock1.pages.dev/legal/support.html`

Before submission, confirm the selling entity, tax/banking agreements, prices, legal pages,
trademark availability, support contact, privacy answers, screenshots, and review notes in App
Store Connect. The checked-in legal text is release content and must not contain placeholders.
