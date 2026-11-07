# Raagam — Android and iOS publication

The app name is **Raagam**, npm package is `raagam`, and Android/iOS identifier is **`com.raagam.app`**. Users can use the app without an account. A Vercel deployment hosts the shared interface and backend.

## First deploy the website

Import `Pirasannan/Raagam` into your Vercel account with the Next.js preset and Node.js 22. Record the production URL actually assigned to the project.

```sh
npm ci
CAPACITOR_SERVER_URL=https://raagam-jet.vercel.app npm run mobile:sync
```

Do not ship a mobile build pointing to the previous project's deployment or a guessed domain. The mobile apps require internet access.

## Android

### Test build

```sh
npm run android
```

Build a debug APK in Android Studio, or run `./gradlew assembleDebug` from `android/` after syncing. Debug signing is for testing only.

### Release signing

Create a new private upload keystore for Raagam. Do not reuse any key or password from the old public repository. Keep it outside Git, with a private backup.

The Gradle release configuration reads:

- `RAAGAM_KEYSTORE_PATH`: absolute path to your private keystore
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

With those variables set, run `./gradlew bundleRelease` from `android/` to create an Android App Bundle. The checked-in GitHub Actions workflow builds a debug APK by default; its release job runs only on manual dispatch and requires the GitHub secrets described in the workflow. No signing credentials are committed and releases are not automatically published.

For Google Play, use your developer account, register `com.raagam.app`, and provide final artwork, screenshots, a support contact, a deployed privacy-policy URL, and accurate app-content/data disclosures. Check the current Play Console requirements at submission time. Increment `versionCode` for each uploaded update.

## iOS

```sh
npm run ios
```

In Xcode, select the App target, confirm `com.raagam.app`, and choose your own signing team. Run on a simulator first. For device/TestFlight/App Store distribution, configure your Apple Developer membership, register the bundle ID, create the App Store Connect listing, archive the app and upload it through Xcode.

Supply the final AppIcon artwork, screenshots, support contact, privacy-policy URL and accurate privacy disclosures before submitting. Neither store approval nor distribution signing is supplied by a source-code build.

## Branding

The music-note icons are placeholders until you provide your logo. Replace the web manifest icons, navigation artwork, Android launcher icons and iOS AppIcon set with consistent assets before publishing.
