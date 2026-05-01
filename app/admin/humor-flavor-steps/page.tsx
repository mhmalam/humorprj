import { createServiceClient } from '@/lib/supabase-service'
import HumorFlavorStepsClient from './_components/HumorFlavorStepsClient'

type FlavorRow = { id: string; slug: string; description: string | null }
type StepRow = {
  id: string
  humor_flavor_id: string
  order_by: number
  llm_input_type_id: number
  llm_output_type_id: number
  llm_model_id: number
  humor_flavor_step_type_id: number
  llm_temperature: number | null
  llm_system_prompt: string | null
  llm_user_prompt: string | null
  description: string | null
}
type LookupRow = { id: number; slug?: string | null; description?: string | null; name?: string | null }
type ModelRow = { id: number; name: string | null; provider_model_id: string | null; is_temperature_supported?: boolean | null }

export default async function AdminHumorFlavorStepsPage() {
  const service = createServiceClient()
  const [
    { data: flavors, error: flavorsErr },
    { data: steps, error: stepsErr },
    { data: llmModels, error: modelsErr },
    { data: llmInputTypes },
    { data: llmOutputTypes },
    { data: stepTypes, error: stepTypesErr },
  ] = await Promise.all([
    service.from('humor_flavors').select('id, slug, description').order('id', { ascending: true }).limit(500),
    service
      .from('humor_flavor_steps')
      .select(
        'id, humor_flavor_id, order_by, llm_input_type_id, llm_output_type_id, llm_model_id, humor_flavor_step_type_id, llm_temperature, llm_system_prompt, llm_user_prompt, description'
      )
      .order('humor_flavor_id', { ascending: true })
      .order('order_by', { ascending: true })
      .limit(2000),
    service
      .from('llm_models')
      .select('id, name, provider_model_id, is_temperature_supported')
      .order('id', { ascending: true })
      .limit(500),
    service.from('llm_input_types').select('id, slug, description').order('id', { ascending: true }).limit(200),
    service.from('llm_output_types').select('id, slug, description').order('id', { ascending: true }).limit(200),
    service
      .from('humor_flavor_step_types')
      .select('id, slug, description')
      .order('id', { ascending: true })
      .limit(200),
  ])

  const error = flavorsErr ?? stepsErr ?? modelsErr ?? stepTypesErr ?? null

  if (error) {
    return <div className="p-6 text-[13px] text-red-300">Failed to load: {error.message}</div>
  }

  return (
    <HumorFlavorStepsClient
      flavors={(flavors ?? []) as FlavorRow[]}
      steps={(steps ?? []) as StepRow[]}
      llmModels={(llmModels ?? []) as ModelRow[]}
      llmInputTypes={(llmInputTypes ?? []) as LookupRow[]}
      llmOutputTypes={(llmOutputTypes ?? []) as LookupRow[]}
      stepTypes={(stepTypes ?? []) as LookupRow[]}
    />
  )
}
