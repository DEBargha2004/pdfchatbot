import { getSubscriptionData } from '@/functions/getSubscriptionData'
import { ConversationInfo } from '@/types/conversation'
import { SubscriptionInfo } from '@/types/payment'
import { getAuth } from '@clerk/nextjs/server'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { firestoreDB } from '../../../../firebase.config'

export async function POST (request: NextRequest) {
  const { userId } = getAuth(request)
  if (!userId) return NextResponse.json({ success: false })

  const subscriptionData: SubscriptionInfo = await getSubscriptionData({
    userId
  })

  if (subscriptionData.status !== 'active')
    return NextResponse.json({ success: false })

  const { hashId, name } = await request.json()

  const conversation_id = crypto.randomUUID()

  console.log('conversationInstance creation started')

  const conversationInstance: ConversationInfo = {
    u_id: userId,
    c_id: conversation_id,
    pdf_id: hashId,
    pdf_name: name,
    //@ts-ignore
    s_id: subscriptionData.subscription_id,
    timestamp: serverTimestamp(),
    vector_status: 'loading'
  }

  await setDoc(
    doc(firestoreDB, `conversations/${conversation_id}`),
    conversationInstance
  )

  console.log('conversationInstance creation ended')

  return NextResponse.json({ status: 'success', c_id: conversation_id })
}
