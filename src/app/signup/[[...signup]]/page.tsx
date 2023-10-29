import FullPageAligner from '@/components/custom/FullPageAligner'
import { SignUp } from '@clerk/nextjs'

export default function Page () {
  return (
    <FullPageAligner>
      <SignUp />
    </FullPageAligner>
  )
}
