const jimpPkg = require('jimp');
const Jimp = jimpPkg.Jimp || jimpPkg;

async function upscaleHero() {
  const inputPath = 'C:/Users/user/.gemini/antigravity/brain/1303db92-376e-4341-ba76-64f1bc0e2cbf/hero_ribbons.jpg';
  const outPngPublic = 'C:/Users/user/OneDrive/Desktop/ai-plagiarism-detector/frontend/public/hero_ribbons_hd.png';
  const outPngBrain = 'C:/Users/user/.gemini/antigravity/brain/1303db92-376e-4341-ba76-64f1bc0e2cbf/hero_ribbons_hd.png';

  console.log('Loading clean background...');
  const image = await Jimp.read(inputPath);
  console.log(`Original: ${image.bitmap.width}x${image.bitmap.height}`);

  // Upscale by 2.5x to 2560 x 1310 (Ultra HD 1440p+ clarity)
  const targetW = 2560;
  const targetH = Math.round(image.bitmap.height * (2560 / image.bitmap.width));
  console.log(`Resizing to Ultra-HD: ${targetW}x${targetH}...`);

  image.resize({ w: targetW, h: targetH });

  console.log('Saving high-res lossless PNG...');
  await image.write(outPngPublic);
  await image.write(outPngBrain);
  console.log('Done! Ultra-HD PNG created successfully.');
}

upscaleHero().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

