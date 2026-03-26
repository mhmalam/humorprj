import { createServiceClient } from '@/lib/supabase-service'

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
type LookupRow = { id: number; slug: string | null; description?: string | null }
type ModelRow = { id: number; name: string | null; provider_model_id: string | null; is_temperature_supported?: boolean | null }

function safeStr(v: unknown) {
  if (v == null) return '—'
  return String(v)
}

function badge(text: string, tone: 'green' | 'purple' | 'slate' = 'slate') {
  const cls =
    tone === 'green'
      ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)]'
      : tone === 'purple'
        ? 'border-fuchsia-400/40 text-fuchsia-200 bg-fuchsia-400/10'
        : 'border-[var(--border)] text-[var(--text-muted)] bg-transparent'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${cls}`}
    >
      {text}
    </span>
  )
}

export default async function AdminHumorFlavorStepsPage() {
  const service = createServiceClient()
  const [
    { data: flavors, error: flavorsErr },
    { data: steps, error: stepsErr },
    { data: llmModels, error: modelsErr },
    { error: inErr },
    { error: outErr },
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
    service.from('llm_input_types').select('id').limit(1),
    service.from('llm_output_types').select('id').limit(1),
    service
      .from('humor_flavor_step_types')
      .select('id, slug, description')
      .order('id', { ascending: true })
      .limit(200),
  ])

  const error =
    flavorsErr ?? stepsErr ?? modelsErr ?? inErr ?? outErr ?? stepTypesErr ?? null

  return (
    <>
      {error ? (
        <div className="p-6 text-[13px] text-red-300">Failed to load: {error.message}</div>
      ) : (
        (() => {
          const flavorRows = (flavors ?? []) as FlavorRow[]
          const stepRows = (steps ?? []) as StepRow[]
          const modelRows = (llmModels ?? []) as ModelRow[]
          const stepTypeRows = (stepTypes ?? []) as LookupRow[]

          const flavorSlugById = new Map(flavorRows.map((f) => [f.id, f.slug]))
          const modelNameById = new Map(modelRows.map((m) => [m.id, m.name]))
          const stepTypeSlugById = new Map(stepTypeRows.map((t) => [t.id, t.slug]))

          const sorted = [...stepRows].sort((a, b) => {
            const fa = flavorSlugById.get(a.humor_flavor_id) ?? a.humor_flavor_id
            const fb = flavorSlugById.get(b.humor_flavor_id) ?? b.humor_flavor_id
            if (fa !== fb) return fa.localeCompare(fb)
            if (a.order_by !== b.order_by) return a.order_by - b.order_by
            return a.id.localeCompare(b.id)
          })

          return (
            <div className="space-y-8 text-[13px] text-[var(--text-dim)]">
              <div>
                <h1 className="text-[24px] font-medium text-white">Humor Flavor Steps</h1>
                <p className="mt-1 text-[12px] text-[var(--text-dim)]">
                  View all flavor steps with their configurations. {sorted.length} total.
                </p>
              </div>

              <section className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[8px] overflow-auto">
                <table className="min-w-full text-[13px]">
                  <thead className="sticky top-0 bg-slate-950/40 backdrop-blur border-b border-[var(--border)]">
                    <tr className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Flavor</th>
                      <th className="px-4 py-3 text-left">Step Type</th>
                      <th className="px-4 py-3 text-left">Order</th>
                      <th className="px-4 py-3 text-left">Model</th>
                      <th className="px-4 py-3 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((s) => {
                      const flavorSlug = flavorSlugById.get(s.humor_flavor_id) ?? s.humor_flavor_id
                      const stepTypeSlug = stepTypeSlugById.get(s.humor_flavor_step_type_id) ?? null
                      const modelName = modelNameById.get(s.llm_model_id) ?? null
                      return (
                        <tr key={s.id} className="border-b border-[#111111] hover:bg-[#0f0f0f] transition-colors">
                          <td className="px-4 py-3 text-[12px] text-[var(--text-primary)] whitespace-nowrap">
                            {safeStr(s.id)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{badge(safeStr(flavorSlug), 'slate')}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {stepTypeSlug ? badge(safeStr(stepTypeSlug), 'purple') : '—'}
                          </td>
                          <td className="px-4 py-3 text-[12px] text-[var(--text-primary)] whitespace-nowrap">
                            {safeStr(s.order_by)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {modelName ? badge(safeStr(modelName), 'green') : badge(`model ${s.llm_model_id}`, 'green')}
                          </td>
                          <td className="px-4 py-3 text-[12px] text-[var(--text-primary)]">
                            {s.description ? safeStr(s.description) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                    {sorted.length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-[var(--text-muted)]" colSpan={6}>
                          no humor_flavor_steps rows found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </section>
            </div>
          )
        })()
      )}
    </>
  )
}

