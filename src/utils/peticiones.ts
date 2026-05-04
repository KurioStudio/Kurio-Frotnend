import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../lib/firebase'

// Types
export type FeedPost = {
    id: string,
    titulo: string,
    image: string,
    username: string,
    likes: number,
    user: User
}

export type PostDetail = {
    id: string,
    titulo: string,
    descripcion: string,
    imagenes: string[],
    cantComentarios: number,
    likes: number,
    likedBy: string[],
    licencia: string,
    createdAt: string,
    user: {
        id: string,
        username: string,
        avatarImg: string,
        email: string,
    }
}

export type Post = {
    id: string,
    titulo: string,
    descripcion: string,
    imagenes: string[] | File[],
    cantComentarios: number,
    user: {
        id: string,
        username: string,
        avatarImg: string,
        email: string
    },
    likedBy: string[],
    oid: string,
    licencia: string,
    file: File,
    createdAt: string
}

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

export type comentarios = {
    idPost: string,
    idUser: string,
    contenido: string,
    idComment?: string,
    createdAt?: string
}

// AUTH Service
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
const authSessionKey = 'kurio_auth_session'
const authLastActivityKey = 'kurio_auth_last_activity'
const defaultIdleHours = 8

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

//POST Service
export async function findAllPosts(): Promise<FeedPost[]> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts`, {
        method: 'GET'
    })
    const posts = await response.json()
    return posts.map((post: any) => ({
        id: post.id,
        titulo: post.titulo,
        image: post.imagenes[0] ?? '',
        username: post.user?.username ?? 'Usuario desconocido',
        likes: post.likedBy?.length ?? 0,
        user: {
            id: post.user?.id ?? '',
            username: post.user?.username ?? 'Usuario desconocido',
            avatarImg: post.user?.avatarImg ?? '',
            email: post.user?.email ?? ''
        }
    }))
}

export async function findRecentPosts(): Promise<FeedPost[]> {
    const currentUser = await getCurrentUser()
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/recent`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${currentUser?.idToken ?? ''}`
        }
    })
    const posts = await response.json()
    return posts.map((post: any) => ({
        id: post.id,
        titulo: post.titulo,
        image: post.imagenes[0] ?? '',
        username: post.user?.username ?? 'Usuario desconocido',
        likes: post.likedBy?.length ?? 0,
        user: {
            id: post.user?.id ?? '',
            username: post.user?.username ?? 'Usuario desconocido',
            avatarImg: post.user?.avatarImg ?? '',
            email: post.user?.email ?? ''
        }
    }))
}

export async function findTopPosts(): Promise<FeedPost[]> {
    const currentUser = await getCurrentUser()
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/top`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${currentUser?.idToken ?? ''}`
        }
    })
    const posts = await response.json()
    return posts.map((post: any) => ({
        id: post.id,
        titulo: post.titulo,
        image: post.imagenes[0] ?? '',
        username: post.user?.username ?? 'Usuario desconocido',
        likes: post.likedBy?.length ?? 0,
        user: {
            id: post.user?.id ?? '',
            username: post.user?.username ?? 'Usuario desconocido',
            avatarImg: post.user?.avatarImg ?? '',
            email: post.user?.email ?? ''
        }
    }))
}

export async function findFollowedPosts(): Promise<FeedPost[]> {
    const currentUser = await getCurrentUser()
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/follow`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${currentUser?.idToken ?? ''}`
        },
        body: JSON.stringify({
            userId: currentUser?.id ?? ''
        })
    })
    const posts = await response.json()
    return posts.map((post: any) => ({
        id: post.id,
        titulo: post.titulo,
        image: post.imagenes[0] ?? '',
        username: post.user?.username ?? 'Usuario desconocido',
        likes: post.likedBy?.length ?? 0,
        user: {
            id: post.user?.id ?? '',
            username: post.user?.username ?? 'Usuario desconocido',
            avatarImg: post.user?.avatarImg ?? '',
            email: post.user?.email ?? ''
        }
    }))
}

export async function subirPost(post: Omit<Post, 'id' | 'likedBy' | 'createdAt'>): Promise<void> {
    const currentUser = await getCurrentUser()

    const formData = new FormData()

    formData.append(
        "request",
        new Blob(
            [
                JSON.stringify({
                    titulo: post.titulo,
                    descripcion: post.descripcion,
                    licencia: post.licencia,
                    user: {
                        id: currentUser?.id ?? '',
                        username: currentUser?.username ?? 'Usuario desconocido',
                        avatarImg: '',
                        email: currentUser?.email ?? ''
                    },
                    oid: ""
                })
            ],
            { type: "application/json" }
        )
    )

    post.imagenes.forEach((img) => {
        formData.append(`imagenes`, img)
    })

    formData.append('file', post.file)

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${currentUser?.idToken ?? ''}`
        },
        body: formData
    })
}

export async function likePost(idPost: string): Promise<void> {
    const currentUser = await getCurrentUser()
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/${idPost}/like`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${currentUser?.idToken ?? ''}`
        }
    })
}

export async function descargarFichero(oid: string): Promise<void> {
    const currentUser = await getCurrentUser()
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/${oid}/descargar`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${currentUser?.idToken ?? ''}`
        }
    })

      if (!response.ok) {
    throw new Error("Error al descargar el archivo");
  }

  const blob = await response.blob();

  const contentDisposition = response.headers.get("content-disposition");
  let filename = "archivo";

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+)"?/);
    if (match) filename = match[1];
  }
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function getPostById(idPost: string): Promise<PostDetail> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/${idPost}`, {
        method: 'GET',
    })
    const post = await response.json()
    return {
        id: post.id,
        titulo: post.titulo,
        descripcion: post.descripcion ?? '',
        imagenes: Array.isArray(post.imagenes) ? post.imagenes : [],
        cantComentarios: post.cantComentarios ?? 0,
        likes: post.likedBy?.length ?? 0,
        likedBy: post.likedBy ?? [],
        licencia: post.licencia ?? '',
        createdAt: post.createdAt ?? '',
        user: {
            id: post.user?.id ?? '',
            username: post.user?.username ?? 'Usuario desconocido',
            avatarImg: post.user?.avatarImg ?? '',
            email: post.user?.email ?? '',
        }
    }
}

// DETAIL Service
export async function findAllComments(idPost: string): Promise<comentarios[]> {
    const url = `${import.meta.env.VITE_BACKEND_URL}/comentario/post`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idPost })
    })
    const comentarios = await response.json()
    console.log('Comentarios recibidos:', comentarios)
    return comentarios.map((comentario: any) => ({
        idPost: comentario.idPost,
        idUser: comentario.idUser,
        contenido: comentario.contenido,
        idComment: comentario.idComment,
        createdAt: comentario.createdAt
    }))
}

export const sendComment = async (idPost: string, idUser: string, idToken: string, contenido: string): Promise<string> => { 
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comentario`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken ?? ''}`
        },
        body: JSON.stringify({
            idPost,
            idUser,
            contenido
        })
    })

    const data = await response.text();
    
    return data;
}
