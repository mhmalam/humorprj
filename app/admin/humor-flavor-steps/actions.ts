'use server'

import { getAdminViewer } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase-service'
import { revalidatePath } from 'next/cache'

export type HumorFlavorStepEditable = {
  llm_model_id: number
  llm_input_type_id: number
  llm_output_type_id: number
  humor_flavor_step_type_id: number
  llm_temperature: number | null
  llm_system_prompt: string | null
  llm_user_prompt: string | null
  description: string | null
}

function parseRequiredInt(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing ${field}`)
  }
  const n = Number(value)
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error(`Invalid ${field}`)
  }
  return n
}

function parseOptionalNumber(value: FormDataEntryValue | null, field: string) {
  if (value == null) return null
  if (typeof value !== 'string') throw new Error(`Invalid ${field}`)
  const trimmed = value.trim()
  if (trimmed === '') return null
  const n = Number(trimmed)
  if (!Number.isFinite(n)) throw new Error(`Invalid ${field}`)
  return n
}

function parseOptionalString(value: FormDataEntryValue | null) {
  if (value == null) return null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function requireString(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing ${field}`)
  }
  return value.trim()
}

async function requireActingUserId() {
  const gate = await getAdminViewer()
  if (!gate.ok) throw new Error('Unauthorized')
  return gate.viewer.userId
}

export async function createStep(formData: FormData) {
  const actingUserId = await requireActingUserId()
  const humorFlavorId = requireString(formData.get('humor_flavor_id'), 'humor_flavor_id')

  const data: HumorFlavorStepEditable = {
    llm_model_id: parseRequiredInt(formData.get('llm_model_id'), 'llm_model_id'),
    llm_input_type_id: parseRequiredInt(formData.get('llm_input_type_id'), 'llm_input_type_id'),
    llm_output_type_id: parseRequiredInt(formData.get('llm_output_type_id'), 'llm_output_type_id'),
    humor_flavor_step_type_id: parseRequiredInt(
      formData.get('humor_flavor_step_type_id'),
      'humor_flavor_step_type_id'
    ),
    llm_temperature: parseOptionalNumber(formData.get('llm_temperature'), 'llm_temperature'),
    llm_system_prompt: parseOptionalString(formData.get('llm_system_prompt')),
    llm_user_prompt: parseOptionalString(formData.get('llm_user_prompt')),
    description: parseOptionalString(formData.get('description')),
  }

  const service = createServiceClient()

  const { data: maxRow, error: maxErr } = await service
    .from('humor_flavor_steps')
    .select('order_by')
    .eq('humor_flavor_id', humorFlavorId)
    .order('order_by', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (maxErr) throw new Error(maxErr.message)
  const currentMax = (maxRow as { order_by?: number | null } | null)?.order_by
  const nextOrderBy = (typeof currentMax === 'number' ? currentMax : 0) + 1

  const { error } = await service.from('humor_flavor_steps').insert({
    humor_flavor_id: humorFlavorId,
    order_by: nextOrderBy,
    ...data,
    created_by_user_id: actingUserId,
    modified_by_user_id: actingUserId,
  } as never)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/humor-flavor-steps')
}

export async function updateStep(formData: FormData) {
  const actingUserId = await requireActingUserId()
  const id = requireString(formData.get('id'), 'id')

  const data: HumorFlavorStepEditable = {
    llm_model_id: parseRequiredInt(formData.get('llm_model_id'), 'llm_model_id'),
    llm_input_type_id: parseRequiredInt(formData.get('llm_input_type_id'), 'llm_input_type_id'),
    llm_output_type_id: parseRequiredInt(formData.get('llm_output_type_id'), 'llm_output_type_id'),
    humor_flavor_step_type_id: parseRequiredInt(
      formData.get('humor_flavor_step_type_id'),
      'humor_flavor_step_type_id'
    ),
    llm_temperature: parseOptionalNumber(formData.get('llm_temperature'), 'llm_temperature'),
    llm_system_prompt: parseOptionalString(formData.get('llm_system_prompt')),
    llm_user_prompt: parseOptionalString(formData.get('llm_user_prompt')),
    description: parseOptionalString(formData.get('description')),
  }

  const service = createServiceClient()
  const { error } = await service
    .from('humor_flavor_steps')
    .update({ ...data, modified_by_user_id: actingUserId } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/humor-flavor-steps')
}

export async function moveStep(formData: FormData) {
  await requireActingUserId()
  const id = requireString(formData.get('id'), 'id')
  const direction = requireString(formData.get('direction'), 'direction')
  if (direction !== 'up' && direction !== 'down') throw new Error('Invalid direction')

  const service = createServiceClient()
  const { data: step, error: stepErr } = await service
    .from('humor_flavor_steps')
    .select('id, humor_flavor_id, order_by')
    .eq('id', id)
    .maybeSingle()

  if (stepErr) throw new Error(stepErr.message)
  const typed = step as { id: string; humor_flavor_id: string; order_by: number } | null
  if (!typed) throw new Error('Step not found')

  const neighborQuery = service
    .from('humor_flavor_steps')
    .select('id, order_by')
    .eq('humor_flavor_id', typed.humor_flavor_id)

  const { data: neighbor, error: neighborErr } =
    direction === 'up'
      ? await neighborQuery.lt('order_by', typed.order_by).order('order_by', { ascending: false }).limit(1).maybeSingle()
      : await neighborQuery.gt('order_by', typed.order_by).order('order_by', { ascending: true }).limit(1).maybeSingle()

  if (neighborErr) throw new Error(neighborErr.message)
  const n = neighbor as { id: string; order_by: number } | null
  if (!n) {
    revalidatePath('/admin/humor-flavor-steps')
    return
  }

  // Swap order values, then normalize order_by to 1..N within the flavor.
  const { error: e1 } = await service.from('humor_flavor_steps').update({ order_by: n.order_by } as never).eq('id', typed.id)
  if (e1) throw new Error(e1.message)
  const { error: e2 } = await service.from('humor_flavor_steps').update({ order_by: typed.order_by } as never).eq('id', n.id)
  if (e2) throw new Error(e2.message)

  const { data: all, error: allErr } = await service
    .from('humor_flavor_steps')
    .select('id, order_by')
    .eq('humor_flavor_id', typed.humor_flavor_id)
    .order('order_by', { ascending: true })
    .order('id', { ascending: true })

  if (allErr) throw new Error(allErr.message)
  const list = (all ?? []) as { id: string; order_by: number }[]
  for (let i = 0; i < list.length; i++) {
    const desired = i + 1
    if (list[i]?.order_by !== desired) {
      const { error: uerr } = await service
        .from('humor_flavor_steps')
        .update({ order_by: desired } as never)
        .eq('id', list[i].id)
      if (uerr) throw new Error(uerr.message)
    }
  }

  revalidatePath('/admin/humor-flavor-steps')
}

export async function deleteStep(formData: FormData) {
  await requireActingUserId()
  const id = requireString(formData.get('id'), 'id')
  const service = createServiceClient()
  const { error } = await service.from('humor_flavor_steps').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/humor-flavor-steps')
}

