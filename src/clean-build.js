import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const initScript = `
// This script ensures a clean initialization with only default personalities
localStorage.clear();
localStorage.setItem('app_initialized', 'true');
`;

fs.writeFileSync(path.join(distDir, 'init.js'), initScript);
console.log('Created initialization script at:', path.join(distDir, 'init.js'));