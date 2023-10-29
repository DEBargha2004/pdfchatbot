export type Subscription = {
  id: string
  heading: string
  price: number
  features: string[]
  frequency: string
  currency_symbol: '$' | '₹'
  currency_shorthand: 'usd' | 'inr'
}

export type paymentMetadata = {
  user_id: string
  plan_id: string
}

export type subscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | null

export type subscriptionPlan = 'basic' | 'pro' | 'bussiness' | null

export type SubscriptionInfo = {
  subscription_id: string | null
  plan_id?: string | null
  amount?: number | null
  currency?: string | null
  current_period_start?: number | null
  current_period_end?: number | null
  status?: subscriptionStatus
}
