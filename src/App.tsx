import { useState } from 'react'
import type { CalcResult, CollateralType, PartialChoice } from './types'
import { useTheme } from './hooks/useTheme'
import { useHistory } from './hooks/useHistory'
import { ResultSheet } from './components/ResultSheet'
import { HistoryCard } from './components/HistoryCard'
import { inr, daysBetween } from './utils'

const DEFAULT_RATES: Record<CollateralType, number> = { gold: 2, silver: 3 }

interface Pending {
  totalDays: number
  completeMonths: number
  remainingDays: number
  principal: number
  rate: number
  loanDate: string
  recoveryDate: string
}

export default function App() {
  const { dark, toggle } = useTheme()
  const { history, add, remove, clear } = useHistory()

  const [collType, setCollType] = useState<CollateralType>('gold')
  const [principal, setPrincipal] = useState('')
  const [loanDate, setLoanDate] = useState('')
  const [recoveryDate, setRecoveryDate] = useState('')
  const [rate, setRate] = useState(String(DEFAULT_RATES.gold))
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CalcResult | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)

  const principalNum = parseFloat(principal) || 0
  const rateNum = parseFloat(rate) || 0
  const liveInterest = principalNum > 0 && rateNum > 0 ? (principalNum * rateNum) / 100 : null

  function selectType(t: CollateralType) {
    setCollType(t)
    setRate(String(DEFAULT_RATES[t]))
  }

  function buildResult(
    totalDays: number,
    completeMonths: number,
    remainingDays: number,
    billedMonths: number,
    partialChoice: PartialChoice,
    principal: number,
    rate: number,
    loanDate: string,
    recoveryDate: string
  ) {
    const monthlyInterest = (principal * rate) / 100
    const amountGivenToClient = principal - monthlyInterest
    const totalInterest = monthlyInterest * billedMonths
    const interestUpfront = monthlyInterest
    const interestToCollect = Math.max(0, totalInterest - interestUpfront)
    const amountToCollect = principal + interestToCollect

    setResult({
      days: totalDays,
      completeMonths,
      remainingDays,
      partialChoice,
      billedMonths,
      monthlyInterest,
      totalInterest,
      amountGivenToClient,
      interestUpfront,
      interestToCollect,
      amountToCollect,
      principal,
      rate,
      type: collType,
      loanDate,
      recoveryDate,
    })
  }

  function calculate() {
    if (!(principalNum > 0)) return setError('Principal must be greater than 0')
    if (!(rateNum > 0)) return setError('Paisa Vatti rate must be greater than 0')
    if (!loanDate) return setError('Please select the loan date')
    if (!recoveryDate) return setError('Please select the recovery date')
    if (new Date(recoveryDate) < new Date(loanDate))
      return setError('Recovery date must be on or after loan date')

    setError(null)
    setPending(null)

    const totalDays = daysBetween(loanDate, recoveryDate)
    const completeMonths = Math.floor(totalDays / 30)
    const remainingDays = totalDays % 30

    if (remainingDays === 0 || completeMonths === 0) {
      buildResult(
        totalDays,
        completeMonths,
        remainingDays,
        Math.max(1, completeMonths),
        'none',
        principalNum,
        rateNum,
        loanDate,
        recoveryDate
      )
    } else {
      setPending({ totalDays, completeMonths, remainingDays, principal: principalNum, rate: rateNum, loanDate, recoveryDate })
    }
  }

  function decide(mode: 'full' | 'half' | 'free') {
    if (!pending) return
    const { totalDays, completeMonths, remainingDays, principal, rate, loanDate, recoveryDate } = pending
    const billed =
      mode === 'full' ? completeMonths + 1 : mode === 'half' ? completeMonths + 0.5 : completeMonths
    buildResult(totalDays, completeMonths, remainingDays, billed, mode, principal, rate, loanDate, recoveryDate)
    setPending(null)
  }

  function handleSave() {
    if (!result) return
    add(result)
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[430px] px-4 pt-5 pb-24">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-base font-bold tracking-tight">Shop Name</p>
            <p className="text-xs text-neutral-400 mt-0.5">Paisa Vatti Calculator</p>
          </div>
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base"
            aria-label="Toggle theme"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Page title */}
        <h1 className="text-[26px] font-extrabold tracking-tight leading-tight mb-5">
          Calculate<br />Recovery
        </h1>

        {/* Collateral */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <CollateralBtn
            active={collType === 'gold'}
            label="Gold"
            dotColor="#D97706"
            activeClass="border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
            onClick={() => selectType('gold')}
          />
          <CollateralBtn
            active={collType === 'silver'}
            label="Silver"
            dotColor="#71717A"
            activeClass="border-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300"
            onClick={() => selectType('silver')}
          />
        </div>

        {/* Principal */}
        <Field label="Principal Amount ₹">
          <input
            type="number"
            inputMode="decimal"
            placeholder="e.g. 50000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="input"
          />
        </Field>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 mb-3.5">
          <Field label="Loan Date">
            <input
              type="date"
              value={loanDate}
              onChange={(e) => setLoanDate(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Recovery Date">
            <input
              type="date"
              value={recoveryDate}
              onChange={(e) => setRecoveryDate(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        {/* Rate */}
        <Field
          label="Paisa Vatti Rate"
          hint={rateNum > 0 ? `${rateNum}% per month` : undefined}
        >
          <input
            type="number"
            step="0.25"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="input"
          />
        </Field>

        {/* Live preview */}
        {liveInterest !== null && (
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 mb-3.5">
            Monthly interest:{' '}
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              ₹{inr(liveInterest)}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl px-3.5 py-2.5 text-sm mb-3.5">
            {error}
          </div>
        )}

        {/* Calculate */}
        <button
          onClick={calculate}
          className="w-full h-13 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[15px] font-bold tracking-tight active:opacity-80 transition-opacity"
          style={{ height: 52 }}
        >
          Calculate Recovery Amount
        </button>

        {/* Partial billing */}
        {pending && (
          <div className="mt-3.5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-4">
            <p className="text-sm font-bold mb-1">
              {pending.completeMonths > 0
                ? `${pending.completeMonths} month${pending.completeMonths > 1 ? 's' : ''} and `
                : ''}
              {pending.remainingDays} day{pending.remainingDays > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-neutral-400 mb-3.5">
              How do you want to bill the {pending.remainingDays} remaining day
              {pending.remainingDays > 1 ? 's' : ''}?
            </p>
            <div className="grid grid-cols-3 gap-2">
              <PartialBtn label="Full month" note="Charge complete" primary onClick={() => decide('full')} />
              <PartialBtn label="Half month" note="Charge half" onClick={() => decide('half')} />
              <PartialBtn label="Free" note="No charge" onClick={() => decide('free')} />
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[15px] font-bold">History</p>
              <button
                onClick={() => {
                  if (confirm('Clear all history? This cannot be undone.')) clear()
                }}
                className="text-xs text-neutral-400 hover:text-red-500"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {history.map((h) => (
                <HistoryCard key={h.id} entry={h} onDelete={remove} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result sheet */}
      {result && (
        <ResultSheet
          result={result}
          onClose={() => setResult(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function CollateralBtn({
  active,
  label,
  dotColor,
  activeClass,
  onClick,
}: {
  active: boolean
  label: string
  dotColor: string
  activeClass: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`h-12 rounded-xl border-[1.5px] text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
        active
          ? activeClass
          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-400'
      }`}
    >
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
      {label}
    </button>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-3.5">
      <div className="flex justify-between items-baseline mb-1.5">
        <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
          {label}
        </label>
        {hint && <span className="text-[11px] text-neutral-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function PartialBtn({
  label,
  note,
  primary,
  onClick,
}: {
  label: string
  note: string
  primary?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl py-2.5 px-2 text-center text-xs font-semibold border-[1.5px] transition-all active:opacity-80 ${
        primary
          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent'
          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
      }`}
    >
      {label}
      <span
        className={`block text-[10px] font-normal mt-0.5 ${
          primary ? 'text-white/50 dark:text-neutral-900/50' : 'text-neutral-400'
        }`}
      >
        {note}
      </span>
    </button>
  )
}

// input class applied globally via @apply would be cleaner but inlined here for simplicity
const inputStyle = `
  .input {
    @apply w-full h-12 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 
           bg-white dark:bg-neutral-800 text-[15px] font-medium outline-none
           focus:border-neutral-900 dark:focus:border-neutral-300 transition-colors;
  }
`
// Inject input style
const style = document.createElement('style')
style.textContent = `
  .input {
    width: 100%; height: 48px; padding: 0 14px;
    border-radius: 12px;
    border: 1.5px solid rgb(229 229 229);
    background: white;
    font-size: 15px; font-weight: 500;
    outline: none;
    transition: border-color 0.12s;
    font-family: inherit;
    color: inherit;
  }
  .dark .input {
    border-color: rgb(64 64 64);
    background: rgb(23 23 23);
  }
  .input:focus { border-color: rgb(23 23 23); }
  .dark .input:focus { border-color: rgb(212 212 212); }
`
document.head.appendChild(style)
