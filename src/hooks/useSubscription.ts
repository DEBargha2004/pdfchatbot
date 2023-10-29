import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useContext } from 'react'
import { GlobalAppState } from '@/context/GlobalAppState'
import { GlobalAppStateType } from '@/Provider/GlobalAppStateProvider'

export function useSubscription () {
  const { setPaymentPageFetching } = useContext(
    GlobalAppState
  ) as GlobalAppStateType
  const router = useRouter()

  async function handleSubscription (id: string) {
    setPaymentPageFetching({
      fetching: true,
      id
    })
    let response = await axios.post('/api/subscription', {
      id
    })

    const { payment_url } = response.data

    router.push(payment_url)
  }

  return { handleSubscription }
}
