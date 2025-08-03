'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface SignOutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function SignOutButton({ variant = 'ghost', size = 'sm', className }: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ 
      callbackUrl: '/login',
      redirect: true 
    })
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleSignOut}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}