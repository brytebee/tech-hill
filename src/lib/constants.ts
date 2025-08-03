// lib/constants.ts
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STUDENT: 'STUDENT',
} as const

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const

export const COURSE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const

export const TOPIC_TYPES = {
  LESSON: 'LESSON',
  PRACTICE: 'PRACTICE',
  ASSESSMENT: 'ASSESSMENT',
  RESOURCE: 'RESOURCE',
} as const

export const ENROLLMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DROPPED: 'DROPPED',
  SUSPENDED: 'SUSPENDED',
  ON_HOLD: 'ON_HOLD',
} as const

export const PROGRESS_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  FAILED: 'FAILED',
} as const

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
