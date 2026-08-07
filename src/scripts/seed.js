const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Read env variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const s3Endpoint = process.env.SUPABASE_STORAGE_ENDPOINT;
const s3Region = process.env.SUPABASE_STORAGE_REGION;
const s3AccessKeyId = process.env.SUPABASE_STORAGE_ACCESS_KEY_ID;
const s3SecretAccessKey = process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'zanka-objects-directory';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const s3Client = new S3Client({
  endpoint: s3Endpoint,
  region: s3Region || 'ap-northeast-2',
  credentials: {
    accessKeyId: s3AccessKeyId || '',
    secretAccessKey: s3SecretAccessKey || '',
  },
  forcePathStyle: true,
});

const socks = [
  {
    id: 'pikachu',
    name: 'Pikachu Expression Socks',
    tag: 'Pokémon',
    price_inr: 249,
    price_usd: 8.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.02 PM.jpeg',
    desc: 'All-over Pikachu happy faces on bright yellow. One size fits most.',
  },
  {
    id: 'pickle-rick',
    name: 'Pickle Rick Socks',
    tag: 'Rick & Morty',
    price_inr: 249,
    price_usd: 8.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.02 PM (1).jpeg',
    desc: 'Bold Pickle Rick graphic on vibrant green. One size fits most.',
  },
  {
    id: 'hawaiian-rick',
    name: 'Hawaiian Rick Sanchez Socks',
    tag: 'Rick & Morty',
    price_inr: 249,
    price_usd: 8.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.03 PM.jpeg',
    desc: 'Rick in a pink floral Hawaiian shirt. Light blue cuff, black base.',
  },
  {
    id: 'chopper',
    name: 'Tony Tony Chopper Socks',
    tag: 'One Piece',
    price_inr: 299,
    price_usd: 9.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.03 PM (2).jpeg',
    desc: 'Chopper in his signature pink hat & red cape on heather grey.',
  },
  {
    id: 'kuromi',
    name: 'Kuromi Neon Socks',
    tag: 'Sanrio',
    price_inr: 299,
    price_usd: 9.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.05 PM.jpeg',
    desc: 'Kuromi with neon pink lettering & cosmic stars on black/purple.',
  },
  {
    id: 'venom',
    name: 'Venom Socks',
    tag: 'Marvel',
    price_inr: 299,
    price_usd: 9.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.07 PM (1).jpeg',
    desc: 'Venom symbiote in blue & white on all-black. Dark and bold.',
  },
];

const tops = [
  {
    id: 'white-corset',
    name: 'White Ribbon-Tie Corset Top',
    tag: 'Corset',
    price_inr: 999,
    price_usd: 29.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.06 PM (2).jpeg',
    desc: 'Structured crop top with oversized shoulder ribbon ties & corset seam paneling.',
  },
  {
    id: 'doodle-shirt',
    name: 'Doodle Art Oversized Shirt',
    tag: 'Statement',
    price_inr: 1199,
    price_usd: 34.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.04 PM.jpeg',
    desc: 'All-over black & white comic doodle print. Characters, text, dual chest pockets.',
  },
  {
    id: 'lace-mandala',
    name: 'Asymmetrical Lace Mandala Shirt',
    tag: 'Artisan',
    price_inr: 1399,
    price_usd: 39.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.05 PM (1).jpeg',
    desc: 'White long-sleeve blouse with two large mandala lace appliques on the front.',
  },
  {
    id: 'brown-corset',
    name: 'Caramel Leather Corset Top',
    tag: 'Corset',
    price_inr: 999,
    price_usd: 29.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.05 PM (2).jpeg',
    desc: 'Strapless distressed faux-leather bustier in tan/caramel with hook-and-eye closure.',
  },
  {
    id: 'denim-corset',
    name: 'Denim Zipper Corset Top',
    tag: 'Denim',
    price_inr: 999,
    price_usd: 29.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.08 PM (1).jpeg',
    desc: 'Medium-wash denim bustier with front zip closure & structured panel stitching.',
  },
  {
    id: 'leopard-pants',
    name: 'Leopard Wide-Leg Trousers',
    tag: 'Bottoms',
    price_inr: 799,
    price_usd: 24.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.06 PM.jpeg',
    desc: 'Classic animal print wide-leg trousers in black & beige. Bold statement bottom.',
  },
  {
    id: 'gingham-top',
    name: 'Pastel Gingham Smocked Top',
    tag: 'Crop Top',
    price_inr: 699,
    price_usd: 19.99,
    image: 'WhatsApp Image 2026-06-20 at 12.24.07 PM (2).jpeg',
    desc: 'Pink & purple gingham crop top with smocked bodice & adjustable straps.',
  },
];

async function uploadImage(imageFileName) {
  const filePath = path.join(__dirname, '../../public/products', imageFileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: Image file not found: ${filePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const key = `products/${imageFileName}`;
  
  console.log(`Uploading ${imageFileName} to Supabase S3...`);
  
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: 'image/jpeg',
    }));

    // The public URL to access the image in Supabase
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${key}`;
  } catch (err) {
    console.error(`Failed to upload ${imageFileName}:`, err.message);
    throw err;
  }
}

async function main() {
  try {
    console.log("Seeding started...");
    
    // 1. Insert Categories
    console.log("Inserting categories...");
    const { data: catData, error: catErr } = await supabase
      .from('categories')
      .upsert([
        { name: 'Statement Tops', slug: 'tops' },
        { name: 'Pop Culture Socks', slug: 'socks' }
      ], { onConflict: 'slug' })
      .select();

    if (catErr) throw catErr;
    console.log("Categories processed successfully:", catData);

    const socksCat = catData.find(c => c.slug === 'socks');
    const topsCat = catData.find(c => c.slug === 'tops');

    if (!socksCat || !topsCat) {
      throw new Error("Could not retrieve created category IDs.");
    }

    // 2. Process Socks
    console.log("Processing socks...");
    for (const item of socks) {
      const url = await uploadImage(item.image);
      if (!url) continue;

      const { error: prodErr } = await supabase
        .from('products')
        .upsert({
          slug: item.id,
          name: item.name,
          description: item.desc,
          price_inr: item.price_inr,
          price_usd: item.price_usd,
          image_url: url,
          tag: item.tag,
          category_id: socksCat.id
        }, { onConflict: 'slug' });

      if (prodErr) {
        console.error(`Error inserting sock product ${item.name}:`, prodErr);
      } else {
        console.log(`Sock inserted: ${item.name}`);
      }
    }

    // 3. Process Tops
    console.log("Processing tops...");
    for (const item of tops) {
      const url = await uploadImage(item.image);
      if (!url) continue;

      const { error: prodErr } = await supabase
        .from('products')
        .upsert({
          slug: item.id,
          name: item.name,
          description: item.desc,
          price_inr: item.price_inr,
          price_usd: item.price_usd,
          image_url: url,
          tag: item.tag,
          category_id: topsCat.id
        }, { onConflict: 'slug' });

      if (prodErr) {
        console.error(`Error inserting top product ${item.name}:`, prodErr);
      } else {
        console.log(`Top inserted: ${item.name}`);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding execution failed:", err);
  }
}

main();
