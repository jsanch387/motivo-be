// src/common/supabase/uploadFlyerBufferToStorage.ts

import { getSupabaseClient } from 'src/common/supabase/supabase.client';
import { v4 as uuidv4 } from 'uuid';

export async function uploadFlyerBufferToStorage(
  userId: string,
  buffer: Buffer,
): Promise<string> {
  const supabase = getSupabaseClient();
  const filePath = `${userId}/${uuidv4()}.png`;

  const { error } = await supabase.storage
    .from('flyers')
    .upload(filePath, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload flyer: ${error.message}`);
  }

  const { data } = supabase.storage.from('flyers').getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error('Failed to get public flyer URL');
  }

  return data.publicUrl;
}
