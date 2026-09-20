import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, FeedbackReport } from '../types';

// Firebase configuration secrets loaded via import.meta.env
export const firebaseEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '',
  oauthClientId: import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || '',
};

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveSessionToCloud: (session: FeedbackReport) => Promise<void>;
  loadCloudSessions: () => Promise<FeedbackReport[]>;
  clearCloudSessions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // Generate user profile if missing
            const email = user.email || '';
            const baseName = (user.displayName || email.split('@')[0] || 'speaker')
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '_')
              .slice(0, 24);
            const now = new Date().toISOString();
            const fallbackProfile: UserProfile = {
              uid: user.uid,
              email,
              username: baseName || 'speaker',
              displayName: user.displayName || 'Speaker',
              photoURL: user.photoURL || undefined,
              createdAt: now,
            };
            await setDoc(doc(db, 'users', user.uid), fallbackProfile);
            setUserProfile(fallbackProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign In / Sign Up with Google (1-Click OAuth)
  const signInWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const user = cred.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      setUserProfile(userDoc.data() as UserProfile);
    } else {
      const email = user.email || '';
      const baseName = (user.displayName || email.split('@')[0] || 'speaker')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .slice(0, 24);
      let chosenUsername = baseName || 'speaker';

      try {
        const checkDoc = await getDoc(doc(db, 'usernames', chosenUsername));
        if (checkDoc.exists()) {
          chosenUsername = `${chosenUsername}_${Math.floor(100 + Math.random() * 900)}`;
        }
      } catch {
        // ignore username collision check error
      }

      const now = new Date().toISOString();
      const newProfile: UserProfile = {
        uid: user.uid,
        email,
        username: chosenUsername,
        displayName: user.displayName || chosenUsername,
        photoURL: user.photoURL || undefined,
        createdAt: now,
      };

      try {
        await setDoc(userDocRef, newProfile);
        await setDoc(doc(db, 'usernames', chosenUsername), {
          username: chosenUsername,
          uid: user.uid,
          email,
          createdAt: now,
        });
      } catch (err) {
        console.warn('Could not persist Google user profile to Firestore:', err);
      }

      setUserProfile(newProfile);
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    await fbSignOut(auth);
    setUserProfile(null);
  };

  // Cloud Session Synchronization
  const saveSessionToCloud = async (session: FeedbackReport): Promise<void> => {
    if (!currentUser) return;
    try {
      const sessionDocRef = doc(db, 'users', currentUser.uid, 'sessions', session.id);
      await setDoc(sessionDocRef, session);
    } catch (err) {
      console.warn('Could not sync session to Firestore cloud:', err);
    }
  };

  const loadCloudSessions = async (): Promise<FeedbackReport[]> => {
    if (!currentUser) return [];
    try {
      const sessionsRef = collection(db, 'users', currentUser.uid, 'sessions');
      const q = query(sessionsRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const reports: FeedbackReport[] = [];
      snapshot.forEach((doc) => {
        reports.push(doc.data() as FeedbackReport);
      });
      return reports;
    } catch (err) {
      console.warn('Could not load sessions from Firestore cloud:', err);
      return [];
    }
  };

  const clearCloudSessions = async (): Promise<void> => {
    if (!currentUser) return;
    try {
      const sessionsRef = collection(db, 'users', currentUser.uid, 'sessions');
      const snapshot = await getDocs(sessionsRef);
      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      console.warn('Could not clear sessions from Firestore cloud:', err);
    }
  };

  const isConfigured = Boolean(firebaseEnv.apiKey && firebaseEnv.projectId);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    isConfigured,
    signInWithGoogle,
    signOut,
    saveSessionToCloud,
    loadCloudSessions,
    clearCloudSessions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
