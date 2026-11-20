# Releasing

Notes for whoever maintains the repo: how the APK and the web version get built and published.

## How it's wired

| File | What it does |
| --- | --- |
| `.github/workflows/android.yml` | Builds `jatah.apk` on every push to `main`. A tag like `v1.0.1` also attaches it to a GitHub Release. |
| `.github/workflows/pages.yml` | Publishes `www/` to GitHub Pages on every push to `main`. |
| `capacitor.config.json` | App id (`com.jatah.budget`), name and Android settings. |
| `assets/` | Source images for the Android icon and splash screen. |
| `www/sw.js` | Offline cache for the web version. |

The `android/` folder is generated fresh on every build, so it isn't in the repo.

## One-time setup

1. **Signing key secrets.** Repo → *Settings* → *Secrets and variables* → *Actions*:
   - `ANDROID_KEYSTORE_BASE64`: the keystore file encoded as text
   - `ANDROID_KEYSTORE_PASSWORD`: its password (the key alias is `jatah`)

   Without them the workflow still builds, but as a debug APK that can't update an existing install.
2. **Pages.** *Settings* → *Pages* → *Source*: **GitHub Actions**. The repo must be public on a free account.

## Shipping a new version

1. Make your changes in `www/`.
2. If anything in `www/` changed, bump `VERSION` at the top of `www/sw.js` (`jatah-v2`, `jatah-v3`, …). Otherwise installed web copies keep showing the cached old app.
3. Bump `"version"` in `package.json` (`1.0.1`).
4. Commit and push to `main`. The web version updates within a minute.
5. On GitHub: *Releases* → *Draft a new release* → new tag `v1.0.1` → *Publish*. The workflow attaches `jatah.apk` to it a few minutes later.

The APK's internal version number is the workflow run number, so every build counts as newer than the last.

## The signing key

Android only installs an update if it's signed with the same key as the installed app. Lose the key and every user has to uninstall (losing anything they haven't backed up) and reinstall.

- Never commit the `.jks` file (`.gitignore` blocks it).
- Keep a backup of it and its password outside your computer.

### Making your own key (forks)

Needs a JDK (`keytool` comes with it):

```bash
keytool -genkeypair -keystore jatah-release.jks -storetype PKCS12 -alias jatah \
  -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Jatah"
```

Then turn it into text for the secret:

```bash
# macOS / Linux
base64 -w0 jatah-release.jks        # macOS: base64 -i jatah-release.jks
# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("jatah-release.jks"))
```

Also change `appId` in `capacitor.config.json` so your app doesn't collide with this one.

## Building on your own PC

Needs Node 20+, JDK 21 and Android Studio.

```bash
npm install
npx cap add android
npm run android:icons
npx cap sync android
npx cap open android   # then press Run in Android Studio
```
