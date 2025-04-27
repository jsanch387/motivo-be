import { getSupabaseClient } from 'src/common/supabase/supabase.client';
import { v4 as uuidv4 } from 'uuid';

export async function uploadLogoBufferToStorage(
  userId: string,
  fileBuffer: Buffer,
): Promise<string> {
  const supabase = getSupabaseClient();

  const filePath = `logos/${userId}/${uuidv4()}.png`;

  const { error } = await supabase.storage
    .from('logos')
    .upload(filePath, fileBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload logo to Supabase: ${error.message}`);
  }

  const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
  return data.publicUrl;
}
