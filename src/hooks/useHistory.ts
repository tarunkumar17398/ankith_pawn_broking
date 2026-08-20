import { useState } from 'react'
import type { CalcResult, HistoryEntry } from '../types'

const HIST_KEY = 'pv_history'

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HIST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(entries: HistoryEntry[]) {
  localStorage.setItem(HIST_KEY, JSON.stringify(entries))
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(load)

  const add = (result: CalcResult) => {
    const entry: HistoryEntry = {
      ...result,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    }
    const next = [entry, ...history].slice(0, 50)
    setHistory(next)
    save(next)
  }

  const remove = (id: string) => {
    const next = history.filter((h) => h.id !== id)
    setHistory(next)
    save(next)
  }

  const clear = () => {
    setHistory([])
    save([])
  }

  return { history, add, remove, clear }
}
