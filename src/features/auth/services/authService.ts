import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../../../lib/firebase'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
const authSessionKey = 'kurio_auth_session'
const authLastActivityKey = 'kurio_auth_last_activity'
const defaultIdleHours = 8

type LoginResult = {
  uid: string
  idToken: string
  backendUid?: string
}

type RegisterPayload = {
  username: string
  email: string
  password: string
}

type CachedAuthSession = {
  uid: string
  idToken: string
}

export type User = {
  id : string,
  username: string,
  email: string,
  avatarImg: string,
  idToken: string,
  createdAt: string
}

function saveCachedSession(session: CachedAuthSession): void {
  localStorage.setItem(authSessionKey, JSON.stringify(session))
}

const sessionManager = {
  clear(): void {
    localStorage.removeItem(authSessionKey)
    localStorage.removeItem(authLastActivityKey)
  },

  touch(): void {
    localStorage.setItem(authLastActivityKey, String(Date.now()))
  },

  idleTimeoutMs(): number {
    const rawHours = Number(import.meta.env.VITE_AUTH_IDLE_HOURS ?? defaultIdleHours)

    if (!Number.isFinite(rawHours) || rawHours <= 0) {
      return defaultIdleHours * 60 * 60 * 1000
    }

    return rawHours * 60 * 60 * 1000
  },

  lastActivityTimestamp(): number {
    const stored = localStorage.getItem(authLastActivityKey)

    if (!stored) {
      return 0
    }

    const timestamp = Number(stored)
    return Number.isFinite(timestamp) ? timestamp : 0
  },

  expiredByInactivity(): boolean {
    const lastActivity = this.lastActivityTimestamp()

    if (!lastActivity) {
      return false
    }

    return Date.now() - lastActivity > this.idleTimeoutMs()
  },

  async validateInBackend(idToken: string): Promise<string | undefined> {
    if (!apiBaseUrl) {
      return undefined
    }

    const response = await fetch(`${apiBaseUrl}/api/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(errorBody || 'No se pudo validar la sesion con el backend')
    }

    return (await response.text()).trim()
  },

  async forceLogout(): Promise<void> {
    try {
      await signOut(auth)
    } catch {
      // Ignore firebase signOut failures and still clear local data.
    } finally {
      this.clear()
    }
  },

  async validateActive(user: FirebaseUser): Promise<boolean> {
    if (this.expiredByInactivity()) {
      await this.forceLogout()
      return false
    }

    try {
      const idToken = await user.getIdToken()

      if (apiBaseUrl) {
        await this.validateInBackend(idToken)
      }

      this.touch()
      return true
    } catch {
      await this.forceLogout()
      return false
    }
  },
}

export function touchSessionActivity(): void {
  sessionManager.touch()
}

export async function hasValidSession(): Promise<boolean> {
  try {
    const user = getAuth().currentUser

    if (!user) {
      sessionManager.clear()
      return false
    }

    return await sessionManager.validateActive(user)
  } catch {
    sessionManager.clear()
    return false
  }
}

export async function logoutUser(): Promise<void> {
  await sessionManager.forceLogout()
}

export async function sendForgotPasswordEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const idToken = await credential.user.getIdToken()
  const backendUid = await sessionManager.validateInBackend(idToken)

  saveCachedSession({
    uid: credential.user.uid,
    idToken,
  })
  sessionManager.touch()

  return {
    uid: credential.user.uid,
    idToken,
    backendUid,
  }
}

export async function getCurrentUser() : Promise<User | null> {
  const user = getAuth().currentUser

  if(!user) {
    sessionManager.clear()
    return null
  }

  const isSessionValid = await sessionManager.validateActive(user)

  if (!isSessionValid) {
    return null
  }

  const idToken = await user.getIdToken()

  return {
    id: user.uid,
    username: user.email ?? 'Usuario desconocido',
    email: user.email ?? '',
    avatarImg: '',
    idToken: idToken,
    createdAt: ''
  }
}

export async function registerWithEmail(payload: RegisterPayload): Promise<LoginResult> {
    if (apiBaseUrl) {
      const response = await fetch(`${apiBaseUrl}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: payload.username,
          email: payload.email,
          password: payload.password,
        }),
      })
      
      const body = (await response.text()).trim()
      
      if (!response.ok || body !== '0') {
        throw new Error(body || 'No se pudo registrar el usuario en el backend')
      }
    }

    let userID: string | undefined = undefined
    let idToken: string | undefined = undefined
    onAuthStateChanged(getAuth(), (user) => {
      userID = user?.uid
      user?.getIdToken().then(token => {
        idToken = token
      })
    })

    saveCachedSession({
      uid: userID ?? '',
      idToken: idToken ?? '',
    })
    sessionManager.touch()

    return {
      uid: userID ?? '',
      idToken: idToken ?? ''
    }
}

export async function getUserById(id: string): Promise<User> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${id}`, {
        method: 'GET',
    })
    const user = await response.json()
    console.log('Usuario recibido:', user)
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarImg: user.avatarImg,
        idToken: '',
        createdAt: user.createdAt
    }
}