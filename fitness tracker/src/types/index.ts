export type Role = 'admin' | 'user'

export type User = {
  id: number
  firstName: string
  lastName: string
  username: string
  password: string
  role: Role
}

export type ActivityType = 'run' | 'walk' | 'bike' | 'strength_training' | 'dance'

export type Activity = {
  id: number
  userId: number
  type: ActivityType
  minutes: number
  date: string // YYYY-MM-DD
  notes?: string
}