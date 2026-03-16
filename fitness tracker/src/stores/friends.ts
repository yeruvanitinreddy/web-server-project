import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { seedFriendsByUserId } from '@/data/seed'
import { useAuthStore } from './auth'
import { useUsersStore } from './users'
import { useActivitiesStore } from './activities'
import type { Activity } from '@/types'

export type FriendActivityItem = {
  friendId: number
  friendName: string
  activity: Activity
}

export const useFriendsStore = defineStore('friends', () => {
  const friendsByUserId = ref<Record<number, number[]>>(
    JSON.parse(JSON.stringify(seedFriendsByUserId))
  )

  const auth = useAuthStore()
  const usersStore = useUsersStore()
  const activitiesStore = useActivitiesStore()

  const myFriendIds = computed(() => {
    const me = auth.currentUser
    if (!me) return []
    return friendsByUserId.value[me.id] ?? []
  })

  const myFriends = computed(() => {
    return usersStore.users.filter(u => myFriendIds.value.includes(u.id))
  })

  const friendsFeed = computed<FriendActivityItem[]>(() => {
    // latest first by date, then id
    const items: FriendActivityItem[] = []

    for (const friend of myFriends.value) {
      const friendActs = activitiesStore.activities.filter(a => a.userId === friend.id)
      for (const a of friendActs) {
        items.push({
          friendId: friend.id,
          friendName: `${friend.firstName} ${friend.lastName}`,
          activity: a,
        })
      }
    }

    return items.sort((x, y) => {
      const d = y.activity.date.localeCompare(x.activity.date)
      if (d !== 0) return d
      return y.activity.id - x.activity.id
    })
  })

  return { friendsByUserId, myFriendIds, myFriends, friendsFeed }
})