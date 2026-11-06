import { supabase } from '@/lib/supabase'

export async function uploadDesignToSupabase(fileOrBlob: File | Blob, customFileName?: string): Promise<string | null> {
  try {
    const fileName = customFileName || `design-${Date.now()}.png`
    const filePath = `user-uploads/${fileName}`

    // Upload file ke bucket 'designs' di Supabase Storage
    const { data, error } = await supabase.storage
      .from('designs')
      .upload(filePath, fileOrBlob, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('Gagal mengunggah desain:', error.message)
      return null
    }

    // Ambil Public URL dari file yang baru di-upload
    const { data: publicUrlData } = supabase.storage
      .from('designs')
      .getPublicUrl(data.path)

    return publicUrlData.publicUrl
  } catch (err) {
    console.error('Error saat upload desain:', err)
    return null
  }
}