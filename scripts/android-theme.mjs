// Makes Android's status bar and navigation bar areas match the app instead of the default grey.
// Runs automatically after `npx cap sync` (see "capacitor:sync:after" in package.json).
// Safe to run more than once.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const res = join('android', 'app', 'src', 'main', 'res');
const stylesPath = join(res, 'values', 'styles.xml');
if (!existsSync(stylesPath)) {
  console.log('[jatah] No Android project yet, skipping theme.');
  process.exit(0);
}

// Same colours as --bg in www/index.html. Light icons on dark, dark icons on light.
const themes = {
  values: { bg: '#F6EFE7', lightBars: 'true' },
  'values-night': { bg: '#1D1814', lightBars: 'false' },
};
for (const [dir, t] of Object.entries(themes)) {
  mkdirSync(join(res, dir), { recursive: true });
  writeFileSync(join(res, dir, 'jatah_theme.xml'),
`<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="jatah_bg">${t.bg}</color>
    <bool name="jatah_light_bars">${t.lightBars}</bool>
</resources>
`);
}

let styles = readFileSync(stylesPath, 'utf8');
if (!styles.includes('jatah_bg')) {
  if (!styles.includes('xmlns:tools')) styles = styles.replace('<resources>', '<resources xmlns:tools="http://schemas.android.com/tools">');
  const items = `
        <item name="android:windowBackground">@color/jatah_bg</item>
        <item name="android:statusBarColor">@color/jatah_bg</item>
        <item name="android:navigationBarColor">@color/jatah_bg</item>
        <item name="android:windowLightStatusBar">@bool/jatah_light_bars</item>
        <item name="android:windowLightNavigationBar" tools:targetApi="27">@bool/jatah_light_bars</item>
    `;
  const re = /(<style name="AppTheme\.NoActionBar"[^>]*>)([\s\S]*?)(<\/style>)/;
  if (!re.test(styles)) {
    console.warn('[jatah] Could not find AppTheme.NoActionBar in styles.xml, bar colours not changed.');
    process.exit(0);
  }
  styles = styles.replace(re, (_, open, body, close) => open + body.trimEnd() + items + close);
  writeFileSync(stylesPath, styles);
}
console.log('[jatah] Status and navigation bars now match the app.');
