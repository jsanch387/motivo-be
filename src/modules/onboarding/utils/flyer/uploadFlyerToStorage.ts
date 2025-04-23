import axios from 'axios';
import { getSupabaseClient } from 'src/common/supabase/supabase.client';
import { v4 as uuidv4 } from 'uuid';
import type { StorageError } from '@supabase/storage-js';

export async function uploadFlyerToStorage(
  userId: string,
  flyerUrl: string,
): Promise<string> {
  const supabase = getSupabaseClient();

  const response = await axios.get<ArrayBuffer>(flyerUrl, {
    responseType: 'arraybuffer',
  });

  const fileBuffer = Buffer.from(response.data);

  // ✅ Use clean path inside the 'flyers' bucket
  const filePath = `${userId}/${uuidv4()}.png`;

  const uploadResult: {
    data: { path: string } | null;
    error: StorageError | null;
  } = await supabase.storage.from('flyers').upload(filePath, fileBuffer, {
    contentType: 'image/png',
    upsert: true,
  });

  if (uploadResult.error) {
    throw new Error(`Upload failed: ${uploadResult.error.message}`);
  }

  const publicUrlResult = supabase.storage
    .from('flyers')
    .getPublicUrl(filePath);
  const publicUrl = publicUrlResult.data?.publicUrl;

  if (!publicUrl) {
    throw new Error('Failed to retrieve public flyer URL');
  }

  return publicUrl;
}
