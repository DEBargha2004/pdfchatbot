'use client'

import { cn } from '@/lib/utils'
import AppLogo from './AppLogo'
import { ThemeToggle } from './ThemeToggle'

function Navbar ({ className }: { className: string }) {
  return (
    <div className={cn('w-full p-5 flex justify-between', className)}>
      <AppLogo className='h-10 w-10' />
      <ThemeToggle />
    </div>
  )
}

export default Navbar
