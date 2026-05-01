# Fitness Tracker

Vue 3 + Supabase fitness tracking app with activities, friends, and admin-managed profiles.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Create a `.env` file using the template:
   ```
   cp .env.example .env
   ```
3. Set the Supabase environment values in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Ensure Supabase tables exist (case-sensitive table names are used in the app):
   - `profiles`: `id (uuid PK)`, `email`, `first_name`, `last_name`, `role` (`user` or `admin`)
   - `Activity`: `id`, `user_id (uuid)`, `type`, `duration`, `date`, `notes`
   - `ExerciseTypes`: `name`
   - `Friends`: `user_id (uuid)`, `friend_id (uuid)`
5. Run the dev server:
   ```
   npm run dev
   ```

## Admin access

Set a user's `role` to `admin` in the `profiles` table to grant access to the Admin Users page.
