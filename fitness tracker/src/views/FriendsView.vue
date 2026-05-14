<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { RouterLink } from 'vue-router'
import { useActivitiesStore } from '@/stores/activities'
import { useAuthStore } from '@/stores/auth'
import { useFriendsStore } from '@/stores/friends'
import { useUsersStore } from '@/stores/users'

const auth = useAuthStore()
const activitiesStore = useActivitiesStore()
const friendsStore = useFriendsStore()
const usersStore = useUsersStore()

const error = ref<string | null>(null)
const loading = ref(true)
const selectedFriendId = ref('')
const feedContainer = ref<HTMLElement | null>(null)

const hasFriends = computed(() => friendsStore.myFriends.length > 0)

const availableUsers = computed(() =>
  usersStore.users.filter(
    user => user.id !== auth.user?.id && !friendsStore.myFriendIds.includes(user.id)
  )
)

onMounted(async () => {
  try {
    await activitiesStore.loadActivityTypes()
    await usersStore.loadUsers()
    await friendsStore.loadFriends()
    await friendsStore.loadFriendsFeed(true)
  } catch (e: any) {
    error.value = e.message ?? 'Failed to load friends.'
  } finally {
    loading.value = false
  }
})

async function addFriend() {
  if (!selectedFriendId.value) return
  error.value = null
  try {
    await friendsStore.addFriend(selectedFriendId.value)
    selectedFriendId.value = ''
  } catch (e: any) {
    error.value = e.message ?? 'Failed to add friend.'
  }
}

async function removeFriend(friendId: string) {
  const ok = confirm('Remove this friend?')
  if (!ok) return
  error.value = null
  try {
    await friendsStore.removeFriend(friendId)
  } catch (e: any) {
    error.value = e.message ?? 'Failed to remove friend.'
  }
}

useInfiniteScroll(
  feedContainer,
  async () => {
    if (friendsStore.hasMoreFeed && !friendsStore.isLoadingFeed) {
      await friendsStore.loadMoreFriendsFeed()
    }
  },
  {
    distance: 120,
    canLoadMore: () => friendsStore.hasMoreFeed,
  }
)

watch(
  () => friendsStore.myFriendIds.length,
  async () => {
    if (!loading.value) {
      await friendsStore.loadFriendsFeed(true)
    }
  }
)
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="level">
        <div class="level-left">
          <div>
            <h1 class="title">Friends Feed</h1>
            <p class="subtitle">See your friends’ latest workouts (read-only).</p>
          </div>
        </div>

        <div class="level-right">
          <RouterLink class="button" to="/">Back</RouterLink>
        </div>
      </div>

      <div v-if="error" class="notification is-danger is-light">{{ error }}</div>

      <div v-if="loading" class="notification is-info is-light">Loading friends...</div>

      <div v-else>
        <div class="box">
          <h2 class="title is-6">Add Friend</h2>
          <div class="field is-grouped">
            <div class="control is-expanded">
              <div class="select is-fullwidth">
                <select v-model="selectedFriendId">
                  <option disabled value="">Select a user</option>
                  <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                    {{ user.firstName }} {{ user.lastName }} ({{ user.email ?? 'no email' }})
                  </option>
                </select>
              </div>
            </div>
            <div class="control">
              <button class="button is-link" :disabled="!selectedFriendId" @click="addFriend">
                Add
              </button>
            </div>
          </div>
          <p v-if="availableUsers.length === 0" class="help">No available users to add.</p>
        </div>

        <div v-if="!hasFriends" class="notification is-info is-light">
          You don’t have any friends yet.
        </div>

        <div v-else>
          <div class="box">
            <h2 class="title is-6">Your Friends</h2>
            <div class="tags">
              <span v-for="f in friendsStore.myFriends" :key="f.id" class="tag is-info is-light">
                {{ f.firstName }} {{ f.lastName }}
                <button class="delete is-small" @click="removeFriend(f.id)"></button>
              </span>
            </div>
          </div>

          <div class="box">
            <div class="level mb-3">
              <div class="level-left">
                <h2 class="title is-6 mb-0">Friend Activities</h2>
              </div>
              <div class="level-right">
                <p class="has-text-grey">
                  Showing {{ friendsStore.friendsFeed.length }}
                  <span v-if="friendsStore.totalFeedCount !== null">
                    of {{ friendsStore.totalFeedCount }}
                  </span>
                </p>
              </div>
            </div>

            <div ref="feedContainer" class="feed-scroll">
              <div
                v-if="friendsStore.friendsFeed.length === 0 && friendsStore.isLoadingFeed"
                class="feed-skeleton"
              >
                <div class="skeleton-row" v-for="n in 5" :key="n"></div>
              </div>

              <div
                v-else-if="friendsStore.friendsFeed.length === 0"
                class="notification is-warning is-light"
              >
                Your friends have no activities yet.
              </div>

              <table v-else class="table is-fullwidth is-striped is-hoverable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Friend</th>
                    <th>Type</th>
                    <th>Minutes</th>
                    <th>Notes</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="item in friendsStore.friendsFeed"
                    :key="`${item.friendId}-${item.activity.id}`"
                  >
                    <td>{{ item.activity.date }}</td>
                    <td>{{ item.friendName }}</td>
                    <td>{{ activitiesStore.getActivityTypeLabel(item.activity.type) }}</td>
                    <td>{{ item.activity.minutes }}</td>
                    <td>{{ item.activity.notes ?? '' }}</td>
                  </tr>
                </tbody>
              </table>

              <div v-if="friendsStore.isLoadingFeed" class="has-text-centered py-4">
                Loading more activities...
              </div>

              <div
                v-else-if="!friendsStore.hasMoreFeed && friendsStore.friendsFeed.length > 0"
                class="has-text-centered has-text-grey py-4"
              >
                You’ve reached the end.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feed-scroll {
  max-height: 70vh;
  overflow-y: auto;
}

.feed-skeleton {
  display: grid;
  gap: 12px;
  padding: 12px 0;
}

.skeleton-row {
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 37%, #2a2a2a 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>