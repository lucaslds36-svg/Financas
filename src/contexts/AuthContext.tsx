import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { FamilyGroup, FamilyMemberInfo } from '../types/budget';

interface AuthContextType {
  user: User | null;
  family: FamilyGroup | null;
  familyMembers: FamilyMemberInfo[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  joinFamilyWithCode: (code: string) => Promise<boolean>;
  updateFamilyName: (name: string) => Promise<void>;
  createNewFamily: (name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<FamilyGroup | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Monitor Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      setError(null);

      if (!currentUser) {
        setFamily(null);
        setFamilyMembers([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsSyncing(true);
        // Load or initialize user document
        const userDocRef = doc(db, 'users', currentUser.uid);
        let userSnap;
        try {
          userSnap = await getDoc(userDocRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        }

        let familyId: string | null = null;

        if (!userSnap.exists()) {
          // First time sign-in: create user profile
          const defaultFamilyId = `fam_${currentUser.uid.slice(0, 8)}_${Date.now().toString(36)}`;
          const inviteCode = generateInviteCode();
          const defaultFamilyName = currentUser.displayName 
            ? `Orçamento ${currentUser.displayName.split(' ')[0]}` 
            : 'Orçamento da Família';

          const newFamily: FamilyGroup = {
            id: defaultFamilyId,
            name: defaultFamilyName,
            code: inviteCode,
            ownerUid: currentUser.uid,
            memberUids: [currentUser.uid],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Create family doc
          try {
            await setDoc(doc(db, 'families', defaultFamilyId), newFamily);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `families/${defaultFamilyId}`);
          }

          // Create user doc
          try {
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Usuário',
              photoURL: currentUser.photoURL || '',
              familyId: defaultFamilyId,
              createdAt: new Date().toISOString(),
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}`);
          }

          familyId = defaultFamilyId;
        } else {
          familyId = userSnap.data()?.familyId || null;

          // Update display name or photo if changed
          try {
            await updateDoc(userDocRef, {
              displayName: currentUser.displayName || userSnap.data()?.displayName || 'Usuário',
              photoURL: currentUser.photoURL || userSnap.data()?.photoURL || '',
            });
          } catch (e) {
            console.warn('Could not update user display info:', e);
          }
        }

        if (familyId) {
          // Listen to family updates
          const familyDocRef = doc(db, 'families', familyId);
          const unsubFamily = onSnapshot(
            familyDocRef,
            (snap) => {
              if (snap.exists()) {
                const data = snap.data() as FamilyGroup;
                setFamily(data);

                // Fetch members info
                if (data.memberUids && data.memberUids.length > 0) {
                  Promise.all(
                    data.memberUids.map(async (mUid) => {
                      try {
                        const mSnap = await getDoc(doc(db, 'users', mUid));
                        if (mSnap.exists()) {
                          const mData = mSnap.data();
                          return {
                            uid: mUid,
                            email: mData.email || '',
                            displayName: mData.displayName || (mUid === currentUser.uid ? 'Você' : 'Cônjuge'),
                            photoURL: mData.photoURL || '',
                          };
                        }
                      } catch {
                        // ignore individual profile read
                      }
                      return {
                        uid: mUid,
                        email: '',
                        displayName: mUid === currentUser.uid ? 'Você' : 'Cônjuge',
                      };
                    })
                  ).then((members) => {
                    setFamilyMembers(members);
                  });
                }
              }
              setIsSyncing(false);
              setIsLoading(false);
            },
            (err: unknown) => {
              handleFirestoreError(err, OperationType.GET, `families/${familyId}`);
            }
          );

          return () => unsubFamily();
        } else {
          setIsLoading(false);
          setIsSyncing(false);
        }
      } catch (err) {
        console.error('Error during user auth setup:', err);
        setError('Erro ao sincronizar com a nuvem. Operando em modo offline.');
        setIsLoading(false);
        setIsSyncing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign In Error:', err);
      setError('Falha ao autenticar com o Google. Verifique sua conexão e tente novamente.');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setFamily(null);
      setFamilyMembers([]);
    } catch (err) {
      console.error('Logout Error:', err);
    }
  }, []);

  const joinFamilyWithCode = useCallback(
    async (codeToJoin: string): Promise<boolean> => {
      if (!user) {
        setError('Você precisa estar conectado com o Google para entrar em uma família.');
        return false;
      }

      const cleanCode = codeToJoin.trim().toUpperCase();
      if (!cleanCode) return false;

      setIsSyncing(true);
      setError(null);

      try {
        // Query family by code
        const q = query(collection(db, 'families'), where('code', '==', cleanCode));
        let querySnap;
        try {
          querySnap = await getDocs(q);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'families');
        }

        if (querySnap.empty) {
          setError(`Nenhuma família encontrada com o código "${cleanCode}". Verifique se o código está correto com seu cônjuge.`);
          setIsSyncing(false);
          return false;
        }

        const targetFamilyDoc = querySnap.docs[0];
        const targetFamily = targetFamilyDoc.data() as FamilyGroup;
        const targetFamilyId = targetFamilyDoc.id;

        // Check if already in family
        const existingMembers = targetFamily.memberUids || [];
        const newMembers = existingMembers.includes(user.uid) 
          ? existingMembers 
          : [...existingMembers, user.uid];

        // Update family with new member
        try {
          await updateDoc(doc(db, 'families', targetFamilyId), {
            memberUids: newMembers,
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `families/${targetFamilyId}`);
        }

        // Update user profile with familyId
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            familyId: targetFamilyId,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        }

        setFamily({ ...targetFamily, memberUids: newMembers });
        setIsSyncing(false);
        return true;
      } catch (err) {
        console.error('Error joining family:', err);
        setError('Erro ao entrar na família. Verifique o código e tente novamente.');
        setIsSyncing(false);
        return false;
      }
    },
    [user]
  );

  const updateFamilyName = useCallback(
    async (newName: string) => {
      if (!family || !user) return;
      const clean = newName.trim();
      if (!clean) return;

      try {
        await updateDoc(doc(db, 'families', family.id), {
          name: clean,
          updatedAt: new Date().toISOString(),
        });
        setFamily((prev) => (prev ? { ...prev, name: clean } : null));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `families/${family.id}`);
      }
    },
    [family, user]
  );

  const createNewFamily = useCallback(
    async (name?: string) => {
      if (!user) return;
      setIsSyncing(true);
      try {
        const newFamilyId = `fam_${user.uid.slice(0, 8)}_${Date.now().toString(36)}`;
        const code = generateInviteCode();
        const familyName = name?.trim() || `${user.displayName?.split(' ')[0] || 'Nossa'} Família`;

        const newFamily: FamilyGroup = {
          id: newFamilyId,
          name: familyName,
          code,
          ownerUid: user.uid,
          memberUids: [user.uid],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'families', newFamilyId), newFamily);
        await updateDoc(doc(db, 'users', user.uid), {
          familyId: newFamilyId,
        });

        setFamily(newFamily);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'families');
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        family,
        familyMembers,
        isLoading,
        isSyncing,
        error,
        loginWithGoogle,
        logout,
        joinFamilyWithCode,
        updateFamilyName,
        createNewFamily,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
