# Jatah.

**J**ust **A**void **T**apping **A**round, **H**un.

A daily allowance budget tracker. No bank link, no account, no server, no analytics: everything lives on your phone and nothing is sent anywhere.

## How the money works

| Thing | What it means |
| --- | --- |
| **Budget for the month** | The most you allow yourself this month, e.g. Rp500.000. |
| **Recurring** | Subscriptions and bills, every 1–60 months. Each is taken out on day 1 of a month it's due. |
| **Final budget** | Budget for the month minus recurring due this month. |
| **Recommended per day** | Final budget ÷ days in the month, rounded down to the thousand (16.666 → 16.000). |
| **Budget per day** | What you give yourself each day, e.g. Rp15.000. It builds up: 3 untouched days = Rp45.000. |
| **Available today** | Daily budget × days so far − what you've spent. Overspend goes negative and tomorrow's budget pays it back. |

The ring on the Today screen shows how much of your built-up budget is left, coloured by state: **green** safe, **orange** running low (less than half a day's budget left), **red** in debt (the ring then shows how much of tomorrow you've already used).

## Project layout

```
www/                  the whole app (index.html) + PWA files
  index.html
  manifest.webmanifest
  sw.js               offline cache for the web version
  icons/
assets/               source images for the Android icon and splash screen
capacitor.config.json wraps www/ into an Android app
.github/workflows/
  android.yml         builds the APK on every push
  pages.yml           publishes www/ to GitHub Pages
```

There's no build step for the app itself. Edit `www/index.html` and push.

## First-time setup

0. **Move the workflows into place** (only needed once). In PowerShell, inside this folder:
   ```powershell
   mkdir .github; Move-Item setup\workflows .github\workflows; Remove-Item setup
   ```
1. **Create an empty repo** on GitHub (public, so GitHub Pages is free). Don't add a README there.
2. **Add the signing key secrets before your first push**, so even the first APK can be updated later.
   Repo → *Settings* → *Secrets and variables* → *Actions* → *New repository secret*. Add the two values from `../signing-key-PRIVATE/github-secrets.txt`:
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEYSTORE_BASE64`
3. **Turn on Pages**: *Settings* → *Pages* → *Source*: **GitHub Actions**.
4. **Push** from this folder:
   ```bash
   git init
   git add .
   git commit -m "Jatah. v1.0.0"
   git branch -M main
   git remote add origin https://github.com/<you>/jatah.git
   git push -u origin main
   ```

Both workflows start on their own. Watch them in the *Actions* tab (the APK takes about 5 minutes).

## Installing on Android

**Easiest, as a GitHub Release:** in the repo, *Releases* → *Draft a new release* → *Choose a tag* → type `v1.0.0` → *Publish release*. A few minutes later `jatah.apk` appears on that release page. Open it on your phone, download, tap to install. Android will ask you to allow installs from your browser once.

**Or from any run:** *Actions* → latest *Build Android APK* → *Artifacts* → `jatah-apk` (a zip with the APK inside; you need to be signed in to GitHub).

To update: change things, bump `"version"` in `package.json`, push, publish a new release (`v1.0.1`, …). Install the new APK over the old one; your data stays.

## Installing on iPhone (for friends)

Open `https://<you>.github.io/<repo>/` in **Safari** → *Share* → **Add to Home Screen**. It opens full screen with its own icon and works offline.

Android users can do the same in Chrome (*⋮* → *Install app*) if they don't want the APK.

A real iOS app needs a Mac with Xcode (`npx cap add ios`), and without a paid Apple Developer account it stops opening after 7 days. The web version avoids all that.

## Your data

- Stored in the app's local storage on that one phone. The APK, the web version and each browser keep separate data.
- **Setup → Copy backup** puts everything on your clipboard as text. Paste it in your notes. **Restore backup** brings it back on any device or version.
- Uninstalling the app or clearing its storage deletes your data, so back up first.

## Updating the web version

Change `VERSION` at the top of `www/sw.js` (e.g. `jatah-v2`) whenever you edit anything in `www/`, otherwise installed copies keep showing the old cached app.

## Building on your own PC (optional)

Needs Node 20+, JDK 21 and Android Studio.

```bash
npm install
npx cap add android
npm run android:icons
npx cap sync android
npx cap open android   # then press Run in Android Studio
```

## Keep the signing key safe

`../signing-key-PRIVATE/` is deliberately outside this repo. Never commit it, and back it up. Every APK must be signed with the same key to install as an update; without it you'd have to uninstall (and lose data that isn't backed up).
