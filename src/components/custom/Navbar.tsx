'use client'

import { cn } from '@/lib/utils'
import AppLogo from './AppLogo'
import { ThemeToggle } from './ThemeToggle'
import { UserButton } from '@clerk/nextjs'

function Navbar ({ className }: { className: string }) {
  return (
    <div className={cn('w-full p-5 flex justify-between', className)}>
      <AppLogo className='h-10 w-10' />
      <div className='flex justify-between items-center gap-3'>
        <UserButton />
        <ThemeToggle />
      </div>
    </div>
  )
}

export default Navbar
