import { getDoc, doc, setDoc } from 'firebase/firestore'
import { firestoreDB } from '../../firebase.config'

type user = {
  user_id: string
  user_name: string
  user_email: string | null
}

export function useFirebase () {
  async function getUser (id: String) {
    const snapshot = await getDoc(doc(firestoreDB, `users/${id}`))
    return snapshot
  }
  async function includeUser (user: user) {
    const userInfo = await getUser(user.user_id)
    if (!userInfo.exists()) {
      await setDoc(doc(firestoreDB, `users/${user.user_id}`), {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
        subscription_id: null
      })
    }

    const s_id = userInfo.get('subscription_id')
    let s_status
    let plan_id
    if (s_id) {
      let subscriptionSnapshot = await getDoc(
        doc(firestoreDB, `subscriptions/${s_id}`)
      )
      s_status = subscriptionSnapshot.get('status')
      plan_id = subscriptionSnapshot.get('plan_id')
    }

    return {
      status: s_status,
      plan_id
    }
  }

  return { includeUser, getUser }
}
