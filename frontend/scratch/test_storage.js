import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vysfftmiwqytwwqzdpvz.supabase.co';
const supabaseKey = 'sb_publishable_Hy6i2yL2is6metCzr_eOyw_epnHmig9'; // VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  const dummyFile = Buffer.from('hello world');
  
  console.log('Testing upload to product-images...');
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('product-images')
    .upload('test_temp.txt', dummyFile, {
      contentType: 'text/plain',
      upsert: true
    });
    
  if (uploadErr) {
    console.error('Upload to product-images failed:', uploadErr);
  } else {
    console.log('Upload to product-images succeeded:', uploadData);
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl('test_temp.txt');
    console.log('Public URL:', urlData.publicUrl);
  }

  console.log('\nTesting upload to avatars...');
  const { data: avData, error: avErr } = await supabase.storage
    .from('avatars')
    .upload('test_temp.txt', dummyFile, {
      contentType: 'text/plain',
      upsert: true
    });
    
  if (avErr) {
    console.error('Upload to avatars failed:', avErr);
  } else {
    console.log('Upload to avatars succeeded:', avData);
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl('test_temp.txt');
    console.log('Public URL:', urlData.publicUrl);
  }
}

testUpload();
