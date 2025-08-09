// User management operations

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  db
} from '../firebase/firestore-base';
import { convertTimestamps } from '../firebase/firestore-base';
import type { UserProfile } from '../types';

export const userService = {
  // Get all users (Admin only)
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('displayName'),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        users.push({
          uid: doc.id,
          ...convertTimestamps(doc.data())
        } as UserProfile);
      });

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Update user role (Admin only)
  async updateUserRole(userId: string, newRole: 'user' | 'admin' | 'super_admin'): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Migrate existing users to add role field (Admin only)
  async migrateUserRoles(): Promise<{success: number, failed: number, total: number}> {
    try {
      const allUsers = await this.getAllUsers();
      let success = 0;
      let failed = 0;
      
      for (const user of allUsers) {
        try {
          if (!user.role) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              role: 'user', // Default role
              updatedAt: serverTimestamp()
            });
            success++;
          } else {
            success++; // Already has role
          }
        } catch (error) {
          console.error(`Failed to update user ${user.uid}:`, error);
          failed++;
        }
      }
      
      return {
        success,
        failed,
        total: allUsers.length
      };
    } catch (error) {
      console.error('Error migrating user roles:', error);
      throw error;
    }
  }
};