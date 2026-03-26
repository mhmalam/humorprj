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

