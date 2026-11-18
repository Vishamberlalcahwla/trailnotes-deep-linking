# TrailNotes: React Native Deep Linking Example

Companion code for the article **[React Native Deep Linking: A Practical Guide With Real Examples (2026)](docs/article.md)**.

TrailNotes is a small hiking journal that shows production-style deep linking in two versions:

| Folder | Stack | Linking setup |
|---|---|---|
| [`bare-react-navigation/`](bare-react-navigation) | React Native 0.88 (bare) + React Navigation 7 | Typed `linking` config, native `Info.plist` / `AndroidManifest.xml` |
| [`expo-router-app/`](expo-router-app) | Expo SDK 58 + Expo Router | File-based routes, `app.json` config |

Both apps handle the same links:

| Link | Opens |
|---|---|
| `trailnotes://trail/42` | Trail screen for trail `42` |
| `trailnotes://trail/cedar-falls?ref=newsletter` | Trail screen, with a validated `ref` param |
| `trailnotes://settings` | Settings |
| `trailnotes://trail/%3Cscript%3E` | Not found (invalid ID is rejected) |
| `https://trailnotes.app/trail/42` | Same as above, once you set up your own domain |

They cover cold starts (app killed), warm starts (app in background), route validation, and a not-found fallback.

## Requirements

- Node.js 22.11 or newer
- **iOS:** macOS with Xcode and CocoaPods (`bundle install` handles CocoaPods for the bare app)
- **Android:** Android Studio with an emulator, or a device with USB debugging on

## Run the bare React Native app

```bash
cd bare-react-navigation
npm install

# iOS
bundle install
cd ios && bundle exec pod install && cd ..
npm run ios

# Android
npm run android
```

Then, with the app running (or force-quit, to test a cold start):

```bash
# From the repo root
./scripts/test-links-ios.sh
./scripts/test-links-android.sh app.trailnotes
```

Run the linking unit tests with `npm test`.

**Where the deep linking code lives:**

- [`src/navigation/linking.ts`](bare-react-navigation/src/navigation/linking.ts): prefixes, route map, ID validation, `getInitialURL`, `subscribe` with cleanup
- [`ios/TrailNotes/Info.plist`](bare-react-navigation/ios/TrailNotes/Info.plist): `trailnotes` URL scheme
- [`ios/TrailNotes/SceneDelegate.swift`](bare-react-navigation/ios/TrailNotes/SceneDelegate.swift): forwards URLs to React Native (included in the RN 0.88 template)
- [`android/app/src/main/AndroidManifest.xml`](bare-react-navigation/android/app/src/main/AndroidManifest.xml): custom scheme and App Links intent filters
- [`__tests__/linking.test.ts`](bare-react-navigation/__tests__/linking.test.ts): URL-to-screen tests

## Run the Expo Router app

Use a development build, not Expo Go. Expo Go uses its own `exp://` scheme, so `trailnotes://` links won't reach it.

```bash
cd expo-router-app
npm install
npx expo run:ios       # or: npx expo run:android
```

Then open links the same way:

```bash
npx uri-scheme open "trailnotes://trail/42" --ios
./scripts/test-links-android.sh app.trailnotes.expo   # from the repo root
```

**Where the deep linking code lives:**

- [`app.json`](expo-router-app/app.json): `scheme`, iOS `associatedDomains`, Android `intentFilters`
- [`app/trail/[id].tsx`](expo-router-app/app/trail/[id].tsx): the trail route, with ID validation
- [`app/+not-found.tsx`](expo-router-app/app/+not-found.tsx): fallback for unknown links

## Set up https links (Universal Links / App Links)

The custom `trailnotes://` scheme works as soon as you build. https links need a domain you control:

1. Replace `trailnotes.app` with your domain in `linking.ts`, `AndroidManifest.xml`, and `app.json`.
2. Edit the files in [`well-known/`](well-known): put your Apple Team ID in `apple-app-site-association` and your **release signing key's** SHA-256 fingerprint in `assetlinks.json`. If you use Play App Signing, copy the fingerprint from the Play Console, not your upload key.
3. Serve both at `https://<your-domain>/.well-known/`, over HTTPS, with no redirects. Serve `apple-app-site-association` with no file extension and `Content-Type: application/json`.
4. **iOS, bare app:** in Xcode, open **Signing & Capabilities → + Capability → Associated Domains** and add `applinks:<your-domain>`. **Expo app:** the entitlement comes from `app.json`. Either way, Associated Domains needs a paid Apple Developer account.

If you build the Expo app for a real iPhone with a free Apple account, remove `associatedDomains` from `app.json` first, or signing will fail.

## Bundle IDs used

| App | iOS bundle ID / Android package |
|---|---|
| Bare | `app.trailnotes` |
| Expo | `app.trailnotes.expo` |

Change these to your own IDs before you publish anything.

## License

No license file yet. Add one (for example, MIT) if you want others to reuse this code.
