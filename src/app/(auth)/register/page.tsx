import { RegisterForm } from '@/components/forms/register-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account | Tech Hill',
  description: 'Create your Tech Hill account and start your computer literacy journey.',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Tech Hill</h1>
          <p className="text-gray-600">Computer Literacy Platform</p>
        </div>
        <RegisterForm className="w-full" />
      </div>
    </div>
  )
}