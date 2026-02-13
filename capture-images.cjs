const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Starting image generation...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Load HTML file
  const htmlPath = path.join(__dirname, 'generate-images.html');
  await page.goto(`file://${htmlPath}`);
  
  console.log('Capturing thumbnail (80x80)...');
  // Capture thumbnail
  const thumbnail = await page.locator('#thumbnail');
  await thumbnail.screenshot({
    path: 'thumbnail-80x80.png',
    type: 'png'
  });
  console.log('✓ Thumbnail saved: thumbnail-80x80.png');
  
  console.log('Capturing main image (590x300)...');
  // Capture main image
  const mainImage = await page.locator('#main-image');
  await mainImage.screenshot({
    path: 'preview-590x300.png',
    type: 'png'
  });
  console.log('✓ Main image saved: preview-590x300.png');
  
  // Also save as JPEG
  await mainImage.screenshot({
    path: 'preview-590x300.jpg',
    type: 'jpeg',
    quality: 90
  });
  console.log('✓ Main image saved: preview-590x300.jpg');
  
  await browser.close();
  console.log('Done! Images generated successfully.');
})();
