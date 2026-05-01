'use server'

import { createServiceClient } from '@/lib/supabase-service'
import { getAdminViewer } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

function requireString(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing ${field}`)
  }
  return value.trim()
}

export async function createImage(formData: FormData) {
  const gate = await getAdminViewer()
  if (!gate.ok) throw new Error('Unauthorized')
  const actingUserId = gate.viewer.userId

  const url = requireString(formData.get('url'), 'url')
  const service = createServiceClient()

  const { error } = await service
    .from('images')
    .insert({ url, created_by_user_id: actingUserId, modified_by_user_id: actingUserId })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/images')
  revalidatePath('/admin')
}

export async function uploadImage(formData: FormData) {
  const gate = await getAdminViewer()
  if (!gate.ok) throw new Error('Unauthorized')
  const actingUserId = gate.viewer.userId

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) throw new Error('No file provided')

  const service = createServiceClient()

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const BUCKET = 'admin-images'

  // Ensure bucket exists (create as public if missing)
  const { data: buckets } = await service.storage.listBuckets()
  const bucketExists = (buckets ?? []).some((b) => b.name === BUCKET)
  if (!bucketExists) {
    const { error: createErr } = await service.storage.createBucket(BUCKET, { public: true })
    if (createErr && !createErr.message.includes('already exists')) {
      throw new Error(`Could not create storage bucket: ${createErr.message}`)
    }
  }

  const { error: uploadError } = await service.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType: file.type || 'image/jpeg', upsert: false })

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  const {
    data: { publicUrl },
  } = service.storage.from(BUCKET).getPublicUrl(filename)

  const { error: dbError } = await service
    .from('images')
    .insert({ url: publicUrl, created_by_user_id: actingUserId, modified_by_user_id: actingUserId })
  if (dbError) throw new Error(dbError.message)

  revalidatePath('/admin/images')
  revalidatePath('/admin')
}

export async function updateImage(formData: FormData) {
  const gate = await getAdminViewer()
  if (!gate.ok) throw new Error('Unauthorized')
  const actingUserId = gate.viewer.userId

  const id = requireString(formData.get('id'), 'id')
  const url = requireString(formData.get('url'), 'url')
  const service = createServiceClient()

  const { error } = await service
    .from('images')
    .update({ url, modified_by_user_id: actingUserId })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/images')
  revalidatePath('/admin')
}

export async function deleteImage(formData: FormData) {
  const gate = await getAdminViewer()
  if (!gate.ok) throw new Error('Unauthorized')

  const id = requireString(formData.get('id'), 'id')
  const service = createServiceClient()

  const { error } = await service.from('images').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/images')
  revalidatePath('/admin')
}
