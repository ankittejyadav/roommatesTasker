'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
    updateUserProfile: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(getFirebaseAuth(), provider);
    };

    const signOut = async () => {
        await firebaseSignOut(getFirebaseAuth());
    };

    const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
        const currentUser = getFirebaseAuth().currentUser;
        if (currentUser) {
            await updateProfile(currentUser, updates);
            // Reload user to get latest profile
            await currentUser.reload();
            // Update state with a copy/fresh user object to trigger re-renders
            setUser(getFirebaseAuth().currentUser);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
