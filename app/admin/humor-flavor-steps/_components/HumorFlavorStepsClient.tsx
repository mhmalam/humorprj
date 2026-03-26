'use client'

import { useMemo, useState } from 'react'
import { createStep, deleteStep, moveStep, updateStep } from '@/app/admin/humor-flavor-steps/actions'

type Flavor = { id: string; slug: string; description: string | null }

type Step = {
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

function safeStr(v: unknown) {
  if (v == null) return '—'
  return String(v)
}

function badge(text: string, tone: 'green' | 'cyan' | 'purple' | 'amber' | 'slate' = 'slate') {
  const cls =
    tone === 'green'
      ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)]'
      : tone === 'cyan'
        ? 'border-cyan-400/40 text-cyan-200 bg-cyan-400/10'
        : tone === 'purple'
          ? 'border-fuchsia-400/40 text-fuchsia-200 bg-fuchsia-400/10'
          : tone === 'amber'
            ? 'border-amber-400/40 text-amber-200 bg-amber-400/10'
            : 'border-[var(--border)] text-[var(--text-muted)] bg-transparent'

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${cls}`}>
      {text}
    </span>
  )
}

function flavorLabel(f: Flavor) {
  return f.slug || f.id
}

export default function HumorFlavorStepsClient({
  flavors,
  steps,
  llmModels,
  llmInputTypes,
  llmOutputTypes,
  stepTypes,
}: {
  flavors: Flavor[]
  steps: Step[]
  llmModels: ModelRow[]
  llmInputTypes: LookupRow[]
  llmOutputTypes: LookupRow[]
  stepTypes: LookupRow[]
}) {
  const modelById = new Map(llmModels.map((m) => [m.id, m]))
  const inById = new Map(llmInputTypes.map((t) => [t.id, t]))
  const outById = new Map(llmOutputTypes.map((t) => [t.id, t]))
  const stepTypeById = new Map(stepTypes.map((t) => [t.id, t]))

  const [selectedFlavorId, setSelectedFlavorId] = useState<string>(flavors[0]?.id ?? '')

  const flavorSteps = useMemo(() => {
    const list = steps.filter((s) => s.humor_flavor_id === selectedFlavorId)
    return [...list].sort((a, b) => a.order_by - b.order_by)
  }, [steps, selectedFlavorId])

  return (
    <div className="space-y-8 text-[13px] text-[var(--text-dim)]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-[#1f3a2a]">
          <span className="text-[var(--accent)]">{'//'}</span> humor flavor steps
        </div>
        <h1 className="mt-2 text-[24px] font-medium text-white">
          <span className="text-[var(--accent)] font-normal">$ </span>
          <span className="font-medium">humor-flavor-steps</span>
        </h1>
        <p className="mt-2 text-[12px] text-[var(--text-dim)]">
          Create and edit steps backed by <code className="text-[var(--accent)]">humor_flavor_steps</code>.
        </p>
      </div>

      <section className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] p-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">add step</div>
            <p className="mt-1 text-[12px] text-[var(--text-dim)]">
              Defaults: model 6, input 1, output 1, step type 3, temperature 1.
            </p>
          </div>
          <div className="min-w-[240px]">
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
              editing flavor
            </label>
            <select
              value={selectedFlavorId}
              onChange={(e) => setSelectedFlavorId(e.target.value)}
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {flavors.map((f) => (
                <option key={f.id} value={f.id}>
                  {flavorLabel(f)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <form action={createStep} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
              humor flavor
            </label>
            <input type="hidden" name="humor_flavor_id" value={selectedFlavorId} />
            <div className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)]">
              {flavorLabel(flavors.find((f) => f.id === selectedFlavorId) ?? flavors[0])}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">model</label>
            <select
              name="llm_model_id"
              required
              defaultValue={6}
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {llmModels
                .filter((m) => m.id !== 54)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {safeStr(m.name)} {m.provider_model_id ? `(${m.provider_model_id})` : ''}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
              input type
            </label>
            <select
              name="llm_input_type_id"
              required
              defaultValue={1}
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {llmInputTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {safeStr(t.slug)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
              output type
            </label>
            <select
              name="llm_output_type_id"
              required
              defaultValue={1}
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {llmOutputTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {safeStr(t.slug)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
              step type
            </label>
            <select
              name="humor_flavor_step_type_id"
              required
              defaultValue={3}
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {stepTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {safeStr(t.slug)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
              temperature (optional)
            </label>
            <input
              name="llm_temperature"
              defaultValue="1"
              placeholder="1"
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
              description (optional)
            </label>
            <input
              name="description"
              placeholder="Optional short description"
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
              system prompt (optional)
            </label>
            <textarea
              name="llm_system_prompt"
              rows={3}
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent)]"
              placeholder="You are..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
              user prompt (optional)
            </label>
            <textarea
              name="llm_user_prompt"
              rows={3}
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent)]"
              placeholder="Describe the image..."
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end">
            <button className="border border-[var(--accent)] bg-transparent px-[14px] py-[8px] text-[11px] font-mono font-semibold tracking-[0.16em] uppercase text-[var(--accent)] hover:bg-[var(--accent-dim)]">
              create step
            </button>
          </div>
        </form>
      </section>

      <section className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] overflow-auto">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between gap-4">
          <div className="text-[12px] text-[var(--text-primary)]">steps</div>
          <div className="text-[11px] text-[var(--text-muted)]">showing {flavorSteps.length} row(s)</div>
        </div>

        <div className="divide-y divide-[#111111]">
          {flavorSteps.map((s) => {
            const model = modelById.get(s.llm_model_id)
            const inT = inById.get(s.llm_input_type_id)
            const outT = outById.get(s.llm_output_type_id)
            const st = stepTypeById.get(s.humor_flavor_step_type_id)
            const flavor = flavors.find((f) => f.id === s.humor_flavor_id)

            return (
              <div key={s.id} className="p-5 space-y-3 hover:bg-[#0f0f0f]">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      id: <span className="text-[var(--text-primary)]">{s.id}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {badge(flavor ? flavorLabel(flavor) : s.humor_flavor_id, 'slate')}
                      {badge(`order ${s.order_by}`, 'slate')}
                      {badge(model?.name ? safeStr(model.name) : `model ${s.llm_model_id}`, 'green')}
                      {badge(inT?.slug ? safeStr(inT.slug) : `input ${s.llm_input_type_id}`, 'cyan')}
                      {badge(outT?.slug ? safeStr(outT.slug) : `output ${s.llm_output_type_id}`, 'purple')}
                      {badge(st?.slug ? safeStr(st.slug) : `type ${s.humor_flavor_step_type_id}`, 'amber')}
                      {typeof s.llm_temperature === 'number' ? badge(`temp ${s.llm_temperature}`, 'slate') : null}
                      {s.description ? badge(s.description, 'slate') : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <form action={moveStep}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button className="border border-[var(--border)] bg-transparent px-3 py-2 text-[11px] text-[var(--text-primary)] hover:bg-[#111111]">
                        ↑
                      </button>
                    </form>
                    <form action={moveStep}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button className="border border-[var(--border)] bg-transparent px-3 py-2 text-[11px] text-[var(--text-primary)] hover:bg-[#111111]">
                        ↓
                      </button>
                    </form>
                    <form action={deleteStep}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="border border-red-500/60 bg-transparent px-3 py-2 text-[11px] text-red-300 hover:bg-red-500/10">
                        delete
                      </button>
                    </form>
                  </div>
                </div>

                <form action={updateStep} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="hidden" name="id" value={s.id} />

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                      model
                    </label>
                    <select
                      name="llm_model_id"
                      required
                      defaultValue={s.llm_model_id}
                      className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    >
                      {llmModels
                        .filter((m) => m.id !== 54)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {safeStr(m.name)} {m.provider_model_id ? `(${m.provider_model_id})` : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                      temperature (optional)
                    </label>
                    <input
                      name="llm_temperature"
                      defaultValue={s.llm_temperature == null ? '' : String(s.llm_temperature)}
                      placeholder="1"
                      className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                      input type
                    </label>
                    <select
                      name="llm_input_type_id"
                      required
                      defaultValue={s.llm_input_type_id}
                      className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    >
                      {llmInputTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {safeStr(t.slug)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                      output type
                    </label>
                    <select
                      name="llm_output_type_id"
                      required
                      defaultValue={s.llm_output_type_id}
                      className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    >
                      {llmOutputTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {safeStr(t.slug)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                      step type
                    </label>
                    <select
                      name="humor_flavor_step_type_id"
                      required
                      defaultValue={s.humor_flavor_step_type_id}
                      className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    >
                      {stepTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {safeStr(t.slug)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                      description (optional)
                    </label>
                    <input
                      name="description"
                      defaultValue={s.description ?? ''}
                      placeholder="Optional short description"
                      className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                      system prompt (optional)
                    </label>
                    <textarea
                      name="llm_system_prompt"
                      rows={3}
                      defaultValue={s.llm_system_prompt ?? ''}
                      className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                      user prompt (optional)
                    </label>
                    <textarea
                      name="llm_user_prompt"
                      rows={3}
                      defaultValue={s.llm_user_prompt ?? ''}
                      className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center justify-end">
                    <button className="border border-[var(--border)] bg-transparent px-3 py-2 text-[11px] text-[var(--text-primary)] hover:bg-[#111111]">
                      save changes
                    </button>
                  </div>
                </form>
              </div>
            )
          })}

          {flavorSteps.length === 0 ? (
            <div className="p-6 text-[13px] text-[var(--text-muted)]">no humor_flavor_steps rows found.</div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

