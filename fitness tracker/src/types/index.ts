export type Role = 'admin' | 'user'

export type UserProfile = {
  id: string
  email: string | null
  firstName: string
  lastName: string
  role: Role
}

export type ActivityType = 'run' | 'walk' | 'bike' | 'strength_training' | 'dance'

export type Activity = {
  id: number
  userId: string
  type: ActivityType
  minutes: number
  date: string // YYYY-MM-DD
  notes?: string
}
