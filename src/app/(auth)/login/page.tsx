import { Suspense } from 'react'
import { LoginForm } from '@/components/forms/login-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Tech Hill',
  description: 'Sign in to your Tech Hill account to continue your learning journey.',
}

function LoginContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Tech Hill</h1>
          <p className="text-gray-600">Computer Literacy Platform</p>
        </div>
        <LoginForm className="w-full" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}