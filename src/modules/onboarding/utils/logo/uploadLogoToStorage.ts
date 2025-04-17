// src/common/supabase/uploadLogoToStorage.ts

import axios from 'axios';
import { getSupabaseClient } from 'src/common/supabase/supabase.client';
import { v4 as uuidv4 } from 'uuid';

export async function uploadLogoToStorage(
  userId: string,
  logoUrl: string,
): Promise<string> {
  const supabase = getSupabaseClient();

  // Download the image from the DALL·E URL
  const response = await axios.get<ArrayBuffer>(logoUrl, {
    responseType: 'arraybuffer',
  });
  const fileBuffer = Buffer.from(response.data);

  // Generate a unique filename
  const filePath = `logos/${userId}/${uuidv4()}.png`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from('logos')
    .upload(filePath, fileBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    console.error('❌ Failed to upload logo to Supabase:', error.message);
    throw new Error('Failed to upload logo to storage');
  }

  // Return public URL
  const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
  return data.publicUrl;
}
