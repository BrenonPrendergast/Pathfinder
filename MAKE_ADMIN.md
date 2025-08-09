# Making Yourself Admin

Since there are no admin users yet, you need to manually create the first admin through Firebase Console:

## Step 1: Sign up to the app first
1. Go to https://pathfinder-000.web.app
2. Create an account (sign up with email or Google)
3. Make sure your user profile is created

## Step 2: Make yourself admin via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/pathfinder-000/firestore)
2. Navigate to **Firestore Database**
3. Click on the `users` collection
4. Find your user document (look for your email)
5. Click **Edit document**
6. If there's no `role` field:
   - Click **Add field**
   - Field name: `role`
   - Field type: `string`
   - Field value: `admin`
7. If there's already a `role` field:
   - Change the value to `admin`
8. Click **Update**

## Step 3: Refresh the app
1. Go back to https://pathfinder-000.web.app
2. Sign out and sign back in
3. You should now see "Admin" in the navigation menu
4. Go to Admin → User Management tab
5. Click "Add Missing Roles" to fix other users

## Alternative: Use Super Admin
- Use `super_admin` instead of `admin` for the role value
- Both roles have the same permissions currently

## After becoming admin:
- You can now manage other users' roles through the admin interface
- The "Add Missing Roles" button will add default `user` roles to anyone missing the role field
- You can promote other users to admin through the dropdown in User Management