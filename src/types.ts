export type CollateralType = 'gold' | 'silver'
export type PartialChoice = 'full' | 'half' | 'free' | 'none'

export interface CalcResult {
  days: number
  completeMonths: number
  remainingDays: number
  partialChoice: PartialChoice
  billedMonths: number
  monthlyInterest: number
  totalInterest: number
  amountGivenToClient: number
  interestUpfront: number
  interestToCollect: number
  amountToCollect: number
  principal: number
  rate: number
  type: CollateralType
  loanDate: string
  recoveryDate: string
}

export interface HistoryEntry extends CalcResult {
  id: string
  savedAt: string
}
