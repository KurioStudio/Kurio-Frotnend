import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  onAuthStateChanged
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

export type User = {
  id : string,
  username: string,
  email: string,
  avatarImg: string,
  createdAt: string
}

function saveCachedSession(session: CachedAuthSession): void {
  localStorage.setItem(authSessionKey, JSON.stringify(session))
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
  try {
    const user = getAuth().currentUser

    if (!user) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth)
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

export async function getCurrentUser() : Promise<LoginResult | null> {
  const user = getAuth().currentUser

  if(!user) {
    return null
  }

  const idToken = await user.getIdToken()

  return {
    uid: user.uid,
    idToken: idToken
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

    return {
      uid: userID ?? '',
      idToken: idToken ?? ''
    }
}