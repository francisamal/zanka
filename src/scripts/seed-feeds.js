const { createClient } = require('@supabase/supabase-js');

// Read env variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleReviews = [
  {
    customer_name: 'Priya M.',
    rating: 5,
    review_text: 'Got the cutest floral dress for just ₹350! The quality is amazing for a thrifted piece. Absolutely love the handpicked collection — you can tell someone cared about every piece.',
    product_name: 'Floral Summer Dress',
    is_approved: true,
  },
  {
    customer_name: 'Ananya S.',
    rating: 4,
    review_text: 'Found a beautiful branded dress that still had the tags on! Minor loose thread on the hem but it was mentioned before I bought it. Super transparent and trustworthy. Will shop again!',
    product_name: 'Branded A-Line Dress',
    is_approved: true,
  },
  {
    customer_name: 'Ritika K.',
    rating: 5,
    review_text: 'I was skeptical about thrifted clothes but ZANKA changed my mind. The dress I got looks brand new and cost me only ₹200. The packaging was also really cute. 10/10 recommend!',
    product_name: 'Polka Dot Mini Dress',
    is_approved: true,
  },
  {
    customer_name: 'Meera J.',
    rating: 5,
    review_text: 'Affordable and stylish — my two favorite words! Got 3 dresses under ₹1000 total. Each one is unique and well-maintained. This is sustainable fashion done right.',
    is_approved: true,
  },
  {
    customer_name: 'Sneha R.',
    rating: 4,
    review_text: 'Love the concept of handpicked thrifted fashion. The bodycon dress I ordered fits perfectly and the material feels premium. Small color fade was disclosed beforehand — honesty appreciated!',
    product_name: 'Black Bodycon Dress',
    is_approved: true,
  },
  {
    customer_name: 'Divya P.',
    rating: 5,
    review_text: 'Best thrift store online! Every dress is carefully selected and you can see the effort. Got a stunning maxi dress for ₹450. My friends couldn\'t believe it was thrifted!',
    product_name: 'Maxi Dress',
    is_approved: true,
  },
];

const samplePosts = [
  {
    author_name: 'Kavya D.',
    content: 'Styled my ZANKA thrift find for a brunch date! This ₹300 dress is getting more compliments than my designer pieces 😍',
    instagram_handle: '@kavya.styles',
    is_approved: true,
  },
  {
    author_name: 'Roshni T.',
    content: 'Thrifting is not just budget-friendly, it\'s planet-friendly! Loving my pre-loved finds from ZANKA. Each piece tells a story 🌿✨',
    instagram_handle: '@roshni.thrifts',
    is_approved: true,
  },
  {
    author_name: 'Aisha N.',
    content: 'My entire outfit today cost less than ₹500 thanks to ZANKA! Who says you can\'t look expensive on a budget? 💅',
    instagram_handle: '@aisha.ootd',
    is_approved: true,
  },
  {
    author_name: 'Tanvi M.',
    content: 'Just received my ZANKA package and the curation is *chef\'s kiss*! Every dress is handpicked and it shows. Already planning my next order 🛍️',
    is_approved: true,
  },
];

async function createTables() {
  console.log("Creating tables via Supabase RPC...");

  // Create reviews table
  const { error: reviewsErr } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT NOT NULL,
        product_name TEXT,
        image_url TEXT,
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `
  });

  if (reviewsErr) {
    console.log("Note: Could not create reviews table via RPC (may need manual creation):", reviewsErr.message);
    console.log("Please create the table manually in Supabase SQL Editor with:");
    console.log(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT NOT NULL,
        product_name TEXT,
        image_url TEXT,
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
  } else {
    console.log("Reviews table created successfully.");
  }

  // Create community_posts table
  const { error: postsErr } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS community_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        author_name TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        instagram_handle TEXT,
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `
  });

  if (postsErr) {
    console.log("Note: Could not create community_posts table via RPC (may need manual creation):", postsErr.message);
    console.log("Please create the table manually in Supabase SQL Editor with:");
    console.log(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        author_name TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        instagram_handle TEXT,
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
  } else {
    console.log("Community posts table created successfully.");
  }
}

async function seedData() {
  console.log("\nSeeding sample reviews...");
  
  for (const review of sampleReviews) {
    const { error } = await supabase
      .from('reviews')
      .upsert(review, { onConflict: 'customer_name,review_text' })
      .select();

    if (error) {
      // Try simple insert if upsert fails (no unique constraint)
      const { error: insertErr } = await supabase
        .from('reviews')
        .insert(review);
      
      if (insertErr) {
        console.error(`Failed to insert review by ${review.customer_name}:`, insertErr.message);
      } else {
        console.log(`Review inserted: ${review.customer_name}`);
      }
    } else {
      console.log(`Review upserted: ${review.customer_name}`);
    }
  }

  console.log("\nSeeding sample community posts...");

  for (const post of samplePosts) {
    const { error } = await supabase
      .from('community_posts')
      .upsert(post, { onConflict: 'author_name,content' })
      .select();

    if (error) {
      const { error: insertErr } = await supabase
        .from('community_posts')
        .insert(post);
      
      if (insertErr) {
        console.error(`Failed to insert post by ${post.author_name}:`, insertErr.message);
      } else {
        console.log(`Post inserted: ${post.author_name}`);
      }
    } else {
      console.log(`Post upserted: ${post.author_name}`);
    }
  }
}

async function main() {
  try {
    await createTables();
    await seedData();
    console.log("\nFeeds seeding completed!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

main();
