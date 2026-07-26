# Native shell

`ios/Rootstock.xcodeproj` is the supported iPhone wrapper (iOS 16+). Its build phase refuses to run
without `dist/index.html`, deletes any previous bundled web directory, and copies the complete
`dist/` artifact to `Rootstock.app/web/`. `RootstockWebView` loads
`web/index.html` with read access limited to that directory.

Build and test:

```sh
npm ci
npm run build
xcodebuild -project ios/Rootstock.xcodeproj -scheme Rootstock \
  -sdk iphonesimulator -configuration Release \
  -derivedDataPath /tmp/rootstock-derived CODE_SIGNING_ALLOWED=NO build
npm run test:native
```

The shared scheme uses `ios/Rootstock.storekit` for local monthly and annual purchase testing.
`RootstockTests` exercises price loading, annual purchase, entitlement publication, and expiration;
`RootstockUITests` restarts the bundled WKWebView with all network traffic blocked. On Apple
runtimes where a valid StoreKit configuration unexpectedly returns no products, the StoreKit test
is skipped only on iOS 26; it remains a failure on earlier runtimes and automatically resumes the
full assertions when products load. Production signing requires the publisher’s Apple Developer
team; do not commit personal signing settings.

## JavaScript-to-native requests

The page posts an object to `window.webkit.messageHandlers.rootstock`:

| Action | Additional fields | Native behavior |
| --- | --- | --- |
| `status` | none | Refresh products and current entitlements |
| `purchase` | `plan`, `productId` | Purchase the requested StoreKit 2 product |
| `restore` | none | Run `AppStore.sync()` and refresh |
| `manage` | none | Open Apple’s subscription-management sheet |
| `openURL` | `url` | Show bundled legal HTML locally or an approved remote URL in Safari |

Product IDs are fixed:

- `com.rootstock.full.monthly`
- `com.rootstock.full.annual`

## Native-to-JavaScript entitlement

Native code calls the only intentional app global:

```js
window.RS_setEntitlement({
  active: true,
  plan: "annual",
  trial: false,
  expiresAt: 1780000000000,
  priceMonthly: "$4.99",
  priceAnnual: "$39.99"
});
```

`active` is required. The callback also accepts a JSON string for compatibility. StoreKit is the
sole entitlement authority whenever the WK bridge exists; `?dev=1` applies only to browser
previews.

## Compatibility contracts

Do not rename `rootstock_v2`, `rootstock_v2_bak`, or `rootstock_theme_v1`, change the v2 backup
format, or alter the request shapes without migration coverage. Supported preview parameters are
`theme`, `etym`, `burnt`, and `dev`. A host can change the visible theme with:

```js
window.postMessage({ rsTheme: "plain" }, "*");
```

## Offline acceptance

The XCUITest restarts the real WKWebView with a test-only WebKit content rule blocking every
HTTP/HTTPS URL, then asserts the bundled onboarding UI. Apple’s current Simulator does not expose
Airplane Mode in Settings or Control Gallery, so the release checklist also requires one manual
Airplane Mode relaunch on a physical iPhone. The blocker is enabled only by the
`ROOTSTOCK_DISABLE_NETWORK=1` UI-test launch environment.
