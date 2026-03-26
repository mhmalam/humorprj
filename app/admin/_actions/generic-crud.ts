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

export async function createRow(formData: FormData) {
  const gate = await getAdminViewer()
  if (!gate.ok) throw new Error('Unauthorized')
  const actingUserId = gate.viewer.userId

  const table = requireString(formData.get('table'), 'table')
  const payloadRaw = requireString(formData.get('payload'), 'payload')
  const revalidate = formData.get('revalidatePath')

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(payloadRaw)
  } catch (e) {
    throw new Error('Invalid JSON payload for create')
  }

  // Ensure audit fields are always set by the server (not by the client),
  // and let the DB handle datetime defaults/triggers.
  delete payload.created_datetime_utc
  delete payload.modified_datetime_utc
  delete payload.created_by_user_id
  delete payload.modified_by_user_id
  payload.created_by_user_id = actingUserId
  payload.modified_by_user_id = actingUserId

  const service = createServiceClient()
  const { error } = await service.from(table).insert(payload as never)
  if (error) throw new Error(error.message)

  if (typeof revalidate === 'string' && revalidate) {
    revalidatePath(revalidate)
  }
}

export async function updateRow(formData: FormData) {
  const gate = await getAdminViewer()
  if (!gate.ok) throw new Error('Unauthorized')
  const actingUserId = gate.viewer.userId

  const table = requireString(formData.get('table'), 'table')
  const id = requireString(formData.get('id'), 'id')
  const payloadRaw = requireString(formData.get('payload'), 'payload')
  const revalidate = formData.get('revalidatePath')

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(payloadRaw)
  } catch (e) {
    throw new Error('Invalid JSON payload for update')
  }

  // Never allow changing the primary key in this helper.
  if ('id' in payload) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (payload as Record<string, unknown>).id
  }

  // Ensure audit fields are always set by the server (not by the client),
  // and let the DB handle datetime update behavior.
  delete payload.created_datetime_utc
  delete payload.modified_datetime_utc
  delete payload.created_by_user_id
  delete payload.modified_by_user_id
  payload.modified_by_user_id = actingUserId

  const service = createServiceClient()
  const { error } = await service.from(table).update(payload as never).eq('id', id)
  if (error) throw new Error(error.message)

  if (typeof revalidate === 'string' && revalidate) {
    revalidatePath(revalidate)
  }
}

export async function deleteRow(formData: FormData) {
  const gate = await getAdminViewer()
  if (!gate.ok) throw new Error('Unauthorized')

  const table = requireString(formData.get('table'), 'table')
  const id = requireString(formData.get('id'), 'id')
  const revalidate = formData.get('revalidatePath')

  const service = createServiceClient()
  const { error } = await service.from(table).delete().eq('id', id)
  if (error) throw new Error(error.message)

  if (typeof revalidate === 'string' && revalidate) {
    revalidatePath(revalidate)
  }
}

