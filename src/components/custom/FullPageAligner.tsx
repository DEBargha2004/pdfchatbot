import { ReactNode } from 'react'

function FullPageAligner ({ children }: { children: ReactNode }) {
  return (
    <div className='w-full h-full flex justify-center items-center'>
      {children}
    </div>
  )
}

export default FullPageAligner
