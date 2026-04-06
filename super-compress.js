import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function superCompress() {
  const images = [
    { name: 'hero-bg.webp', width: 1600, quality: 60 },
    { name: '2bhk-plan.webp', width: 800, quality: 70 },
    { name: '3bhk-plan.webp', width: 800, quality: 70 },
  ];

  for (const img of images) {
    const input = path.join(process.cwd(), 'public', img.name);
    const output = path.join(process.cwd(), 'public', `tmp-${img.name}`);
    
    if (fs.existsSync(input)) {
        console.log(`Compressing ${img.name}...`);
        await sharp(input)
          .resize(img.width)
          .webp({ quality: img.quality, effort: 6 })
          .toFile(output);
        
        fs.unlinkSync(input);
        fs.renameSync(output, input);
        console.log(`Done: ${img.name}`);
    }
  }
}

superCompress();
