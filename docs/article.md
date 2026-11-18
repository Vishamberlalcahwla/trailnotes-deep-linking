TITLE
React Native Deep Linking: A Practical Guide With Real Examples (2026)

SUBTITLE
Make every email, campaign, and OAuth link land on the right screen. A working React Native deep linking setup for React Navigation and Expo Router, with the silent failures called out.

META_DESCRIPTION (154 characters)
Learn React Native deep linking with React Navigation and Expo Router: custom URL schemes, Universal Links, App Links, real code, testing tips, and fixes.

TAGS
React Native · Deep Linking · Mobile Development · iOS Development · Android Development

---

# React Native Deep Linking: A Practical Guide With Real Examples (2026)

*Make every email, campaign, and OAuth link land on the right screen, with the silent failures called out.*

Marketing sends a link to 40,000 people. It says, "See this week's featured trail." Half the people who tap it end up on the App Store page for an app they already have. The other half land on the home screen and then go looking for the trail.

No crash, no error in your logs. The link just didn't work.

This guide covers **React Native deep linking** from start to finish: custom URL schemes, iOS Universal Links, Android App Links, the React Navigation `linking` config, and the shorter Expo Router setup. The example app throughout is **TrailNotes**, a hiking journal with two deep-linkable routes: `/trail/:id` and `/settings`.

> *As of 2026, tested with React Native 0.88 / Expo SDK 58.*

## What is deep linking in React Native?

A deep link is a URL that opens your app on a specific screen instead of its home screen. In React Native, the operating system passes that URL to your JavaScript, and your navigation library turns the path, like `/trail/42`, into a screen with parameters. Your job is to register the URLs with the OS and map paths to screens.

> **Quick answer**
> - **On Expo with Expo Router?** Set `scheme` in `app.json`, put screens in `app/trail/[id].tsx`, and routing works without extra code. Add `associatedDomains` and Android `intentFilters` for https links.
> - **On bare React Native or Expo with React Navigation?** Pass a typed `linking` object to `NavigationContainer` and register the scheme in `Info.plist` and `AndroidManifest.xml`.
> - **Is the link going in email, SMS, or ads?** Use https Universal Links / App Links, not a custom scheme.

## How does a deep link travel from a tap to a screen?

Every URL has four parts you care about. In `https://trailnotes.app/trail/42?ref=newsletter`:

- **Scheme:** `https` (or a custom one, like `trailnotes`)
- **Host:** `trailnotes.app`
- **Path:** `/trail/42`
- **Query:** `ref=newsletter`

Here's the journey of that link:

```
 [User taps link in Mail / SMS / browser]
                 |
                 v
 [OS checks: does an installed app claim this URL?]
        |                         |
   yes (verified)            no / unverified
        |                         |
        v                         v
 [App launches or resumes]   [Opens in browser / store]
        |
        v
 [Native layer hands URL to JS: Linking]
        |
        v
 [React Navigation parses path -> TrailScreen { id: "42" }]
```

*Alt text: A flowchart. A tapped link goes to the operating system, which either opens the app (if the app verifiably claims the URL) or falls back to the browser. Inside the app, the native layer passes the URL to JavaScript, and React Navigation maps the path to the Trail screen with id 42.*

How the URL reaches JavaScript depends on the app's state:

- **Cold start:** The app wasn't running. The URL is waiting for you via `Linking.getInitialURL()`.
- **Warm start:** The app was in the background. The URL arrives as a `url` event, which you receive with `Linking.addEventListener`.

Handle only one and half your links break. It's the most common deep linking bug.

**Deferred deep linking** covers users who don't have the app yet: they tap the link, install the app, and then land on the trail on first launch. The OS doesn't do this; you need an attribution provider or your own server-side matching. Firebase Dynamic Links shut down in 2025, so be wary of old tutorials recommending it.

**Takeaway: Handle cold start and warm start, or your deep links will only work sometimes.**

## Custom URL scheme vs. Universal Links vs. App Links

React Native supports two kinds of links. Here's how they compare:

| | Custom URL scheme (`trailnotes://`) | iOS Universal Links / Android App Links (`https://`) |
|---|---|---|
| Setup effort | Low: one config entry per platform | Medium: native config + a JSON file on your domain |
| Needs a website | No | Yes, served over HTTPS |
| If the app isn't installed | Error or nothing happens | Opens your website (a good fallback) |
| Can another app claim it? | Yes. Any app can register the same scheme | No. Domain ownership is verified |
| Works in email/SMS/social | Unreliable; many clients won't link it | Yes |
| Good for | Dev testing, OAuth redirects, app-to-app | Marketing, email, password reset, sharing |

Universal Links (Apple) and App Links (Android) do the same job: https URLs that open your app because you've proven you own the domain.

**Takeaway: Use a custom scheme for development and internal redirects. Use https links for anything a human will tap.**

## How to set up deep linking in React Native (React Navigation + bare workflow)

These steps assume React Navigation 7 and a bare TypeScript project.

### Step 1: Define typed routes

A typed param list lets TypeScript catch config and screen mismatches before users do.

```ts
// navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  Trail: { id: string; ref?: string };
  Settings: undefined;
  NotFound: undefined;
};
```

### Step 2: Write the linking config

`prefixes` lists every URL root your app owns; `config.screens` maps path patterns to screens.

```ts
// navigation/linking.ts
import { Linking } from 'react-native';
import {
  LinkingOptions,
  getStateFromPath as defaultGetStateFromPath,
} from '@react-navigation/native';
import type { RootStackParamList } from './types';

const TRAIL_ID = /^[a-z0-9-]{1,64}$/i;

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['trailnotes://', 'https://trailnotes.app'],

  config: {
    screens: {
      Home: '',
      Trail: {
        path: 'trail/:id',
        parse: { id: (id: string) => decodeURIComponent(id) },
      },
      Settings: 'settings',
      NotFound: '*',
    },
  },

  // Reject anything that doesn't look like a real trail ID.
  getStateFromPath(path, options) {
    const match = path.match(/^\/?trail\/([^/?#]+)/);
    if (match && !TRAIL_ID.test(decodeURIComponent(match[1]))) {
      return defaultGetStateFromPath('not-found', options);
    }
    return defaultGetStateFromPath(path, options);
  },

  // Cold start: the URL that launched the app.
  async getInitialURL() {
    return Linking.getInitialURL();
  },

  // Warm start: URLs that arrive while the app is running.
  subscribe(listener) {
    const sub = Linking.addEventListener('url', ({ url }) => listener(url));
    return () => sub.remove(); // cleanup on unmount
  },
};
```

React Navigation has default `getInitialURL` and `subscribe` functions, but writing them out gives you one place to add other sources later, like push notification taps, and makes the cleanup visible.

### Step 3: Pass it to NavigationContainer

The `fallback` shows while React Navigation resolves the initial URL. Without it, users can briefly see a blank screen on a cold start.

```tsx
// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { linking } from './navigation/linking';
import { RootStack } from './navigation/RootStack';

export default function App() {
  return (
    <NavigationContainer linking={linking} fallback={<ActivityIndicator />}>
      <RootStack />
    </NavigationContainer>
  );
}
```

### Step 4: Register the scheme and domain on iOS

iOS needs three things: the custom scheme, the Associated Domains entitlement, and native code that forwards URLs to React Native.

Add the scheme to `ios/TrailNotes/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>trailnotes</string>
    </array>
  </dict>
</array>
```

In Xcode, go to **Signing & Capabilities → + Capability → Associated Domains**, and add `applinks:trailnotes.app`. This needs a paid Apple Developer account; the custom scheme works without one.

Then check the forwarding code. New React Native 0.88 projects use a `SceneDelegate`, and the template already includes these two methods:

```swift
// SceneDelegate.swift (React Native 0.88 template)
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
  RCTLinkingManager.scene(scene, openURLContexts: URLContexts)
}

func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
  RCTLinkingManager.scene(scene, continue: userActivity)
}
```

The first handles custom schemes; the second handles Universal Links. On a cold start, the template passes `connectionOptions` to `startReactNative`, which is how the launch URL reaches `getInitialURL()`. Older apps without scenes need the `application(_:open:options:)` and `application(_:continue:restorationHandler:)` equivalents in `AppDelegate`; check the [React Native Linking docs](https://reactnative.dev/docs/linking). If the `continue` method is missing, https links open your app to nowhere.

### Step 5: Publish the apple-app-site-association file

Apple verifies that you own `trailnotes.app` by fetching a JSON file from it. Serve it at `https://trailnotes.app/.well-known/apple-app-site-association`, with no file extension, `Content-Type: application/json`, and no redirects.

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["ABCDE12345.app.trailnotes"],
        "components": [
          { "/": "/trail/*" },
          { "/": "/settings" }
        ]
      }
    ]
  }
}
```

`ABCDE12345` is your Apple Team ID and `app.trailnotes` your bundle ID. Listing only the paths you handle keeps `/blog` in the browser. Apple's CDN caches this file, so changes take time to reach devices. Check current behavior in [Apple's Associated Domains docs](https://developer.apple.com/documentation/xcode/supporting-associated-domains).

### Step 6: Register intent filters on Android

Android uses intent filters in `AndroidManifest.xml`. Keep the scheme and the https filter separate, because `autoVerify` should only apply to the https one.

```xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask"
  android:exported="true">

  <!-- Custom scheme: trailnotes://trail/42 -->
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="trailnotes" />
  </intent-filter>

  <!-- App Links: https://trailnotes.app/trail/42 -->
  <intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="trailnotes.app" />
  </intent-filter>
</activity>
```

`singleTask` (the React Native template default) makes a warm-start link reuse your running app instead of stacking a second copy on top.

To verify the domain, publish a Digital Asset Links file at `https://trailnotes.app/.well-known/assetlinks.json`. It holds your package name and the SHA-256 fingerprint of your **signing** certificate. If you use Play App Signing, that's Google's key, not your upload key. Without this file, Android shows a "choose an app" dialog or just opens the browser. See [Android's App Links verification guide](https://developer.android.com/training/app-links/verify-android-applinks) for the file format.

**Takeaway: The JavaScript config is 20 lines. Most of the work, and most of the bugs, are in native config and the files on your domain.**

## The Expo path: Expo Router and expo-linking

With Expo Router, your file tree *is* your linking config.

A TrailNotes app with Expo Router looks like this:

```
app/
  _layout.tsx
  index.tsx            -> trailnotes://
  settings.tsx         -> trailnotes://settings
  trail/[id].tsx       -> trailnotes://trail/42
  +not-found.tsx       -> anything else
```

Native config goes in `app.json`. Expo's config plugins write it into `Info.plist` and `AndroidManifest.xml` for you during prebuild.

```json
{
  "expo": {
    "scheme": "trailnotes",
    "ios": {
      "bundleIdentifier": "app.trailnotes",
      "associatedDomains": ["applinks:trailnotes.app"]
    },
    "android": {
      "package": "app.trailnotes",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [{ "scheme": "https", "host": "trailnotes.app", "pathPrefix": "/trail" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

You still need to host both `.well-known` files yourself. Expo can't verify a domain for you.

In the screen, validate the param exactly like you would in the bare setup:

```tsx
// app/trail/[id].tsx
import { useLocalSearchParams, Redirect } from 'expo-router';

export default function TrailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id || !/^[a-z0-9-]{1,64}$/i.test(id)) return <Redirect href="/+not-found" />;
  return <TrailDetail id={id} />;
}
```

Use `expo-linking` to *build* URLs, such as an OAuth `redirect_uri`: `Linking.createURL('trail/42')` returns the right prefix for each environment. Expo Go uses `exp://`, not your scheme, so test deep links in a development build. Details are in [Expo's linking guide](https://docs.expo.dev/linking/overview/).

Using Expo with React Navigation instead? Follow the React Navigation section and keep native config in `app.json`.

**Takeaway: With Expo Router, routing is automatic. Domain verification and input validation are still your job.**

## How do you test React Native deep links?

Start from the command line. It's faster than emailing yourself and removes the email client as a variable.

**iOS Simulator:**

```bash
xcrun simctl openurl booted "trailnotes://trail/42"
xcrun simctl openurl booted "https://trailnotes.app/trail/42"
```

**Android emulator or device:**

```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "trailnotes://trail/42" app.trailnotes

# Check App Links verification status (Android 12+)
adb shell pm get-app-links app.trailnotes
```

**Either platform, using the uri-scheme helper:**

```bash
npx uri-scheme open "trailnotes://trail/42" --ios
npx uri-scheme open "trailnotes://trail/42" --android
```

Before you ship, check:

1. Simulator and emulator, custom scheme, app in background.
2. The same, with the app **force-quit**.
3. Physical iPhone and Android device, https link, tapped from Notes or Messages.
4. Tapped from a real email in Gmail and Apple Mail, including links rewritten by your email provider's click tracking.
5. Tapped from SMS.
6. App not installed: does the https link fall back to a useful web page?
7. A bad ID (`/trail/%3Cscript%3E`): does it land on NotFound?
8. A release build, not just debug.

> **"If you've only tested deep links with the app already running, you've only tested half of them. Force-quit the app, tap the link, and watch what actually opens."**

**Takeaway: Test the killed state on a real device, from the real channel, in a release build.**

## Troubleshooting: why isn't my deep link working?

- **The link opens the app's home screen, not the trail.** *Cause:* A path mismatch, often a stray leading slash or a missing prefix. *Fix:* Log the raw URL in `getInitialURL`, and check that the path matches `trail/:id` exactly after the prefix is removed.
- **It works while the app is running but not after a force-quit.** *Cause:* Something (often a splash screen or auth gate) navigates before React Navigation has used the initial URL, or a custom `getInitialURL` returns too early. *Fix:* Let `NavigationContainer` own the initial URL, and keep auth redirects from replacing the linked screen.
- **https links open Safari instead of the app.** *Cause:* The AASA file is missing, redirected, served with the wrong content type, or cached by Apple's CDN; or the user typed the URL into the address bar, which never opens the app. *Fix:* Fetch the file with `curl -I`, remove any redirects, and test by tapping a link in Notes or Messages.
- **The Universal Link opens the app, but nothing happens.** *Cause:* The `continue userActivity` forwarding method is missing from `SceneDelegate` (or `AppDelegate` in older apps). *Fix:* Add the `RCTLinkingManager` method from Step 4.
- **Android shows an app chooser for https links.** *Cause:* App Links verification failed, usually because `assetlinks.json` has the upload key fingerprint instead of the Play App Signing key. *Fix:* Copy the SHA-256 from the Play Console's app signing page, then re-verify with `adb shell pm verify-app-links --re-verify app.trailnotes`.
- **The link works in testing but not from the email campaign.** *Cause:* Click tracking wraps your URL in a redirect through another domain, which your app doesn't claim. *Fix:* Configure click tracking with a branded domain you can verify, or turn off tracking for those links.

## Security: treat every deep link as untrusted input

Anyone can craft a link to your app. Treat incoming URLs like form input from a stranger.

- **Validate paths and params.** Allowlist routes and check IDs against a strict pattern before calling an API.
- **Never put secrets in URLs.** URLs end up in history, analytics, and logs. For password resets or magic links, use short-lived, single-use tokens.
- **Sanitize query params.** Don't render `ref` or `message` params as HTML, use them in a WebView URL, or turn them into a redirect target without checking them against an allowlist.
- **Don't trust custom schemes for auth.** Another app can register `trailnotes://`. For OAuth, use https redirects or the PKCE (Proof Key for Code Exchange) flow so an intercepted code is useless on its own.
- **Require confirmation for actions that change data.** A link to `trailnotes://settings?delete=true` should, at most, open Settings, not delete anything.

**Takeaway: A deep link is a public entry point to your app. Validate it like an API endpoint.**

## Setup checklist: a minimal working deep link

1. Choose a custom scheme (`trailnotes`) and, for production, an https domain you control.
2. Define a typed param list and a React Navigation `linking` config with `prefixes` and `config.screens`.
3. Pass `linking` and a `fallback` to `NavigationContainer`.
4. iOS: add the scheme to `Info.plist`, add `applinks:` under Associated Domains, and confirm `SceneDelegate` forwards URLs.
5. Host `apple-app-site-association` at `/.well-known/` with no redirects.
6. Android: add scheme and `autoVerify` https intent filters, and keep `launchMode="singleTask"`.
7. Host `assetlinks.json` with your signing key's SHA-256 fingerprint.
8. Test cold and warm starts on both platforms with `xcrun simctl`, `adb`, or `npx uri-scheme`.

## FAQ

**What is the difference between a deep link and a universal link?**
A deep link is any URL that opens a specific screen in your app, including custom schemes like `trailnotes://trail/42`. A universal link is Apple's name for an https deep link that iOS opens in your app because you've proven you own the domain with an apple-app-site-association file. If the app isn't installed, a universal link opens your website instead of failing.

**Do I need React Navigation for deep linking in React Native?**
No. React Native's built-in `Linking` API gives you the incoming URL through `getInitialURL()` and the `url` event, and you can route it yourself. A navigation library saves you from writing the parsing, params, and nested navigator handling. React Navigation does this with its `linking` prop, and Expo Router does it automatically from your file structure.

**Why does my deep link work when the app is open but not when it's closed?**
When the app is closed, the URL arrives through `Linking.getInitialURL()`, not the `url` event. If your code only listens for events, or a splash screen or login redirect navigates before the initial URL is handled, the link is lost. Let React Navigation's `linking` config handle the initial URL, and test it after force-quitting the app.

**Can I test universal links in the iOS Simulator?**
Yes, with limits. You can run `xcrun simctl openurl booted "https://yourdomain/path"` to check how your app handles the URL. But domain verification, caching, and how links behave when tapped in Mail or Messages can differ on a physical device. Always confirm on a real iPhone with a release build before a campaign goes out.

**How do I test deep linking in Expo?**
Use a development build, not Expo Go. Expo Go uses its own `exp://` scheme, so your custom scheme and associated domains won't behave like they will in production. Build with `npx expo run:ios` or EAS Build, then open links with `npx uri-scheme open "trailnotes://trail/42" --ios` or with `adb` on Android.

**What is deferred deep linking, and does React Native support it?**
Deferred deep linking sends a user to the right screen on first launch after they install the app from a link. Neither iOS nor Android provides this, and React Native's `Linking` API can't do it alone. You need an attribution service or your own server that matches the click to the install, then hands your app the original path.

**Should I use a custom URL scheme or https links?**
Use https Universal Links and App Links for anything users tap in email, SMS, ads, or social posts. They're verified, other apps can't hijack them, and they fall back to your website. Keep a custom scheme for development, app-to-app calls, and some OAuth redirects. Most production apps register both.

## Conclusion: which React Native deep linking setup should you choose?

React Native deep linking isn't hard to code. It's hard to verify, because failures are silent and spread across JavaScript, two native projects, and your web server. Here's how to choose:

- **Choose Expo Router** if you're starting a new Expo app. Your files become your routes, and you configure native settings in `app.json`.
- **Choose React Navigation's `linking` config** if you have an existing navigator, a bare workflow, or complex nested navigation you want to control yourself.
- **Choose a custom scheme only** if links never leave your own apps or dev tools.
- **Add Universal Links and App Links** as soon as a link goes into an email, an ad, or a message.
- **Add a deferred deep link provider** only when you're paying to acquire users who don't have the app installed yet.

Whichever you choose, force-quit the app and tap the link. That one test catches more broken campaigns than anything else in this guide.

The full TrailNotes example, with both the React Navigation and Expo Router versions, is on GitHub: https://github.com/Vishamberlalcahwla/trailnotes-deep-linking.

*— Vishamber Lal*

## Further reading

- React Navigation, Deep linking: https://reactnavigation.org/docs/deep-linking
- React Navigation, Configuring links: https://reactnavigation.org/docs/configuring-links
- React Native, Linking API: https://reactnative.dev/docs/linking
- Expo, Linking overview: https://docs.expo.dev/linking/overview/
- Expo, iOS Universal Links: https://docs.expo.dev/linking/ios-universal-links/
- Expo, Android App Links: https://docs.expo.dev/linking/android-app-links/
- Apple, Supporting associated domains: https://developer.apple.com/documentation/xcode/supporting-associated-domains
- Android, Verify Android App Links: https://developer.android.com/training/app-links/verify-android-applinks

---

SEO CHECKLIST

- **Title length:** 70 characters. Medium shows the full title, but Google may cut it after about 60 characters. If you want a shorter SEO title (set it in Medium's "SEO settings"), try "React Native Deep Linking: Practical Guide (2026)" (49 characters).
- **Primary keyword "React Native deep linking":** in the title, in the first 100 words (third paragraph), in an H2 ("Conclusion: which React Native deep linking setup should you choose?"), and in the conclusion text. ✅
- **Question-style H2s:** "What is deep linking in React Native?", "How does a deep link travel from a tap to a screen?", "How do you test React Native deep links?", "Troubleshooting: why isn't my deep link working?" ✅
- **Secondary keywords:** React Navigation deep linking (Step 2–3 sections), universal links React Native (comparison and iOS sections), Android App Links React Native (Step 6), Expo linking React Native (Expo section), custom URL scheme React Native (comparison table). ✅
- **Long-tail:** "how to set up deep linking in React Native" is an H2. The code blocks cover "React Native deep link example code." ✅
- **Featured snippet targets:** the opening definition, the comparison table, the numbered setup checklist, and the FAQ answers (each 40–80 words, standalone).
- **Internal and external links:** Link https://github.com/Vishamberlalcahwla/trailnotes-deep-linking in the conclusion (already in place) and add it again near the top, after the Quick answer, as "Full example code on GitHub." Link to the official docs in Further reading; it helps readers and signals credibility.
- **Before you publish:** Run both example apps on a simulator and a real device so the "tested with" line holds.

---

GITHUB README BLURB

# TrailNotes: React Native Deep Linking Example

A companion repo for the article *React Native Deep Linking: A Practical Guide With Real Examples (2026)*. TrailNotes is a small hiking journal that shows production-style deep linking in two versions: a bare React Native app using React Navigation's typed `linking` config, and an Expo Router app using file-based routes and `app.json` configuration.

Both versions handle the custom scheme `trailnotes://` and https Universal Links / Android App Links for two routes, `/trail/:id` and `/settings`. They cover cold and warm starts, route validation, and a NotFound fallback. The `well-known/` folder has sample `apple-app-site-association` and `assetlinks.json` files to adapt for your domain.

The `scripts/` folder includes one-line commands for testing links on the iOS Simulator and Android using `xcrun simctl`, `adb`, and `npx uri-scheme`. Replace the Team ID, bundle ID, and signing fingerprint with your own before you deploy. Issues and PRs are welcome.
