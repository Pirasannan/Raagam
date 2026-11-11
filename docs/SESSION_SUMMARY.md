# Raagam redesign: summary

## What you asked for
- Give the Raagam website the Serova design.
- Clean up the messy, AI-generated code.
- Add animations related to music and Carnatic.
- List every feature so you can choose which to keep.
- Merge everything to `main`, fix the failing Android and iOS builds, and tell you the links and what you need to run.

## What was done

### 1. New design
Every page was rebuilt in Serova's style: cream background, dark brown sections, coral highlights, big tight headlines with italic serif words, rounded cards, a scrolling strip of raga names, and a giant "raagam" at the bottom.

### 2. Music animations
- On the home page, tap the breathing circle and a real tanpura drone starts; the tanpura's strings vibrate each time one is plucked.
- When any scale plays, each note glows at the moment you hear it.
- Swara keys ripple when pressed.
- A line chart traces a scale while a dot follows the notes.
- A wheel of all 72 melakartas: click any segment to hear it.
- Equaliser bars move while radio songs play.
- People who turn off motion in their phone or computer settings won't see animations.

### 3. Code cleanup
- Each section now has its own page: Ragas, Melakarta, Radio, Practice, New songs, Downloads. Old links still work.
- Duplicate code was removed. The 72 melakartas had been typed out by hand three times.
- The app no longer makes up answers. When it couldn't find a raga it used to show one anyway; now it matches notes exactly against 908 + 72 ragas, or says "not found".
- Wrong data fixed: 899 of 908 ragas were wrongly marked "vakra" (the real number is about 410), and the tanpura tuning was off.
- The radio page loads about three times faster and no longer starts playing by itself.
- The admin page's password check and the website's inputs were made safer.

### 4. Mobile builds fixed
- Android was failing because of an outdated setup step.
- iOS was failing because the app icon was 4943 pixels wide instead of 1024.
- Your gold veena logo is now the icon on Android, iOS and the website.

### 5. Merged
Everything went in through pull request [Pirasannan/Raagam#1](https://github.com/Pirasannan/Raagam/pull/1). The website, Android and iOS builds all pass on `main`.

## Links
- **Website:** https://raagam-jet.vercel.app. If it still shows the old design, press **Redeploy** in Vercel, or connect the GitHub repo under **Settings → Git** so future merges go live on their own.
- **Android APK (test build):** https://github.com/Pirasannan/Raagam/actions/runs/43091643760/artifacts/13887374812. You need to be signed in to GitHub, and the link expires on 9 Feb 2027.
- **Feature list:** `docs/FEATURES.md` in the repo.

## Good to know
- **Mobile app technology:** Capacitor, not Flutter or React Native. The apps are thin native shells that open your website, so they update whenever the website updates.
- **What you need to run:** nothing. Vercel hosts the website. To try changes on your own computer first:

  ```bash
  git clone https://github.com/Pirasannan/Raagam.git
  cd Raagam
  npm ci
  npm run dev
  ```

  Then open http://localhost:3000. This needs Git and Node.js 22.
- **API keys:** optional. Everything works without them except describing a raga in words. When you get one, add `GEMINI_API_KEY` or `OPENAI_API_KEY` in Vercel under **Settings → Environment Variables** and redeploy.

## Still open
1. **Features to keep or remove.** Candidates to remove: New songs (Spotify playlists), Swara lookup (it repeats the finder), the hidden video demo page, and an unused 11 MB promo video folder.
2. **Make the admin page keep its data.** At the moment, everything saved there is deleted every time Vercel redeploys. Add a free Upstash Redis database in Vercel (**Storage** tab), then the admin page can be connected to it. Also set `ADMIN_SECRET_KEY` in Vercel to unlock the admin page.
3. **Play Store release.** This needs a signed build; the steps are in `PLAYSTORE_PUBLISH_GUIDE.md`.
