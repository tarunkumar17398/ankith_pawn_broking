import type { CalcResult } from '../types'
import { inr, fmtDate } from '../utils'

interface Props {
  result: CalcResult
  onClose: () => void
  onSave: () => void
}

export function ResultSheet({ result, onClose, onSave }: Props) {
  const {
    days,
    billedMonths,
    completeMonths,
    remainingDays,
    partialChoice,
    monthlyInterest,
    totalInterest,
    amountGivenToClient,
    interestUpfront,
    interestToCollect,
    amountToCollect,
    principal,
    rate,
    type,
    loanDate,
    recoveryDate,
  } = result

  const partialLabel =
    partialChoice === 'full'
      ? 'Full month charged'
      : partialChoice === 'half'
      ? 'Half month charged'
      : 'Free — no charge'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-2xl bg-white dark:bg-neutral-900 overflow-y-auto"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <p className="text-[17px] font-bold tracking-tight">Recovery Summary</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {fmtDate(loanDate)} → {fmtDate(recoveryDate)}
          </p>
        </div>

        <div className="px-5 pt-4 space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Days elapsed</p>
              <p className="text-[15px] font-bold mt-0.5">{days}</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Billed months</p>
              <p className="text-[15px] font-bold mt-0.5">{billedMonths}</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden text-sm">
            <Row label="Principal" value={`₹${inr(principal)}`} />
            <Row label="Monthly interest" value={`₹${inr(monthlyInterest)} / mo`} />
            {remainingDays > 0 && partialChoice !== 'none' && (
              <Row
                label={`Partial (${remainingDays} day${remainingDays > 1 ? 's' : ''})`}
                value={partialLabel}
              />
            )}
            <Row
              label={`Total interest (${billedMonths} months)`}
              sublabel={`₹${inr(monthlyInterest)} × ${billedMonths}`}
              value={`₹${inr(totalInterest)}`}
              shaded
            />
            <Row
              label="1st month collected upfront"
              sublabel="Deducted at loan time"
              value={`−₹${inr(interestUpfront)}`}
              valueClass="text-emerald-600 dark:text-emerald-400"
            />
            <Row
              label="Interest to collect now"
              sublabel={`₹${inr(totalInterest)} − ₹${inr(interestUpfront)}`}
              value={`₹${inr(interestToCollect)}`}
            />
          </div>

          {/* Under 1 month notice */}
          {completeMonths === 0 && (
            <p className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 leading-relaxed">
              Loan is under 1 month — first month interest was collected upfront. No further interest to collect.
            </p>
          )}

          {/* Total */}
          <div className="bg-neutral-900 dark:bg-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white dark:text-neutral-900">Amount to collect</p>
              <p className="text-[10px] text-white/50 dark:text-neutral-900/50 mt-0.5">
                Principal + pending interest
              </p>
            </div>
            <p className="text-2xl font-extrabold text-white dark:text-neutral-900">
              ₹{inr(amountToCollect)}
            </p>
          </div>

          {/* Info strip */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-neutral-500">Amount given to client</span>
              <span className="font-semibold">₹{inr(amountGivenToClient)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Paisa vatti</span>
              <span className="font-semibold capitalize">{rate} paisa · {type}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pb-8">
            <button
              onClick={onClose}
              className="h-12 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-semibold"
            >
              Close
            </button>
            <button
              onClick={onSave}
              className="h-12 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-bold"
            >
              Save to history
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  sublabel,
  value,
  valueClass,
  shaded,
}: {
  label: string
  sublabel?: string
  value: string
  valueClass?: string
  shaded?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 ${
        shaded ? 'bg-neutral-50 dark:bg-neutral-800/60' : ''
      }`}
    >
      <div>
        <p className="text-neutral-500">{label}</p>
        {sublabel && <p className="text-[10px] text-neutral-400 mt-0.5">{sublabel}</p>}
      </div>
      <p className={`font-medium ${valueClass ?? ''}`}>{value}</p>
    </div>
  )
}
