import type { HistoryEntry } from '../types'
import { inr, fmtDate } from '../utils'

interface Props {
  entry: HistoryEntry
  onDelete: (id: string) => void
}

export function HistoryCard({ entry, onDelete }: Props) {
  const {
    id,
    type,
    rate,
    completeMonths,
    remainingDays,
    partialChoice,
    principal,
    amountGivenToClient,
    interestUpfront,
    interestToCollect,
    amountToCollect,
    loanDate,
    recoveryDate,
  } = entry

  const partialTag =
    partialChoice === 'full'
      ? ' (full)'
      : partialChoice === 'half'
      ? ' (half)'
      : partialChoice === 'free'
      ? ' (free)'
      : ''

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl px-4 py-3 relative">
      {/* Delete */}
      <button
        onClick={() => onDelete(id)}
        className="absolute top-2.5 right-3 text-neutral-400 hover:text-red-500 text-xl leading-none"
        aria-label="Delete"
      >
        ×
      </button>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-400 mb-2.5">
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ background: type === 'gold' ? '#D97706' : '#71717A' }}
        />
        <span className="capitalize">{type}</span>
        <span>·</span>
        <span>{rate} paisa</span>
        <span>·</span>
        <span>
          {completeMonths}mo{remainingDays > 0 ? ` + ${remainingDays}d` : ''}
          {partialTag}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2.5">
        <span className="text-neutral-400">Principal</span>
        <span className="text-right font-medium">₹{inr(principal)}</span>
        <span className="text-neutral-400">Given to client</span>
        <span className="text-right font-medium">₹{inr(amountGivenToClient)}</span>
        <span className="text-neutral-400">Upfront interest</span>
        <span className="text-right font-medium">₹{inr(interestUpfront)}</span>
        <span className="text-neutral-400">On recovery</span>
        <span className="text-right font-medium">₹{inr(interestToCollect)}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-2">
        <span className="text-[11px] text-neutral-400">
          {fmtDate(loanDate)} → {fmtDate(recoveryDate)}
        </span>
        <span className="text-sm font-extrabold">₹{inr(amountToCollect)}</span>
      </div>
    </div>
  )
}
