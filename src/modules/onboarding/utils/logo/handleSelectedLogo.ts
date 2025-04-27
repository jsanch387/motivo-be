// /* eslint-disable @typescript-eslint/no-unsafe-return */
// import { DatabaseService } from 'src/common/database/database.service';
// import { SaveOnboardingDto } from '../../dto/save-onboarding.dto';
// import { uploadLogoBufferToStorage } from './uploadLogoToStorage';
// import { insertGeneratedLogo } from 'src/modules/ai/helpers/logo.helpers';

// export async function handleSelectedLogo(
//   userId: string,
//   data: SaveOnboardingDto,
//   db: DatabaseService,
// ): Promise<string> {
//   const url = data.selected_logo_url;

//   if (!url) {
//     throw new Error('Missing logo URL');
//   }

//   const isBase64 = url.startsWith('data:image');

//   if (!isBase64) {
//     // Already uploaded to Supabase — just return it
//     return url;
//   }

//   const base64 = url.split(',')[1];
//   if (!base64) {
//     throw new Error('Invalid base64 logo format');
//   }

//   const buffer = Buffer.from(base64, 'base64');

//   const uploadedUrl = await uploadLogoBufferToStorage(userId, buffer);

//   await insertGeneratedLogo(db, {
//     user_id: userId,
//     style: data.selected_logo_style || 'unknown',
//     image_url: uploadedUrl,
//     service_type: data.service_type || '',
//     colors: data.selected_color_palette || [],
//   });

//   return uploadedUrl;
// }
