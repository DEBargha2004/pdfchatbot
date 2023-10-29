import { subscriptionsList } from '@/constants/subscriptionList'
import { paymentMetadata } from '@/types/payment'
import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import stripe from 'stripe'

//@ts-ignore
const stripe_instance = new stripe(process.env.STRIPE_SECRET_KEY)

export async function POST (request: Request) {
  //@ts-ignore
  const { userId } = getAuth(request)
  const { id } = await request.json()

  const subscriptionInfo = subscriptionsList.find(
    subscription => subscription.id === id
  )

  const session = await stripe_instance.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price_data: {
          currency: subscriptionInfo!.currency_shorthand,
          unit_amount_decimal: `${subscriptionInfo!.price * 100}`,
          recurring: {
            interval: 'month',
            interval_count: 1
          },
          product_data: {
            name: subscriptionInfo!.heading,
            metadata: {
              id
            }
          }
        },
        quantity: 1
      }
    ],

    mode: 'subscription',
    success_url: 'http://localhost:3000/',
    cancel_url: 'http://localhost:3000/cancel',
    metadata: {
      user_id: userId,
      plan_id: id
    } as paymentMetadata
  })

  console.log(session.url, session.subscription)

  return NextResponse.json({ payment_url: session.url })
}
