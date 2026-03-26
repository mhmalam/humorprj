'use server'

import { getAdminViewer } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase-service'
import { revalidatePath } from 'next/cache'

function requireString(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing ${field}`)
  }
  return value.trim()
}

function optionalString(value: FormDataEntryValue | null) {
  if (value == null) return null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

async function requireActingUserId() {
  const gate = await getAdminViewer()
  if (!gate.ok) throw new Error('Unauthorized')
  return gate.viewer.userId
}

export async function createFlavor(formData: FormData) {
  const actingUserId = await requireActingUserId()
  const slug = requireString(formData.get('slug'), 'slug')
  const description = optionalString(formData.get('description'))

  const service = createServiceClient()
  const { error } = await service.from('humor_flavors').insert({
    slug,
    description,
    created_by_user_id: actingUserId,
    modified_by_user_id: actingUserId,
  } as never)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/humor-flavors')
}

export async function updateFlavor(formData: FormData) {
  const actingUserId = await requireActingUserId()
  const id = requireString(formData.get('id'), 'id')
  const slug = requireString(formData.get('slug'), 'slug')
  const description = optionalString(formData.get('description'))

  const service = createServiceClient()
  const { error } = await service
    .from('humor_flavors')
    .update({ slug, description, modified_by_user_id: actingUserId } as never)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/humor-flavors')
}

export async function deleteFlavor(formData: FormData) {
  await requireActingUserId()
  const id = requireString(formData.get('id'), 'id')
  const service = createServiceClient()
  const { error } = await service.from('humor_flavors').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/humor-flavors')
}

