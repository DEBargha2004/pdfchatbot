'use client'

import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useContext, useEffect } from 'react'
import { GlobalAppState } from '@/context/GlobalAppState'
import { GlobalAppStateType } from '@/Provider/GlobalAppStateProvider'
import { subscriptionPlan, subscriptionStatus } from '@/types/payment'

function Purchase ({ id }: { id: string }) {
  const { paymentPageFetching, setPaymentPageFetching, subscriptionStatus } =
    useContext(GlobalAppState) as GlobalAppStateType
  const { handleSubscription } = useSubscription()

  useEffect(() => {
    return () => {
      setPaymentPageFetching({ fetching: false, id: '' })
    }
  }, [])
  return (
    <Button
      className='w-full'
      onClick={() => handleSubscription(id)}
      disabled={paymentPageFetching.fetching}
    >
      <Loader2
        className={cn(
          paymentPageFetching.id === id && paymentPageFetching.fetching
            ? 'animate-spin h-4'
            : 'hidden'
        )}
      />{' '}
      {id === subscriptionStatus.plan_id &&
      subscriptionStatus.status === 'active'
        ? 'Manage Subscription'
        : 'Purchase'}
    </Button>
  )
}

export default Purchase
