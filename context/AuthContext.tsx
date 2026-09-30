'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, testFirestoreConnection } from '@/lib/firebase';
import { UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('DISTRICT_OFFICER');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().role) {
            setUserRole(userDoc.data().role as UserRole);
          } else {
            // Store initial profile
            await setDoc(doc(db, 'users', currentUser.uid), {
              userId: currentUser.uid,
              displayName: currentUser.displayName || 'Authorized Health Officer',
              email: currentUser.email || '',
              role: userRole,
              district: 'Meerut District',
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          }
        } catch (e) {
          console.warn('Firestore user profile sync fallback:', e);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userRole]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.warn('Google Sign-In popup unavailable in iframe environment, continuing with persona:', error);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        setUserRole,
        isLoading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
