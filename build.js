import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, 'src-tauri', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('Created assets directory in src-tauri');
}

const srcAssetsDir = path.join(__dirname, 'src', 'assets');
if (fs.existsSync(srcAssetsDir)) {
  fs.readdirSync(srcAssetsDir).forEach(file => {
    const srcFile = path.join(srcAssetsDir, file);
    const destFile = path.join(assetsDir, file);
    fs.copyFileSync(srcFile, destFile);
  });
}