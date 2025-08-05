// app/(dashboard)/admin/courses/[courseId]/modules/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface CreateModulePageProps {
  params: Promise<{
    courseId: string
  }>
}

interface PrerequisiteModule {
  id: string
  title: string
  order: number
}

export default function CreateModulePage({ params }: CreateModulePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [courseId, setCourseId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [prerequisites, setPrerequisites] = useState<PrerequisiteModule[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    passingScore: 80,
    prerequisiteModuleId: '',
    isRequired: true,
    unlockDelay: 0,
  })

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setCourseId(resolvedParams.courseId)
      
      // Fetch available prerequisite modules
      try {
        const response = await fetch(`/api/courses/${resolvedParams.courseId}/modules`)
        if (response.ok) {
          const data = await response.json()
          setPrerequisites(data.modules)
        }
      } catch (error) {
        console.error('Error fetching prerequisites:', error)
      }
    }
    getParams()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/courses/${courseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          prerequisiteModuleId: formData.prerequisiteModuleId || null,
          unlockDelay: formData.unlockDelay || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: 'Success',
        description: 'Module created successfully',
      })

      router.push(`/admin/courses/${courseId}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <AdminLayout title="Create Module" description="Add a new module to the course">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Link href={`/admin/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Module Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Module Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter module title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    placeholder="60"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what students will learn in this module"
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passingScore">Passing Score (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unlockDelay">Unlock Delay (hours)</Label>
                  <Input
                    id="unlockDelay"
                    type="number"
                    value={formData.unlockDelay}
                    onChange={(e) => handleInputChange('unlockDelay', parseInt(e.target.value))}
                    min="0"
                    placeholder="0 for immediate access"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisite">Prerequisite Module</Label>
                <Select 
                  value={formData.prerequisiteModuleId} 
                  onValueChange={(value) => handleInputChange('prerequisiteModuleId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select prerequisite module (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No prerequisite</SelectItem>
                    {prerequisites.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        Module {module.order}: {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRequired"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) => handleInputChange('isRequired', checked)}
                />
                <Label htmlFor="isRequired">This module is required for course completion</Label>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Module'}
                </Button>
                <Link href={`/admin/courses/${courseId}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
