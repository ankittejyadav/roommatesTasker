import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export const user = writable<User | null>(null);
export const authLoading = writable<boolean>(true);

export function initAuth(): () => void {
  const auth = getFirebaseAuth();
  const unsub = onAuthStateChanged(auth, (u) => {
    user.set(u);
    authLoading.set(false);
  });
  return unsub;
}

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(getFirebaseAuth(), provider);
}

export async function signOut(): Promise<void> {
  await fbSignOut(getFirebaseAuth());
}

export async function updateUserProfile(updates: {
  displayName?: string | null;
  photoURL?: string | null;
}): Promise<void> {
  const auth = getFirebaseAuth();
  const currentUser = auth.currentUser;
  if (currentUser) {
    await updateProfile(currentUser, updates);
    await currentUser.reload();
    user.set(auth.currentUser);
  }
}
