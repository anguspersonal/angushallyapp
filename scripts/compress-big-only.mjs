import fs from 'fs';
import path from 'path';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';

// Recursively find all image files in next-ui/public
function findImageFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findImageFiles(fullPath, files);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext) && !item.includes('.original.')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

// Find oversized images (>500 kB)
const publicDir = 'next-ui/public';
const allImages = findImageFiles(publicDir);
const BIG_IMAGES = allImages.filter(p => fs.statSync(p).size > 512000);

console.log(`Found ${BIG_IMAGES.length} oversized images`);

if (BIG_IMAGES.length === 0) {
  console.log('No oversized images found!');
  process.exit(0);
}

for (const img of BIG_IMAGES) {
  const filename = path.basename(img);
  const originalSize = fs.statSync(img).size;
  
  console.log(`\n📷 Aggressively compressing: ${filename}`);
  console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
  
  // Create backup if it doesn't exist
  const backup = img.replace(/\.(jpg|jpeg|png)$/i, '.original.$1');
  if (!fs.existsSync(backup)) {
    fs.copyFileSync(img, backup);
    console.log(`   ✅ Backup created: ${path.basename(backup)}`);
  }

  try {
    // Aggressive compression with lower quality
    const compressed = await imagemin([img], {
      plugins: [
        imageminMozjpeg({ 
          quality: 70,  // Lower quality for smaller size
          progressive: true 
        }),
        imageminPngquant({ 
          quality: [0.5, 0.7]  // Lower quality range
        })
      ]
    });
    
    if (compressed.length) {
      fs.writeFileSync(img, compressed[0].data);
      
      const newSize = fs.statSync(img).size;
      const savings = originalSize - newSize;
      const percentSaved = ((savings / originalSize) * 100).toFixed(1);
      
      console.log(`   New size: ${(newSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   💾 Saved: ${(savings / 1024 / 1024).toFixed(2)}MB (${percentSaved}%)`);
      console.log(`   ✅ Compressed successfully`);
    } else {
      console.log(`   ⚠️  No compression achieved`);
    }
  } catch (error) {
    console.error(`   ❌ Error compressing ${filename}:`, error.message);
  }
}

console.log('\n🎉 Aggressive compression complete!'); 