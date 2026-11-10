import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const platform = process.argv[2];
if (platform !== 'android' && platform !== 'ios') {
  throw new Error('Usa npm run prepare:android o npm run prepare:ios.');
}

const root = new URL('../', import.meta.url);
const platformPath = new URL(platform + '/', root);
const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const icon = await readFile(new URL('../tjsdates/icon.svg', root), 'utf8');
const color = '#140c21';
const iconSquare = Buffer.from(icon.replace(' rx="120"', ''));
const iconForeground = Buffer.from(icon.replace('0 0 512 512', '-40 -40 592 592').replace(/<rect[^>]*\/>/, ''));
const locationCopy = 'TJSDATES usa tu ubicación mientras utilizas la app para sugerir perfiles cercanos y mostrar distancias aproximadas.';

function run(script, args = []) {
  execFileSync(process.execPath, [fileURLToPath(new URL(script, root)), ...args], {
    cwd: fileURLToPath(root), stdio: 'inherit',
  });
}

async function edit(path, update) {
  const file = new URL(path, platformPath);
  const before = await readFile(file, 'utf8');
  const after = update(before);
  if (after !== before) await writeFile(file, after);
}

async function png(path, svg, size, opaque = false) {
  const image = sharp(svg, { density: 288 }).resize(size, size);
  if (opaque) image.flatten({ background: color }).removeAlpha();
  await image.png().toFile(fileURLToPath(new URL(path, platformPath)));
}

run('scripts/build-web.mjs');
const cli = 'node_modules/@capacitor/cli/bin/capacitor';
if (existsSync(platformPath)) {
  run(cli, ['sync', platform]);
} else {
  run(cli, ['add', platform, ...(platform === 'ios' ? ['--packagemanager', 'SPM'] : [])]);
}

if (platform === 'android') {
  await edit('app/src/main/AndroidManifest.xml', manifest => {
    const hardened = manifest.replace('android:allowBackup="true"', 'android:allowBackup="false"');
    if (hardened.includes('android.permission.ACCESS_COARSE_LOCATION')) return hardened;
    return hardened.replace('</manifest>', '    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />\n</manifest>');
  });
  await edit('app/build.gradle', gradle =>
    gradle.replace(/versionName "[^"]+"/, 'versionName "' + packageJson.version + '"'));
  await edit('app/src/main/res/values/ic_launcher_background.xml', colors =>
    colors.replace(/(<color name="ic_launcher_background">)[^<]+/, '$1' + color));
  await edit('app/src/main/res/values/styles.xml', styles => styles.replace(
    '<item name="android:background">@drawable/splash</item>',
    [
      '<item name="windowSplashScreenBackground">@color/ic_launcher_background</item>',
      '<item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher</item>',
      '<item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>',
    ].join('\n        '),
  ));
  for (const [density, scale] of Object.entries({ mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 })) {
    const dir = 'app/src/main/res/mipmap-' + density + '/';
    await Promise.all([
      png(dir + 'ic_launcher.png', iconSquare, 48 * scale, true),
      png(dir + 'ic_launcher_round.png', Buffer.from(icon), 48 * scale),
      png(dir + 'ic_launcher_foreground.png', iconForeground, 108 * scale),
    ]);
  }
} else {
  await edit('App/App/Info.plist', original => {
    const descriptions = {
      NSLocationWhenInUseUsageDescription: locationCopy,
      NSLocationAlwaysAndWhenInUseUsageDescription: locationCopy,
      NSCameraUsageDescription: 'Usa la cámara para tomar una foto de perfil o adjuntar una imagen cuando tú lo elijas.',
      NSPhotoLibraryUsageDescription: 'Elige una foto de tu biblioteca para tu perfil o para adjuntarla en TJSDATES.',
    };
    const entries = Object.entries(descriptions)
      .filter(([key]) => !original.includes('<key>' + key + '</key>'))
      .map(([key, value]) => '\t<key>' + key + '</key>\n\t<string>' + value + '</string>\n');
    return original.replace(/<\/dict>\s*<\/plist>\s*$/, entries.join('') + '</dict>\n</plist>\n');
  });
  await edit('App/App.xcodeproj/project.pbxproj', project =>
    project.replace(/MARKETING_VERSION = [^;]+;/g, 'MARKETING_VERSION = ' + packageJson.version + ';'));
  await png('App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', iconSquare, 1024, true);
  const centeredLogo = await sharp(iconForeground).resize(360, 360).png().toBuffer();
  const launch = await sharp({ create: { width: 2732, height: 2732, channels: 3, background: color } })
    .composite([{ input: centeredLogo, gravity: 'center' }]).png().toBuffer();
  const splashPath = 'App/App/Assets.xcassets/Splash.imageset/';
  for (const name of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
    await writeFile(new URL(splashPath + name, platformPath), launch);
  }
}
