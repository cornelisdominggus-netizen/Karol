import { supabase } from '@/lib/supabase'

const BUCKET = 'designs'

function publicUrl(path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// Unggah satu file desain ke Supabase Storage, lalu kembalikan link publiknya
export async function uploadDesign(file: File, side: 'front' | 'back'): Promise<string> {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `custom/${Date.now()}-${crypto.randomUUID()}-${side}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  return publicUrl(path)
}

// Unggah hasil potret mockup 3D (depan/belakang)
export async function uploadMockupImage(blob: Blob, side: 'front' | 'back'): Promise<string> {
  const path = `mockups/${Date.now()}-${crypto.randomUUID()}-${side}.png`

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/png',
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  return publicUrl(path)
}