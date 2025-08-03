
// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/lib/services/userService'
import { CourseService } from '@/lib/services/courseService'
import { EnrollmentService } from '@/lib/services/enrollmentService'

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let stats = {}

    if (session.user.role === 'ADMIN') {
      // Admin gets all system stats
      const [userStats, courseStats, enrollmentStats] = await Promise.all([
        UserService.getUserStats(),
        CourseService.getCourseStats(),
        EnrollmentService.getEnrollmentStats(),
      ])

      stats = {
        users: userStats,
        courses: courseStats,
        enrollments: enrollmentStats,
      }
    } else if (session.user.role === 'MANAGER') {
      // Manager gets their course stats
      const managerCourses = await CourseService.getCourses(
        { creatorId: session.user.id },
        1,
        1000 // Get all courses for stats
      )

      const courseIds = managerCourses.courses.map(c => c.id)
      let totalEnrollments = 0
      
      for (const courseId of courseIds) {
        const enrollments = await EnrollmentService.getCourseEnrollments(courseId)
        totalEnrollments += enrollments.length
      }

      stats = {
        courses: {
          total: managerCourses.courses.length,
          published: managerCourses.courses.filter(c => c.status === 'PUBLISHED').length,
          draft: managerCourses.courses.filter(c => c.status === 'DRAFT').length,
        },
        enrollments: {
          total: totalEnrollments,
        },
      }
    } else {
      // Student gets their enrollment stats
      const enrollments = await EnrollmentService.getUserEnrollments(session.user.id)
      
      stats = {
        enrollments: {
          total: enrollments.length,
          active: enrollments.filter(e => e.status === 'ACTIVE').length,
          completed: enrollments.filter(e => e.status === 'COMPLETED').length,
        },
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}