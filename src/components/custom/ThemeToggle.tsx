'use client'

import * as React from 'react'
import { MoonIcon, SunIcon, CheckIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const themes: { label: string; theme: string }[] = [
  { label: 'Light', theme: 'light' },
  { label: 'Dark', theme: 'dark' },
  { label: 'System', theme: 'system' }
]

export function ThemeToggle () {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {themes.map(themeInfo => (
          <DropdownMenuItem
            key={themeInfo.theme}
            onClick={() => setTheme(themeInfo.theme)}
          >
            {themeInfo.theme === theme ? (
              <CheckIcon className='h-4' />
            ) : (
              <div className='h-4 w-4'></div>
            )}{' '}
            {themeInfo.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
