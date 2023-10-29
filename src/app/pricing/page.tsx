import Purchase from '@/components/custom/Purchase'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { subscriptionsList } from '@/constants/subscriptionList'
import { CheckCircle2Icon } from 'lucide-react'

function Page () {
  return (
    <div className='h-fit my-10 lg:h-full flex flex-col lg:flex-row justify-center items-center gap-3 px-10 '>
      {subscriptionsList.map((subscription, index) => (
        <Card
          key={subscription.id}
          className='p-4 h-[60%] lg:w-full sm:w-[70%] w-full flex flex-col justify-between'
        >
          <div>
            <h1 className='text-2xl my-2'>{subscription.heading}</h1>
            <div className='flex justify-start items-baseline my-2'>
              <span className='text-4xl'>
                {subscription.currency_symbol}
                {subscription.price}
              </span>
              <span className=''>/{subscription.frequency}</span>
            </div>
            <Separator />
            <div className='my-2'>
              {subscription.features.map((feature, index) => (
                <div key={index} className='flex justify-start items-start'>
                  <CheckCircle2Icon className='h-4 mr-1 shrink-0' />
                  <p className='text-sm'>{feature}</p>
                </div>
              ))}
            </div>
          </div>
          <Purchase id={subscription.id} />
        </Card>
      ))}
    </div>
  )
}

export default Page
