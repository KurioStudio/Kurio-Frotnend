import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../../../lib/firebase'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
const authSessionKey = 'kurio_auth_session'

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

function saveCachedSession(session: CachedAuthSession): void {
  localStorage.setItem(authSessionKey, JSON.stringify(session))
}

export function getCachedSession(): CachedAuthSession | null {
  const rawSession = localStorage.getItem(authSessionKey)

  if (!rawSession) {
    return null
  }

  try {
    const parsedSession = JSON.parse(rawSession) as Partial<CachedAuthSession>

    if (!parsedSession.idToken || !parsedSession.uid) {
      return null
    }

    return {
      uid: parsedSession.uid,
      idToken: parsedSession.idToken,
    }
  } catch {
    return null
  }
}

export function clearCachedSession(): void {
  localStorage.removeItem(authSessionKey)
}

async function validateSessionInBackend(idToken: string): Promise<string | undefined> {
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
}

export async function hasValidSession(): Promise<boolean> {
  const cachedSession = getCachedSession()

  if (!cachedSession) {
    return false
  }

  if (!apiBaseUrl) {
    return true
  }

  try {
    const backendUid = await validateSessionInBackend(cachedSession.idToken)

    if (!backendUid) {
      clearCachedSession()
      return false
    }

    return true
  } catch {
    clearCachedSession()
    return false
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth)
  clearCachedSession()
}

export async function sendForgotPasswordEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const idToken = await credential.user.getIdToken()
  const backendUid = await validateSessionInBackend(idToken)

  saveCachedSession({
    uid: credential.user.uid,
    idToken,
  })

  return {
    uid: credential.user.uid,
    idToken,
    backendUid,
  }
}

export async function registerWithEmail(payload: RegisterPayload): Promise<LoginResult> {
  const credential = await createUserWithEmailAndPassword(auth, payload.email, payload.password)
  const idToken = await credential.user.getIdToken()

  try {
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

    const backendUid = await validateSessionInBackend(idToken)

    if (apiBaseUrl && !backendUid) {
      throw new Error('El backend no devolvio un usuario valido')
    }

    saveCachedSession({
      uid: credential.user.uid,
      idToken,
    })

    return {
      uid: credential.user.uid,
      idToken,
      backendUid,
    }
  } catch (error) {
    await deleteUser(credential.user)
    throw error
  }
}
