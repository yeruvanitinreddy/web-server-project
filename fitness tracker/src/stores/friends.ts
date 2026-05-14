import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Activity, ActivityType, UserProfile } from '@/types'
import { mapProfile, type ProfileRow } from '@/lib/profiles'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

export type FriendActivityItem = {
  friendId: string
  friendName: string
  activity: Activity
}

const PAGE_SIZE = 10

export const useFriendsStore = defineStore('friends', () => {
  const friendIds = ref<string[]>([])
  const friends = ref<UserProfile[]>([])
  const friendActivities = ref<Activity[]>([])

  const auth = useAuthStore()

  const isLoadingFeed = ref(false)
  const hasMoreFeed = ref(true)
  const totalFeedCount = ref<number | null>(null)
  const feedPage = ref(0)

  const myFriendIds = computed(() => friendIds.value)
  const myFriends = computed(() => friends.value)

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

    if (friendIds.value.length === 0) {
      friends.value = []
      return
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .in('id', friendIds.value)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (profileError) throw profileError
    friends.value = (profiles ?? []).map((row) => mapProfile(row as ProfileRow))
  }

  async function loadFriendsFeed(reset = false) {
    if (reset) {
      friendActivities.value = []
      feedPage.value = 0
      hasMoreFeed.value = true
      totalFeedCount.value = null
    }

    if (isLoadingFeed.value || !hasMoreFeed.value) return
    if (friendIds.value.length === 0) {
      friendActivities.value = []
      hasMoreFeed.value = false
      totalFeedCount.value = 0
      return
    }

    isLoadingFeed.value = true
    try {
      const start = feedPage.value * PAGE_SIZE
      const end = start + PAGE_SIZE - 1

      const { data, error, count } = await supabase
        .from('Activity')
        .select('*', { count: 'exact' })
        .in('user_id', friendIds.value)
        .order('date', { ascending: false })
        .order('id', { ascending: false })
        .range(start, end)

      if (error) throw error

      const rows = (data ?? []).map(mapActivity)

      if (reset) {
        friendActivities.value = rows
      } else {
        friendActivities.value.push(...rows)
      }

      if (typeof count === 'number') {
        totalFeedCount.value = count
      }

      feedPage.value += 1
      hasMoreFeed.value = rows.length === PAGE_SIZE
    } finally {
      isLoadingFeed.value = false
    }
  }

  async function loadMoreFriendsFeed() {
    await loadFriendsFeed(false)
  }

  async function addFriend(friendId: string) {
    const userId = await requireUserId()
    const { error } = await supabase.from('Friends').insert({
      user_id: userId,
      friend_id: friendId,
    })

    if (error) throw error
    await loadFriends()
    await loadFriendsFeed(true)
  }

  async function removeFriend(friendId: string) {
    const userId = await requireUserId()
    const { error } = await supabase
      .from('Friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId)

    if (error) throw error
    await loadFriends()
    await loadFriendsFeed(true)
  }

  return {
    friendIds,
    friends,
    friendActivities,
    myFriendIds,
    myFriends,
    friendsFeed,
    isLoadingFeed,
    hasMoreFeed,
    totalFeedCount,
    loadFriends,
    loadFriendsFeed,
    loadMoreFriendsFeed,
    addFriend,
    removeFriend,
  }
})