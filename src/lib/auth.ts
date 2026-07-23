import { writable } from 'svelte/store';
import type { UserProfile, GroupDetails } from './types';

export const user = writable<UserProfile | null>(null);
export const activeGroup = writable<GroupDetails | null>(null);
export const authLoading = writable<boolean>(true);

const TOKEN_KEY = 'tasksync_jwt_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function fetchCurrentSession(): Promise<UserProfile | null> {
  const token = getStoredToken();
  if (!token) {
    user.set(null);
    authLoading.set(false);
    return null;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      user.set(data.user);
      if (data.group) {
        activeGroup.set(data.group);
      }
      authLoading.set(false);
      return data.user;
    } else {
      clearStoredToken();
      user.set(null);
    }
  } catch (err) {
    console.error('Session check error:', err);
    clearStoredToken();
    user.set(null);
  } finally {
    authLoading.set(false);
  }
  return null;
}

export async function handleGoogleSignInToken(idToken: string): Promise<boolean> {
  authLoading.set(true);
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    if (res.ok) {
      const data = await res.json();
      setStoredToken(data.token);
      user.set(data.user);
      if (data.group) {
        activeGroup.set(data.group);
      }
      authLoading.set(false);
      return true;
    }
  } catch (err) {
    console.error('Google Auth login error:', err);
  } finally {
    authLoading.set(false);
  }
  return false;
}

export function signOut() {
  clearStoredToken();
  user.set(null);
  activeGroup.set(null);
}
