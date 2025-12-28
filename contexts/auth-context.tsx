"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  updateUserPoints: (points: number) => Promise<void>
  updateUserStats: (statsUpdate: Partial<User["stats"]>) => Promise<void>
  markModuleComplete: (moduleId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        if (userDoc.exists()) {
          setUser(userDoc.data() as User)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName })

    const newUser: User = {
      uid: userCredential.user.uid,
      email,
      displayName,
      points: 0,
      level: 1,
      badges: [],
      stats: {
        scansCompleted: 0,
        modulesCompleted: 0,
        quizzesCompleted: 0,
        chatConversations: 0,
        correctAnswers: 0,
        totalQuestions: 0,
      },
      completedModules: [],
      createdAt: new Date(),
      lastActive: new Date(),
    }

    await setDoc(doc(db, "users", userCredential.user.uid), newUser)
    setUser(newUser)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setFirebaseUser(null)
  }

  const updateUserPoints = async (points: number) => {
    if (!user) return

    const newPoints = user.points + points
    const newLevel = Math.floor(newPoints / 100) + 1

    await updateDoc(doc(db, "users", user.uid), {
      points: newPoints,
      level: newLevel,
      lastActive: new Date(),
    })

    setUser({ ...user, points: newPoints, level: newLevel })
  }

  const updateUserStats = async (statsUpdate: Partial<User["stats"]>) => {
    if (!user) return

    const currentStats = user.stats || {
      scansCompleted: 0,
      modulesCompleted: 0,
      quizzesCompleted: 0,
      chatConversations: 0,
      correctAnswers: 0,
      totalQuestions: 0,
    }

    const newStats = { ...currentStats, ...statsUpdate }

    await updateDoc(doc(db, "users", user.uid), {
      stats: newStats,
      lastActive: new Date(),
    })

    setUser({ ...user, stats: newStats })
  }

  const markModuleComplete = async (moduleId: string) => {
    if (!user) return

    const completedModules = user.completedModules || []
    if (completedModules.includes(moduleId)) return // Already completed

    const updatedModules = [...completedModules, moduleId]

    await updateDoc(doc(db, "users", user.uid), {
      completedModules: updatedModules,
      lastActive: new Date(),
    })

    setUser({ ...user, completedModules: updatedModules })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserPoints,
        updateUserStats,
        markModuleComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
