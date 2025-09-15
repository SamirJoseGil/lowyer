import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not defined. Check your .env file.');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined. Check your .env file.');
}

// Validar que la URL sea válida
if (!supabaseUrl.startsWith('https://') && !supabaseUrl.startsWith('http://')) {
  throw new Error(`Invalid SUPABASE_URL: ${supabaseUrl}. Must be a valid HTTP or HTTPS URL.`);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, uint8Array, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return { success: false, error: 'Error al subir el avatar' };
  }
}

export async function uploadLawyerDocument(
  file: File,
  lawyerId: string,
  docType: string
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${lawyerId}/${docType}_${Date.now()}.${fileExt}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('lawyer-documents')
      .upload(fileName, uint8Array, {
        contentType: file.type,
      });

    if (error) {
      console.error('Error uploading document:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('lawyer-documents')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error in uploadLawyerDocument:', error);
    return { success: false, error: 'Error al subir el documento' };
  }
}

export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
}

// Validate file type and size
export function validateFile(file: File, type: 'avatar' | 'document'): { valid: boolean; error?: string } {
  const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for avatars, 10MB for documents
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `El archivo es demasiado grande. Máximo ${type === 'avatar' ? '5MB' : '10MB'}`
    };
  }

  const allowedTypes = type === 'avatar' 
    ? ['image/jpeg', 'image/png', 'image/webp']
    : ['application/pdf', 'image/jpeg', 'image/png'];

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: type === 'avatar' 
        ? 'Solo se permiten imágenes (JPG, PNG, WebP)'
        : 'Solo se permiten archivos PDF o imágenes'
    };
  }

  return { valid: true };
}
