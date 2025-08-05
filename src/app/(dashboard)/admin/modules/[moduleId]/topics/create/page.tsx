// app/(dashboard)/admin/modules/[moduleId]/topics/create/page.tsx
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

interface CreateTopicPageProps {
  params: Promise<{
    moduleId: string
  }>
}

interface Module {
  id: string
  title: string
  course: {
    id: string
    title: string
  }
}

interface PrerequisiteTopic {
  id: string
  title: string
  orderIndex: number
}

export default function CreateTopicPage({ params }: CreateTopicPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [moduleId, setModuleId] = useState<string>('')
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [prerequisites, setPrerequisites] = useState<PrerequisiteTopic[]>([])
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    duration: 30,
    topicType: 'LESSON',
    videoUrl: '',
    attachments: [] as string[],
    passingScore: 80,
    maxAttempts: null as number | null,
    isRequired: true,
    allowSkip: false,
    prerequisiteTopicId: '',
  })

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setModuleId(resolvedParams.moduleId)
      
      try {
        const [moduleResponse, topicsResponse] = await Promise.all([
          fetch(`/api/modules/${resolvedParams.moduleId}`),
          fetch(`/api/modules/${resolvedParams.moduleId}/topics`)
        ])

        if (moduleResponse.ok) {
          const moduleData = await moduleResponse.json()
          setModule(moduleData)
        }

        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json()
          setPrerequisites(topicsData.topics)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setFetchLoading(false)
      }
    }
    getParams()
  }, [params])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/modules/${moduleId}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || generateSlug(formData.title),
          prerequisiteTopicId: formData.prerequisiteTopicId || null,
          maxAttempts: formData.maxAttempts || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: 'Success',
        description: 'Topic created successfully',
      })

      router.push(`/admin/courses/${module?.course.id}`)
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
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-generate slug when title changes
      if (field === 'title' && !prev.slug) {
        updated.slug = generateSlug(value)
      }
      
      return updated
    })
  }

  if (fetchLoading) {
    return (
      <AdminLayout title="Create Topic" description="Add a new topic to the module">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!module) {
    return (
      <AdminLayout title="Module Not Found" description="The requested module could not be found">
        <div className="text-center py-8">
          <p>Module not found</p>
          <Link href="/admin/courses">
            <Button className="mt-4">Back to Courses</Button>
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Create Topic" description={`Add a topic to ${module.title}`}>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Link href={`/admin/courses/${module.course.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Topic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Topic Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter topic title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="url-friendly-slug"
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
                  placeholder="Brief description of the topic"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter the main content for this topic (supports rich text)"
                  rows={10}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="topicType">Topic Type</Label>
                  <Select 
                    value={formData.topicType} 
                    onValueChange={(value) => handleInputChange('topicType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LESSON">Lesson</SelectItem>
                      <SelectItem value="PRACTICE">Practice</SelectItem>
                      <SelectItem value="ASSESSMENT">Assessment</SelectItem>
                      <SelectItem value="RESOURCE">Resource</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    min="1"
                    placeholder="30"
                  />
                </div>

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
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL (optional)</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  type="url"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="prerequisite">Prerequisite Topic</Label>
                  <Select 
                    value={formData.prerequisiteTopicId} 
                    onValueChange={(value) => handleInputChange('prerequisiteTopicId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select prerequisite topic (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No prerequisite</SelectItem>
                      {prerequisites.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.orderIndex}. {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Max Attempts (optional)</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={formData.maxAttempts || ''}
                    onChange={(e) => handleInputChange('maxAttempts', e.target.value ? parseInt(e.target.value) : null)}
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRequired"
                    checked={formData.isRequired}
                    onCheckedChange={(checked) => handleInputChange('isRequired', checked)}
                  />
                  <Label htmlFor="isRequired">This topic is required for module completion</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowSkip"
                    checked={formData.allowSkip}
                    onCheckedChange={(checked) => handleInputChange('allowSkip', checked)}
                  />
                  <Label htmlFor="allowSkip">Allow students to skip this topic if struggling</Label>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Topic'}
                </Button>
                <Link href={`/admin/courses/${module.course.id}`}>
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

// // app/(dashboard)/admin/topics/[topicId]/edit/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { AdminLayout } from '@/components/layout/AdminLayout'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Checkbox } from '@/components/ui/checkbox'
// import { useToast } from '@/hooks/use-toast'
// import { ArrowLeft } from 'lucide-react'
// import Link from 'next/link'

// interface EditTopicPageProps {
//   params: Promise<{
//     topicId: string
//   }>
// }

// interface Topic {
//   id: string
//   title: string
//   slug: string
//   description: string
//   content: string
//   duration: number
//   topicType: string
//   videoUrl: string
//   passingScore: number
//   maxAttempts: number | null
//   isRequired: boolean
//   allowSkip: boolean
//   prerequisiteTopicId: string | null
//   module: {
//     id: string
//     title: string
//     course: {
//       id: string
//       title: string
//     }
//   }
// }

// interface PrerequisiteTopic {
//   id: string
//   title: string
//   orderIndex: number
// }

// export default function EditTopicPage({ params }: EditTopicPageProps) {
//   const router = useRouter()
//   const { toast } = useToast()
//   const [topicId, setTopicId] = useState<string>('')
//   const [topic, setTopic] = useState<Topic | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [fetchLoading, setFetchLoading] = useState(true)
//   const [prerequisites, setPrerequisites] = useState<PrerequisiteTopic[]>([])
//   const [formData, setFormData] = useState({
//     title: '',
//     slug: '',
//     description: '',
//     content: '',
//     duration: 30,
//     topicType: 'LESSON',
//     videoUrl: '',
//     passingScore: 80,
//     maxAttempts: null as number | null,
//     isRequired: true,
//     allowSkip: false,
//     prerequisiteTopicId: '',
//   })

//   useEffect(() => {
//     const getParams = async () => {
//       const resolvedParams = await params
//       setTopicId(resolvedParams.topicId)
      
//       try {
//         const topicResponse = await fetch(`/api/topics/${resolvedParams.topicId}`)
        
//         if (topicResponse.ok) {
//           const topicData = await topicResponse.json()
//           setTopic(topicData)
//           setFormData({
//             title: topicData.title,
//             slug: topicData.slug,
//             description: topicData.description || '',
//             content: topicData.content,
//             duration: topicData.duration || 30,
//             topicType: topicData.topicType,
//             videoUrl: topicData.videoUrl || '',
//             passingScore: topicData.passingScore,
//             maxAttempts: topicData.maxAttempts,
//             isRequired: topicData.isRequired,
//             allowSkip: topicData.allowSkip,
//             prerequisiteTopicId: topicData.prerequisiteTopicId || '',
//           })

//           // Fetch prerequisites for the module
//           const prereqResponse = await fetch(`/api/modules/${topicData.module.id}/topics`)
//           if (prereqResponse.ok) {
//             const prereqData = await prereqResponse.json()
//             // Exclude current topic from prerequisites
//             setPrerequisites(prereqData.topics.filter((t: any) => t.id !== resolvedParams.topicId))
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching topic:', error)
//         toast({
//           title: 'Error',
//           description: 'Failed to load topic data',
//           variant: 'destructive',
//         })
//       } finally {
//         setFetchLoading(false)
//       }
//     }
//     getParams()
//   }, [params, toast])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const response = await fetch(`/api/topics/${topicId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...formData,
//           prerequisiteTopicId: formData.prerequisiteTopicId || null,
//           maxAttempts: formData.maxAttempts || null,
//         }),
//       })

//       if (!response.ok) {
//         const error = await response.json()
//         throw new Error(error.error)
//       }

//       toast({
//         title: 'Success',
//         description: 'Topic updated successfully',
//       })

//       router.push(`/admin/courses/${topic?.module.course.id}`)
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         variant: 'destructive',
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleInputChange = (field: string, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value,
//     }))
//   }

//   if (fetchLoading) {
//     return (
//       <AdminLayout title="Edit Topic" description="Update topic information">
//         <div className="flex items-center justify-center h-64">
//           <div className="text-lg">Loading topic...</div>
//         </div>
//       </AdminLayout>
//     )
//   }

//   if (!topic) {
//     return (
//       <AdminLayout title="Topic Not Found" description="The requested topic could not be found">
//         <div className="text-center py-8">
//           <p>Topic not found</p>
//           <Link href="/admin/courses">
//             <Button className="mt-4">Back to Courses</Button>
//           </Link>
//         </div>
//       </AdminLayout>
//     )
//   }

//   return (
//     <AdminLayout title={`Edit: ${topic.title}`} description="Update topic information">
//       <div className="space-y-6">
//         <div className="flex items-center space-x-2">
//           <Link href={`/admin/courses/${topic.module.course.id}`}>
//             <Button variant="outline" size="sm">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Course
//             </Button>
//           </Link>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>Topic Information</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">Topic Title *</Label>
//                   <Input
//                     id="title"
//                     value={formData.title}
//                     onChange={(e) => handleInputChange('title', e.target.value)}
//                     placeholder="Enter topic title"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2"></div>