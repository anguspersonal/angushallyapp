import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import fs from 'fs';
import path from 'path';

// Recursively find all image files in next-ui/public
function findImageFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip optimized/ subdirectories
      if (item !== 'optimized') {
        findImageFiles(fullPath, files);
      }
    } else if (stat.isFile()) {
      // Check if it's an image file and not already a backup
      const ext = path.extname(item).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext) && !item.includes('.original.')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

async function compressImages() {
  console.log('🖼️  Starting image compression for next-ui/public...\n');
  
  const publicDir = 'next-ui/public';
  if (!fs.existsSync(publicDir)) {
    console.error('❌ next-ui/public directory not found');
    process.exit(1);
  }
  
  const imageFiles = findImageFiles(publicDir);
  
  if (imageFiles.length === 0) {
    console.log('📷 No image files found to compress');
    return;
  }
  
  console.log(`📋 Found ${imageFiles.length} image files to process\n`);
  
  let processedCount = 0;
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let errors = [];
  
  for (const imagePath of imageFiles) {
    const filename = path.basename(imagePath);
    const backupPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.original.$1');
    
    // Skip if backup already exists (already compressed)
    if (fs.existsSync(backupPath)) {
      console.log(`📷 ${filename} - Already compressed (backup exists), skipping...`);
      continue;
    }
    
    // Get original file size
    const originalStats = fs.statSync(imagePath);
    const originalSize = originalStats.size;
    totalOriginalSize += originalSize;
    
    console.log(`📷 Processing: ${filename}`);
    console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
    
    try {
      // Create backup of original first
      fs.copyFileSync(imagePath, backupPath);
      console.log(`   ✅ Backup created: ${path.basename(backupPath)}`);
      
      // Compress the image with retry logic
      let compressed;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          compressed = await imagemin([imagePath], {
            plugins: [
              imageminMozjpeg({
                quality: 85, // High quality but compressed
                progressive: true
              }),
              imageminPngquant({
                quality: [0.6, 0.8]
              })
            ]
          });
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          if (retryCount > maxRetries) {
            throw error; // Re-throw if max retries exceeded
          }
          console.log(`   ⚠️  Retry ${retryCount}/${maxRetries} for ${filename}...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
      
      if (compressed.length > 0) {
        // Write compressed image back
        fs.writeFileSync(imagePath, compressed[0].data);
        
        // Get new file size
        const newStats = fs.statSync(imagePath);
        const newSize = newStats.size;
        totalCompressedSize += newSize;
        const savings = originalSize - newSize;
        const percentSaved = ((savings / originalSize) * 100).toFixed(1);
        
        console.log(`   New size: ${(newSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   💾 Saved: ${(savings / 1024 / 1024).toFixed(2)}MB (${percentSaved}%)`);
        console.log(`   ✅ Compressed successfully\n`);
        
        processedCount++;
      } else {
        console.log(`   ⚠️  No compression achieved\n`);
        errors.push(`${filename}: No compression achieved`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error compressing ${filename}:`, error.message);
      console.log('');
      errors.push(`${filename}: ${error.message}`);
    }
  }
  
  // Summary
  console.log('🎉 Image compression complete!');
  console.log('\n📊 Summary:');
  console.log(`- Processed: ${processedCount} images`);
  console.log(`- Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`- Total compressed size: ${(totalCompressedSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`- Total saved: ${((totalOriginalSize - totalCompressedSize) / 1024 / 1024).toFixed(2)}MB`);
  console.log(`- Average compression: ${totalOriginalSize > 0 ? (((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100).toFixed(1) : 0}%`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    errors.forEach(error => console.log(`  - ${error}`));
    process.exit(1);
  }
  
  console.log('\n📋 Notes:');
  console.log('- Original images backed up with .original extension');
  console.log('- Compressed images maintain good quality (85% JPEG quality)');
  console.log('- You can restore originals if needed');
}

// Run the compression
compressImages().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
}); 