import { Loader2Icon, PlusCircleIcon } from 'lucide-react'
import { Card } from '../ui/card'

function ChatOverview ({
  loading,
  name,
  c_id
}: {
  loading?: boolean
  name?: string
  c_id?: string | null
}) {
  return (
    <Card className='h-[150px] w-[280px] flex flex-col justify-center items-center gap-3 cursor-pointer border-primary'>
      {!c_id ? (
        loading ? (
          <Loader2Icon className='animate-spin' />
        ) : (
          <PlusCircleIcon />
        )
      ) : null}
      <span className='text-center line-clamp-2 max-w-[80%] truncate'>
        {name || null}
      </span>
    </Card>
  )
}

export default ChatOverview
