import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.join(process.cwd(), 'public');
const srcAssetsDir = path.join(process.cwd(), 'src/assets');

async function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await processDir(filePath);
    } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const ext = path.extname(file);
      const newFile = file.replace(ext, '.webp');
      const newFilePath = path.join(dir, newFile);

      await sharp(filePath)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(newFilePath)
        .then(() => {
          console.log(`Optimized ${file} -> ${newFile}`);
        })
        .catch(err => console.error(`Error on ${file}:`, err));
    }
  }
}

console.log("🚀 Starting deep image optimization...");
processDir(publicDir).then(() => processDir(srcAssetsDir)).then(() => {
  console.log("✅ All images optimized successfully.");
});
