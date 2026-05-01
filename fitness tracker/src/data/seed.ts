import type { Activity, UserProfile } from '@/types'

export const seedUsers: UserProfile[] = [
  {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'nitin@example.com',
    firstName: 'Nitin',
    lastName: 'Reddy',
    role: 'user',
  },
  {
    id: '3',
    email: 'hemanth@example.com',
    firstName: 'Hemanth',
    lastName: 'Reddy',
    role: 'user',
  },
  {
    id: '4',
    email: 'pablo@example.com',
    firstName: 'Pablo',
    lastName: 'Discobar',
    role: 'user',
  },
]

export const seedActivities: Activity[] = [
  { id: 1, userId: '2', type: 'run', minutes: 25, date: '2026-03-13', notes: 'Easy pace' },
  { id: 2, userId: '2', type: 'strength_training', minutes: 45, date: '2026-03-14' },
  { id: 3, userId: '3', type: 'dance', minutes: 40, date: '2026-03-14', notes: 'Salsa class' },
  { id: 4, userId: '4', type: 'bike', minutes: 60, date: '2026-03-15', notes: 'Morning ride' },
]

// friends mapping: userId -> friendIds
export const seedFriendsByUserId: Record<string, string[]> = {
  '1': ['2', '3', '4'],
  '2': ['3', '4'],
  '3': ['2', '4'],
  '4': ['2', '3'],
}
