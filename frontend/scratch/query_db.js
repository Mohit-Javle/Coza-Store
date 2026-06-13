import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vysfftmiwqytwwqzdpvz.supabase.co';
const supabaseKey = 'sb_publishable_Hy6i2yL2is6metCzr_eOyw_epnHmig9'; // VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking profiles...');
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*');
  
  if (pError) {
    console.error('Profiles select error:', pError);
  } else {
    console.log(`Found ${profiles.length} profiles:`);
    console.log(JSON.stringify(profiles, null, 2));
  }

  console.log('\nChecking products...');
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*');
  
  if (prodError) {
    console.error('Products select error:', prodError);
  } else {
    console.log(`Found ${products.length} products:`);
    console.log(JSON.stringify(products, null, 2));
  }

  console.log('\nChecking bids...');
  const { data: bids, error: bidsError } = await supabase
    .from('bids')
    .select('*');
  
  if (bidsError) {
    console.error('Bids select error:', bidsError);
  } else {
    console.log(`Found ${bids.length} bids:`);
    console.log(JSON.stringify(bids, null, 2));
  }
}

check();
