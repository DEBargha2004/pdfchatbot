'use client'

import { GlobalAppState } from '@/context/GlobalAppState'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { subscriptionPlan, subscriptionStatus } from '@/types/payment'
import { ConversationsHolder } from '@/types/conversation'

export type GlobalAppStateType = {
  subscriptionStatus: {
    status: subscriptionStatus
    plan_id: subscriptionPlan
    loaded: boolean
  }
  setSubscriptionStatus: Dispatch<
    SetStateAction<{
      status: subscriptionStatus
      plan_id: subscriptionPlan
      loaded: boolean
    }>
  >
  paymentPageFetching: {
    id: string
    fetching: boolean
  }
  setPaymentPageFetching: Dispatch<
    SetStateAction<{
      id: string
      fetching: boolean
    }>
  >
  pdfInfo: {
    url?: string | null
    name?: string
    loading?: boolean
    id: string
  }
  setPdfInfo: Dispatch<
    SetStateAction<{
      url?: string | null
      name?: string
      loading?: boolean
      id: string
    }>
  >
  conversations: ConversationsHolder[]
  setConversations: Dispatch<SetStateAction<ConversationsHolder[]>>
}

function GlobalAppStateProvider ({ children }: { children: ReactNode }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    plan_id: subscriptionPlan
    status: subscriptionStatus
    loaded?: boolean
  }>({
    plan_id: null,
    status: null,
    loaded: false
  })
  const [paymentPageFetching, setPaymentPageFetching] = useState({
    id: '',
    fetching: false
  })
  const [pdfInfo, setPdfInfo] = useState<{
    url: string | null
    name?: string
    id: string
  }>({
    url: '',
    name: '',
    id: ''
  })
  const [conversations, setConversations] = useState<ConversationsHolder[]>([])
  return (
    <GlobalAppState.Provider
      value={{
        subscriptionStatus,
        setSubscriptionStatus,
        paymentPageFetching,
        setPaymentPageFetching,
        pdfInfo,
        setPdfInfo,
        conversations,
        setConversations
      }}
    >
      {children}
    </GlobalAppState.Provider>
  )
}

export default GlobalAppStateProvider
