import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vysfftmiwqytwwqzdpvz.supabase.co';
const supabaseKey = 'sb_publishable_Hy6i2yL2is6metCzr_eOyw_epnHmig9';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Logging in as testuser9921...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'testuser9921@test.com',
    password: 'Password123!'
  });

  if (authErr) {
    console.error('Login failed:', authErr);
    return;
  }

  console.log('Listing files in avatars bucket...');
  const { data: files, error: listErr } = await supabase.storage
    .from('avatars')
    .list('', { limit: 100 });

  if (listErr) {
    console.error('Failed to list files:', listErr);
  } else {
    console.log('Files:', files);
  }
}

run();
