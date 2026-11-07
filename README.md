# Raagam

Raagam is a Carnatic and Hindustani music discovery app built with Next.js, React, TypeScript, Tailwind CSS and the Web Audio API. Explore ragas, search songs, audition swaras and browse the music library without creating an account.

The website and the Capacitor Android/iOS apps share the same web interface. The mobile apps load your HTTPS deployment and require internet access. This is not a bundled offline version of Next.js.

## Run locally

Use Node.js 22 (see `.nvmrc`).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Verify changes with `npm run build` and `npm run typecheck`.

## Deploy on Vercel

1. Sign in to Vercel and import `Pirasannan/Raagam` from GitHub.
2. Keep the Next.js preset, repository root, `npm ci` install and `npm run build` build command. Use Node.js 22.
3. Deploy. Vercel assigns the actual production URL; the project does not assume `raagam.vercel.app` is available.
4. Optionally set `OPENAI_API_KEY` or `GEMINI_API_KEY` in the project's private environment settings, with the corresponding model variable. Redeploy after adding environment variables. The built-in library works without AI credentials. Visitors never supply credentials.

`.env.example` lists configuration names. Never commit real keys.

## Android and iOS

- Product name: **Raagam**
- npm package: `raagam`
- Android application ID and iOS bundle identifier: **`com.raagam.app`**
- Native framework: Capacitor 8

After deploying the website, sync the real URL into the native projects:

```sh
CAPACITOR_SERVER_URL=https://YOUR-ACTUAL-DEPLOYMENT.vercel.app npm run mobile:sync
npm run android
npm run ios
```

`mobile:sync` creates a small launch page and runs Capacitor sync. It refuses to run without an explicit HTTPS deployment URL. The generated files and local configuration are ignored by Git; run sync after each checkout before building mobile apps.

Android requires the SDK/Java versions specified by the Gradle project. iOS requires macOS and Xcode. Xcode can build the simulator app without distribution signing; device/TestFlight/App Store distribution needs your Apple signing team. Store publication is a separate step from creating native projects.

See [PLAYSTORE_PUBLISH_GUIDE.md](PLAYSTORE_PUBLISH_GUIDE.md) for Android signing and store preparation.

## Logo

The existing music-note artwork is a placeholder. Provide your final square logo before store publication. Replace web icons (`public/icon-192.png`, `public/icon-512.png`), the navigation artwork, Android launcher assets, and the iOS AppIcon asset catalog together.

## Internal musicology tools

There is no public signup, login, user profile, or welcome-email flow. The owner-only `/admin` console is omitted from public navigation and disabled unless `ADMIN_SECRET_KEY` is configured. It exists solely for managing musicology rules and reports; it is not required to use Raagam.

Rules and reports currently use JSON files with a memory fallback. Changes made at runtime are not durable across serverless restarts. Connect persistent storage before using the teaching/reporting system for production moderation; the bundled music catalog does not depend on this.

The previous project's public signing keys and email credentials must not be reused. They are excluded or removed from this repository. If you control the old email account, revoke any previously exposed app password.
