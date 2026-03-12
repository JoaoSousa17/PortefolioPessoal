"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkillRecord = {
  id: string
  name: string
  color: string | null
  icon: string | null
  category_id: string
}

export type CategoryRecord = {
  id: string
  name: string
  order: number | null
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getTextColor(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? '#1e293b' : '#ffffff'
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SkillsPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  accentColor?: string   // tailwind color name e.g. "red" | "orange" — used for border focus
  label?: string
}

export function SkillsPicker({
  selectedIds,
  onChange,
  accentColor = "slate",
  label = "Skills",
}: SkillsPickerProps) {
  const [skills,     setSkills]     = useState<SkillRecord[]>([])
  const [categories, setCategories] = useState<CategoryRecord[]>([])
  const [loading,    setLoading]    = useState(true)
  const [collapsed,  setCollapsed]  = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const [{ data: skillsData }, { data: catsData }] = await Promise.all([
        supabase.from('skills').select('id, name, color, icon, category_id').order('name'),
        supabase.from('skill_categories').select('id, name, order').order('order'),
      ])
      setSkills(skillsData || [])
      setCategories(catsData || [])
    } catch (err) {
      console.error('SkillsPicker fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggle = (id: string) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(s => s !== id)
        : [...selectedIds, id]
    )

  const toggleCategory = (catId: string) =>
    setCollapsed(prev => ({ ...prev, [catId]: !prev[catId] }))

  const toggleAll = (catId: string) => {
    const catSkillIds = skills.filter(s => s.category_id === catId).map(s => s.id)
    const allSelected = catSkillIds.every(id => selectedIds.includes(id))
    if (allSelected) {
      onChange(selectedIds.filter(id => !catSkillIds.includes(id)))
    } else {
      const merged = Array.from(new Set([...selectedIds, ...catSkillIds]))
      onChange(merged)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-slate-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        A carregar skills...
      </div>
    )
  }

  if (skills.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic py-2">
        Nenhuma skill disponível. Adiciona skills na página de Skills.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-slate-900 font-semibold text-sm">
          {label}
          <span className="ml-1 text-xs text-slate-400 font-normal">(global)</span>
        </span>
        {selectedIds.length > 0 && (
          <span className="text-xs text-emerald-600 font-semibold">
            {selectedIds.length} selecionada{selectedIds.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
        {categories.map((cat, idx) => {
          const catSkills    = skills.filter(s => s.category_id === cat.id)
          if (catSkills.length === 0) return null
          const isCollapsed  = collapsed[cat.id] ?? false
          const selectedInCat = catSkills.filter(s => selectedIds.includes(s.id)).length

          return (
            <div key={cat.id} className={idx > 0 ? 'border-t border-slate-200' : ''}>
              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleAll(cat.id)}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900"
                >
                  <span>{cat.name}</span>
                  {selectedInCat > 0 && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {selectedInCat}/{catSkills.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                >
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {/* Skills grid */}
              {!isCollapsed && (
                <div className="flex flex-wrap gap-1.5 p-3">
                  {catSkills.map(skill => {
                    const selected = selectedIds.includes(skill.id)
                    const bg       = skill.color || '#94a3b8'
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggle(skill.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border-2 transition-all hover:scale-105"
                        style={{
                          backgroundColor: selected ? bg : 'white',
                          borderColor: bg,
                          color: selected ? getTextColor(bg) : bg,
                        }}
                      >
                        {skill.icon && (
                          <img src={skill.icon} alt="" className="w-3.5 h-3.5 object-contain flex-shrink-0" onError={e => { e.currentTarget.style.display = 'none' }} />
                        )}
                        {skill.name}
                        {selected && <span className="opacity-80">✓</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedIds.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          Limpar seleção
        </button>
      )}
    </div>
  )
}