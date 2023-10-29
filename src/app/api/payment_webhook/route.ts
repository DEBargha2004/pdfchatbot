import stripe from 'stripe'
import { NextResponse } from 'next/server'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { firestoreDB } from '../../../../firebase.config'
import { paymentMetadata, SubscriptionInfo } from '@/types/payment'
import { getSubscriptionData } from '@/functions/getSubscriptionData'
import { getAuth } from '@clerk/nextjs/server'

//@ts-ignore
const stripe_instance = new stripe(process.env.STRIPE_SECRET_KEY)

async function updateSubscription ({
  subscription_id,
  plan_id: plan_id,
  current_period_end,
  current_period_start,
  status,
  amount,
  currency
}: SubscriptionInfo) {
  const subscriptionSnapshot = await getDoc(
    doc(firestoreDB, `subscriptions/${subscription_id}`)
  )

  const subscriptionInfo = {
    subscription_id,
    plan_id: plan_id || null,
    current_period_end: current_period_end || null,
    current_period_start: current_period_start || null,
    status: status || null,
    amount: amount || null,
    currency: currency || null
  }

  Object.keys(subscriptionInfo).map(key => {
    //@ts-ignore
    if (!subscriptionInfo[key]) {
      //@ts-ignore
      delete subscriptionInfo[key]
    }
  })

  if (subscriptionSnapshot.exists()) {
    await updateDoc(
      doc(firestoreDB, `subscriptions/${subscription_id}`),
      subscriptionInfo
    )
  } else {
    await setDoc(
      doc(firestoreDB, `subscriptions/${subscription_id}`),
      subscriptionInfo
    )
  }
}

export async function POST (request: Request) {
  //@ts-ignore
  const { userId } = getAuth(request)

  if (!userId) {
    return
  }

  const payLoad = await request.text()
  let event

  const signature = request.headers.get('stripe-signature')

  try {
    event = stripe_instance.webhooks.constructEvent(
      payLoad,
      //@ts-ignore
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    //@ts-ignore
    console.log(`⚠️  Webhook signature verification failed.`, error.message)
  }

  let subscription
  let status

  //@ts-ignore
  switch (event.type) {
    case 'customer.subscription.trial_will_end':
      subscription = event.data.object
      status = subscription.status
      // console.log(`Subscription status is ${status}.`)
      // Then define and call a method to handle the subscription trial ending.
      // handleSubscriptionTrialEnding(subscription);
      break
    case 'customer.subscription.deleted':
      subscription = event.data.object
      status = subscription.status
      // console.log(`Subscription status is ${status}.`)
      // Then define and call a method to handle the subscription deleted.
      // handleSubscriptionDeleted(subscriptionDeleted);
      break
    case 'customer.subscription.created':
      subscription = event.data.object
      status = subscription.status

      await updateSubscription({
        subscription_id: subscription.id,
        current_period_end: subscription.current_period_end,
        current_period_start: subscription.current_period_start,
        //@ts-ignore
        amount: subscription.plan.amount,
        currency: subscription.currency,
        status: 'active'
      })

      break
    case 'customer.subscription.updated':
      subscription = event.data.object
      status = subscription.status
      // console.log(`Subscription status is ${status}.`)
      // Then define and call a method to handle the subscription update.
      // handleSubscriptionUpdated(subscription);
      break
    case 'checkout.session.completed':
      //something
      subscription = event.data.object
      status = subscription.status
      // console.log(subscription)
      const { user_id, plan_id } = subscription.metadata as paymentMetadata

      // console.log('subscription obj is', subscription)
      // console.log('checkout.session.completed', subscription)

      await updateDoc(doc(firestoreDB, `users/${user_id}`), {
        subscription_id: subscription.subscription
      })

      await updateSubscription({
        //@ts-ignore
        subscription_id: subscription.subscription,
        plan_id
      })

      // await updateFirebase()
      break
    default:
    // Unexpected event type
    //@ts-ignore
    // console.log(`Unhandled event type ${event.type}.`)
    // console.log(event)
  }

  return NextResponse.json({
    status: event?.data.object
  })
}
