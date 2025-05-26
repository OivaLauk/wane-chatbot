export function getAssetPath(filename) {
  return filename.startsWith('./') ? filename : `./assets/${filename}`;
}