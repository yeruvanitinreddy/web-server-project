import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Activity, ActivityType, UserProfile } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { useUsersStore } from './users'

export type FriendActivityItem = {
  friendId: string
  friendName: string
  activity: Activity
}

export const useFriendsStore = defineStore('friends', () => {
  const friendIds = ref<string[]>([])
  const friends = ref<UserProfile[]>([])
  const friendActivities = ref<Activity[]>([])

  const auth = useAuthStore()
  const usersStore = useUsersStore()

  const myFriendIds = computed(() => {
    return friendIds.value
  })

  const myFriends = computed(() => {
    return friends.value
  })

  const friendsFeed = computed<FriendActivityItem[]>(() => {
    const friendById = new Map(friends.value.map(friend => [friend.id, friend]))
    const items: FriendActivityItem[] = []

    for (const activity of friendActivities.value) {
      const friend = friendById.get(activity.userId)
      if (!friend) continue
      items.push({
        friendId: friend.id,
        friendName: `${friend.firstName} ${friend.lastName}`,
        activity,
      })
    }

    return items.sort((x, y) => {
      const d = y.activity.date.localeCompare(x.activity.date)
      if (d !== 0) return d
      return y.activity.id - x.activity.id
    })
  })

  function mapActivity(row: {
    id: number
    user_id: string
    type: string
    duration: number
    date: string
    notes: string | null
  }): Activity {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type as ActivityType,
      minutes: row.duration,
      date: row.date,
      notes: row.notes ?? undefined,
    }
  }

  async function requireUserId() {
    const currentId = auth.user?.id
    if (currentId) return currentId
    const { data } = await supabase.auth.getUser()
    if (!data.user) throw new Error('Not authenticated')
    return data.user.id
  }

  async function loadFriends() {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('Friends')
      .select('friend_id')
      .eq('user_id', userId)

    if (error) throw error
    friendIds.value = (data ?? []).map(row => row.friend_id)

    await usersStore.loadUsers()
    friends.value = usersStore.users.filter(user => friendIds.value.includes(user.id))
  }

  async function loadFriendsFeed() {
    if (friendIds.value.length === 0) {
      friendActivities.value = []
      return
    }

    const { data, error } = await supabase
      .from('Activity')
      .select('*')
      .in('user_id', friendIds.value)
      .order('date', { ascending: false })

    if (error) throw error
    friendActivities.value = (data ?? []).map(mapActivity)
  }

  async function addFriend(friendId: string) {
    const userId = await requireUserId()
    const { error } = await supabase.from('Friends').insert({ user_id: userId, friend_id: friendId })
    if (error) throw error
    await loadFriends()
    await loadFriendsFeed()
  }

  async function removeFriend(friendId: string) {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('Friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId)

    if (error) throw error
    friendIds.value = friendIds.value.filter(id => id !== friendId)
    friends.value = friends.value.filter(friend => friend.id !== friendId)
    friendActivities.value = friendActivities.value.filter(a => a.userId !== friendId)
  }

  return { myFriendIds, myFriends, friendsFeed, loadFriends, loadFriendsFeed, addFriend, removeFriend }
})
