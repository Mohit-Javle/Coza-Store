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

  const user = authData.user;
  const dummyFile = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C63000100000500010D0A2D140000000049454E44AE426082', 'hex'); // Mock 1x1 PNG pixel
  const path = `${user.id}/test_avatar.png`;

  console.log(`Uploading to avatars bucket at path: ${path}...`);
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('avatars')
    .upload(path, dummyFile, {
      contentType: 'image/png'
    });

  if (uploadErr) {
    console.error('Upload failed:', uploadErr);
  } else {
    console.log('Upload succeeded:', uploadData);
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
    console.log('Public URL:', urlData.publicUrl);
  }
}

run();
