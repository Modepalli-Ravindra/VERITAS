const jimpPkg = require('jimp');
const Jimp = jimpPkg.Jimp || jimpPkg;

async function cleanHero() {
  const inputPath = 'C:/Users/user/.gemini/antigravity/brain/1303db92-376e-4341-ba76-64f1bc0e2cbf/.user_uploaded/media_1793627106713_b726b478.jpg';
  const outPublic = 'C:/Users/user/OneDrive/Desktop/ai-plagiarism-detector/frontend/public/hero_ribbons.jpg';
  const outBrain = 'C:/Users/user/.gemini/antigravity/brain/1303db92-376e-4341-ba76-64f1bc0e2cbf/hero_ribbons.jpg';

  console.log('Loading clean original reference image...');
  const image = await Jimp.read(inputPath);
  const width = image.bitmap.width;   // 1024
  const height = image.bitmap.height; // 524

  console.log(`Dimensions: ${width}x${height}`);

  // 1. Exact rectangular bounds of all baked center text & buttons:
  // x: [195, 835], y: [115, 440]
  const minX = 195;
  const maxX = 835;
  const minY = 115;
  const maxY = 440;
  const feather = 24; // 24px smooth feather margin

  const centerR = 12;
  const centerG = 8;
  const centerB = 6;

  const edgeR = 9;
  const edgeG = 6;
  const edgeB = 4;

  const centerX = width / 2;
  const centerY = 270;

  image.scan(0, 0, width, height, (x, y, idx) => {
    // A. Center text area cleaning with feathered rectangular mask
    if (x >= minX - feather && x <= maxX + feather && y >= minY - feather && y <= maxY + feather) {
      let fx = 1.0;
      if (x < minX) {
        fx = (x - (minX - feather)) / feather;
      } else if (x > maxX) {
        fx = ((maxX + feather) - x) / feather;
      }

      let fy = 1.0;
      if (y < minY) {
        fy = (y - (minY - feather)) / feather;
      } else if (y > maxY) {
        fy = ((maxY + feather) - y) / feather;
      }

      const sx = 0.5 - 0.5 * Math.cos(Math.max(0, Math.min(1, fx)) * Math.PI);
      const sy = 0.5 - 0.5 * Math.cos(Math.max(0, Math.min(1, fy)) * Math.PI);
      const blendFactor = sx * sy;

      if (blendFactor > 0) {
        const distNorm = Math.hypot((x - centerX) / 400, (y - centerY) / 200);
        const t = Math.min(1.0, distNorm);

        const targetR = Math.round(centerR * (1 - t * 0.3) + edgeR * (t * 0.3));
        const targetG = Math.round(centerG * (1 - t * 0.3) + edgeG * (t * 0.3));
        const targetB = Math.round(centerB * (1 - t * 0.3) + edgeB * (t * 0.3));

        const currentR = image.bitmap.data[idx];
        const currentG = image.bitmap.data[idx + 1];
        const currentB = image.bitmap.data[idx + 2];

        image.bitmap.data[idx]     = Math.round(targetR * blendFactor + currentR * (1 - blendFactor));
        image.bitmap.data[idx + 1] = Math.round(targetG * blendFactor + currentG * (1 - blendFactor));
        image.bitmap.data[idx + 2] = Math.round(targetB * blendFactor + currentB * (1 - blendFactor));
      }
    }

    // B. Smooth top gradient to eliminate baked navbar across the entire top (y: 0 to 65px)
    if (y <= 65) {
      // Solid at y <= 35, smooth falloff from y = 35 to y = 65
      let topFactor = 1.0;
      if (y > 35) {
        topFactor = 0.5 + 0.5 * Math.cos(((y - 35) / 30) * Math.PI);
      }

      const currentR = image.bitmap.data[idx];
      const currentG = image.bitmap.data[idx + 1];
      const currentB = image.bitmap.data[idx + 2];

      image.bitmap.data[idx]     = Math.round(edgeR * topFactor + currentR * (1 - topFactor));
      image.bitmap.data[idx + 1] = Math.round(edgeG * topFactor + currentG * (1 - topFactor));
      image.bitmap.data[idx + 2] = Math.round(edgeB * topFactor + currentB * (1 - topFactor));
    }
  });

  console.log('Writing seamless background...');
  await image.write(outPublic);
  await image.write(outBrain);
  console.log('Successfully written seamless background to public and brain!');
}

cleanHero().catch(err => {
  console.error('Error cleaning hero:', err);
  process.exit(1);
});
