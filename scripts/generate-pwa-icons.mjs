import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

async function generateIcons() {
    const svgBuffer = await sharp(join(root, 'public/favicon.svg')).toBuffer();

    // Generate 192x192 icon
    await sharp(svgBuffer)
        .resize(192, 192)
        .png()
        .toFile(join(root, 'public/pwa-192x192.png'));

    // Generate 512x512 icon
    await sharp(svgBuffer)
        .resize(512, 512)
        .png()
        .toFile(join(root, 'public/pwa-512x512.png'));

    console.log('PWA icons generated successfully!');
}

generateIcons().catch(console.error);
