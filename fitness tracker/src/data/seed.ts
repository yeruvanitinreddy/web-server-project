import type { Activity, User } from '@/types'

export const seedUsers: User[] = [
  {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    password: 'admin',
    role: 'admin',
  },
  {
    id: 2,
    firstName: 'Nitin',
    lastName: 'Reddy',
    username: 'nitin',
    password: 'password',
    role: 'user',
  },
  {
    id: 3,
    firstName: 'Hemanth',
    lastName: 'Reddy',
    username: 'hemanth',
    password: 'password',
    role: 'user',
  },
  {
    id: 4,
    firstName: 'Pablo',
    lastName: 'Discobar',
    username: 'pablo',
    password: 'password',
    role: 'user',
  },
]

export const seedActivities: Activity[] = [
  { id: 1, userId: 2, type: 'run', minutes: 25, date: '2026-03-13', notes: 'Easy pace' },
  { id: 2, userId: 2, type: 'strength_training', minutes: 45, date: '2026-03-14' },
  { id: 3, userId: 3, type: 'dance', minutes: 40, date: '2026-03-14', notes: 'Salsa class' },
  { id: 4, userId: 4, type: 'bike', minutes: 60, date: '2026-03-15', notes: 'Morning ride' },
]

// friends mapping: userId -> friendIds
export const seedFriendsByUserId: Record<number, number[]> = {
  1: [2, 3, 4],
  2: [3, 4],
  3: [2, 4],
  4: [2, 3],
}