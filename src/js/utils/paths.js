export function getAssetPath(filename) {
  // For bundled Tauri app
  if (window.location.protocol === 'tauri:') {
    return `assets/${filename}`;
  }
  
  // For development
  return `./assets/${filename}`;
}