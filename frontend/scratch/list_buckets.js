import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vysfftmiwqytwwqzdpvz.supabase.co';
const supabaseKey = 'sb_publishable_Hy6i2yL2is6metCzr_eOyw_epnHmig9';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Listing buckets...');
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Failed to list buckets:', error);
  } else {
    console.log('Buckets:', buckets);
  }
}

run();
