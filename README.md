# Raagam

Live website: **https://raagam-jet.vercel.app**

Raagam is a Carnatic and Hindustani music discovery app built with Next.js, React, TypeScript, Tailwind CSS and the Web Audio API. Identify ragas by swaras, song or notes, play any scale, explore 908 janya ragas and the 72 melakartas, and practise with a tanpura — without creating an account.

See [docs/FEATURES.md](docs/FEATURES.md) for a complete list of features.

## Project structure

```
src/
  app/                 Pages (App Router) and API routes
    page.tsx           Home: hero, raga finder, explore sections
    ragas/ melakarta/ radio/ practice/ updates/ downloads/ privacy/ admin/
    api/identify-raga  Raga identification
  components/
    ui/                Design-system primitives (Button, Eyebrow, Segmented, Reveal…)
    layout/            Navbar, Footer, PageHeader, Marquee
    music/             ScaleNotes (notes light up as they play), BreathingOrb
    finder/ ragas/ melakarta/ radio/ practice/ updates/ home/
  hooks/useScalePlayer.ts
  lib/
    music/             Swara notation, 72 melakartas, raga catalogue/matcher, audio engine
    identify/          Identification pipeline: song archive, MSIDB, curated notes, optional AI
  data/                Bundled datasets
```

Identification is deterministic first: the song archive and the scale library answer whenever they can, and AI is only consulted when it is configured and nothing else matched. Nothing is invented when no match is found.

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
4. The current production deployment is https://raagam-jet.vercel.app. The GitHub repository variable `CAPACITOR_SERVER_URL` points native CI builds at this address.
5. Optionally set `OPENAI_API_KEY` or `GEMINI_API_KEY` in the project's private environment settings, with the corresponding model variable. Redeploy after adding environment variables. The built-in library works without AI credentials. Visitors never supply credentials.

`.env.example` lists configuration names. Never commit real keys.

## Android and iOS

- Product name: **Raagam**
- npm package: `raagam`
- Android application ID and iOS bundle identifier: **`com.raagam.app`**
- Native framework: Capacitor 8

After deploying the website, sync the real URL into the native projects:

```sh
CAPACITOR_SERVER_URL=https://raagam-jet.vercel.app npm run mobile:sync
npm run android
npm run ios
```

`mobile:sync` creates a small launch page and runs Capacitor sync. It refuses to run without an explicit HTTPS deployment URL. The generated files and local configuration are ignored by Git; run sync after each checkout before building mobile apps.

Android requires the SDK/Java versions specified by the Gradle project. iOS requires macOS and Xcode. Xcode can build the simulator app without distribution signing; device/TestFlight/App Store distribution needs your Apple signing team. Store publication is a separate step from creating native projects.

See [PLAYSTORE_PUBLISH_GUIDE.md](PLAYSTORE_PUBLISH_GUIDE.md) for Android signing and store preparation.

## Design

The interface follows the Serova reference design kept in `Serova/`: a warm canvas (`#f0eae2`), espresso brown (`#3a1a15`) and coral (`#e0583e`), Inter Tight with Instrument Serif italics. Colours and fonts are defined in `tailwind.config.js`, `src/app/layout.tsx` and `src/app/globals.css`. Animations are tied to sound (breathing drone, plucked strings, notes lighting up as they play) and switch off for visitors who prefer reduced motion.

## Logo

The existing music-note artwork is a placeholder. Provide your final square logo before store publication. Replace web icons (`public/icon-192.png`, `public/icon-512.png`), the navigation artwork, Android launcher assets, and the iOS AppIcon asset catalog together.

## Internal musicology tools

There is no public signup, login, user profile, or welcome-email flow. The owner-only `/admin` console is omitted from public navigation and disabled unless `ADMIN_SECRET_KEY` is configured. It exists solely for managing musicology rules and reports; it is not required to use Raagam.

Rules and reports currently use JSON files with a memory fallback. Changes made at runtime are not durable across serverless restarts. Connect persistent storage before using the teaching/reporting system for production moderation; the bundled music catalog does not depend on this.

The previous project's public signing keys and email credentials must not be reused. They are excluded or removed from this repository. If you control the old email account, revoke any previously exposed app password.
