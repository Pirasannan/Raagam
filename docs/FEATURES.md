# Raagam feature blueprint

Every feature in the app today, where it lives, and what it depends on. Use this to decide what to keep and what to remove.
Items marked **Candidate to remove** are ones that look weak, duplicated or risky; the final call is yours.

## Pages

| # | Feature | URL | What it does | Depends on |
|---|---------|-----|--------------|------------|
| 1 | **Raga finder — by swaras** | `/` (Finder section) | Tap swaras on a 16-key keyboard (each key sounds), or pick a preset. Finds ragas that use exactly those notes, plus close matches. | Scale library (908 janyas + 72 melakartas) |
| 2 | **Raga finder — by song or kriti** | `/` | Type a song title. Looks it up in the song archive (5,187 entries), then the online Malayalam Song Info Database, then a small curated list, then AI if configured. Shows ragamalika songs raga by raga. | Song archive, msidb.org (live, server-side), optional AI |
| 3 | **Raga finder — by notes** | `/` | Type western notes (`C D E F# G A B`) or swaras (`S R2 G3 P D2`); converted to swaras and matched. Free-text descriptions ("a sad evening raga") only work when AI is configured. | Scale library, optional AI |
| 4 | Result card | `/` | Name, other names, melakarta/thaat, playable arohana/avarohana/signature phrase, mood, time, explanation, other ragas with the same notes, close matches, songs in the raga, "Suggest a correction". | — |
| 5 | Tanpura in the hero | `/` | One-tap drone (Sa = C) with strings that vibrate in sync, and a playable scale chart. | Web Audio |
| 6 | **Raga library — janya ragas** | `/ragas` | 908 janya ragas: search (name, parent, notes), filter by chakra/melakarta/type (audava, shadava, sampurna, vakra, bhashanga, Hindustani link), sort, paginate, play scales, export CSV, open in finder. | `carnatic_janya_ragas.json` |
| 7 | Raga library — melakartas | `/ragas?view=melakarta` | The 72 melakartas grouped by chakra, playable. Same component as on `/melakarta`. | Generated from the chakra scheme |
| 8 | Raga library — popular | `/ragas?view=popular` | 12 commonly taught ragas with mood, time, western notes, example songs. | `seed_ragas.json` |
| 9 | **Melakarta wheel** | `/melakarta` | Interactive 72-segment chakra wheel; click to hear a scale. Plus "how the numbering works", the Katapayadi decoder and the full list. | — |
| 10 | **Raga radio** | `/radio` | 90 raga channels, 3,274 Malayalam film songs. Plays through an embedded YouTube player; 560 songs have a known video, the rest are searched on YouTube at play time. | YouTube embed + YouTube search (server-side) |
| 11 | **Practice — tanpura** | `/practice` | Four-string drone in any of 12 shrutis (with kattai), Pa/Ma/Ni tuning, volume. | Web Audio |
| 12 | Practice — look-alike ragas | `/practice?tool=pairs` | 7 pairs of easily confused ragas with what tells them apart. | — |
| 13 | Practice — swara lookup | `/practice?tool=lookup` | Tap notes; matching ragas update instantly in the browser. *Overlaps with feature 1.* **Candidate to remove or merge.** | Scale library |
| 14 | **New songs** | `/updates` | Six Spotify playlists of new Malayalam film music, embedded, plus a box to look up a song's raga. *Not about ragas; content depends on Spotify.* **Candidate to remove.** | Spotify embed |
| 15 | Open datasets | `/downloads` | Download the janya CSV/JSON, songs CSV/JSON, an offline song-finder HTML page, the 72 melakartas JSON and a notation guide. | Files in `public/downloads` |
| 16 | Privacy policy | `/privacy` | Required for app stores. | — |
| 17 | Musicology console (owner only) | `/admin` | Sign in with `ADMIN_SECRET_KEY`; create/edit/delete correction rules, review visitor corrections, test queries, export/import rules. Rules are stored on disk, which **Vercel resets on every deploy** — needs a database to be useful. **Candidate to remove** unless you plan to add storage. | `ADMIN_SECRET_KEY`, filesystem |
| 18 | Narrated walkthrough | `/video-demo` | Auto-playing slideshow with speech, made for screen-recording a promo video. Not linked anywhere. **Candidate to remove.** | Browser speech synthesis |

## Behind the scenes

| Feature | Where | Notes |
|---------|-------|-------|
| Suggest a correction | Result card → `POST /api/report-mistake` | Saved to disk; lost on redeploy (same storage issue as the console). |
| Optional AI identification | `src/lib/identify/ai.ts` | Used only when `GEMINI_API_KEY` or `OPENAI_API_KEY` is set and nothing deterministic matched. Off today. |
| Live MSIDB lookup | `src/lib/identify/msidb.ts` | Scrapes msidb.org for songs missing from the archive; that site's certificate chain is incomplete, so TLS verification is relaxed for this one request only. **Fragile.** |
| Android and iOS apps | `android/`, `ios/`, `capacitor.config.ts` | Thin native shells that load the live website. |
| Promo video files | `public/promo_video/` (11 MB) | No longer used by any page. **Candidate to delete** (makes every deploy smaller). |
| Old URLs | `/?tab=…`, `/sos`, `/raga-radio` | Redirect to the new pages so old links and app shortcuts keep working. |
