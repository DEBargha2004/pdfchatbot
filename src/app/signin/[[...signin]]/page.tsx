import FullPageAligner from '@/components/custom/FullPageAligner'
import { SignIn } from '@clerk/nextjs'

export default function Page () {
  return (
    <FullPageAligner>
      <SignIn />
    </FullPageAligner>
  )
}
