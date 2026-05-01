import type { Role, UserProfile } from '@/types'

export type ProfileRow = {
  id: string
  email: string | null
  first_name: string
  last_name: string
  role: Role
}

export function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
  }
}
