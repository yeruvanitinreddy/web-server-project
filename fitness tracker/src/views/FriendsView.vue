<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useFriendsStore } from '@/stores/friends'
import { activityTypeLabels } from '@/stores/activities'

const friendsStore = useFriendsStore()

const hasFriends = computed(() => friendsStore.myFriends.length > 0)
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

      <div v-if="!hasFriends" class="notification is-info is-light">
        You don’t have any friends yet (seeded friends list is empty).
      </div>

      <div v-else>
        <div class="box">
          <h2 class="title is-6">Your Friends</h2>
          <div class="tags">
            <span v-for="f in friendsStore.myFriends" :key="f.id" class="tag is-info is-light">
              {{ f.firstName }} {{ f.lastName }}
            </span>
          </div>
        </div>

        <div v-if="friendsStore.friendsFeed.length === 0" class="notification is-warning is-light">
          Your friends have no activities yet.
        </div>

        <div v-else class="table-container">
          <table class="table is-fullwidth is-striped is-hoverable">
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
              <tr v-for="item in friendsStore.friendsFeed" :key="`${item.friendId}-${item.activity.id}`">
                <td>{{ item.activity.date }}</td>
                <td>{{ item.friendName }}</td>
                <td>{{ activityTypeLabels[item.activity.type] ?? item.activity.type }}</td>
                <td>{{ item.activity.minutes }}</td>
                <td>{{ item.activity.notes ?? '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
