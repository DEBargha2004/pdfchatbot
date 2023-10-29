import { getDoc, doc } from 'firebase/firestore'
import { firestoreDB } from '../../firebase.config'
import { SubscriptionInfo } from '@/types/payment'

export async function getSubscriptionId (userId: string) {
  const userInfoSnapshot = await getDoc(doc(firestoreDB, `users/${userId}`))
  const subscription_id = userInfoSnapshot.get('subscription_id')
  return subscription_id
}

export async function getSubscriptionData ({
  userId,
  subscription_id
}: {
  userId?: string
  subscription_id?: string
}) {
  //@ts-ignore
  subscription_id = subscription_id || (await getSubscriptionId(userId))
  const subscriptionSnapshot = await getDoc(
    doc(firestoreDB, `subscriptions/${subscription_id}`)
  )

  return subscriptionSnapshot.data() as SubscriptionInfo
}
