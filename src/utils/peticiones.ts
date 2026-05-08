import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
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
  user: Pick<User, 'id' | 'username' | 'avatarImg' | 'email'>
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
    oid: string,
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

export type ProfileUser = Pick<User, 'id' | 'username' | 'email' | 'avatarImg' | 'createdAt'> & {
  followersCount: number
  followingCount: number
  isFollowedByCurrentUser?: boolean
}

export type comentarios = {
    idPost: string,
    idUser: string,
    contenido: string,
    idComment?: string,
    createdAt?: string
}

export type FollowRequest = {
  idFollower: string
  idFollowed: string
}

type FeedPostResponse = {
  id: string
  titulo: string
  imagenes?: string[]
  user?: {
    id?: string
    username?: string
    avatarImg?: string
    email?: string
  }
  likedBy?: string[]
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
    username: user.displayName ?? 'Usuario desconocido',
    email: user.email ?? '',
    avatarImg: '',
    idToken: idToken,
    createdAt: ''
  }
}

export async function registerWithEmail(payload: RegisterPayload): Promise<LoginResult> {
  if (!apiBaseUrl) {
    throw new Error('Backend URL no está configurado')
  }

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

  // After backend registration, sign in with Firebase using the credentials
  const credential = await signInWithEmailAndPassword(auth, payload.email, payload.password)
  const idToken = await credential.user.getIdToken()

  saveCachedSession({
    uid: credential.user.uid,
    idToken,
  })
  sessionManager.touch()

  return {
    uid: credential.user.uid,
    idToken,
  }
}

export async function getUserById(id: string): Promise<User> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${id}`, {
        method: 'GET',
    })
    const user = await response.json()
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarImg: user.avatarImg,
        idToken: '',
        createdAt: user.createdAt
    }
}

const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

export async function getProfileUserById(id: string): Promise<ProfileUser> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(errorBody || 'No se pudo cargar el perfil del usuario')
  }

  const user = await response.json()
  const followersCount = toSafeNumber(
    user.followersCount
    ?? user.cantSeguidores
    ?? user.followers
    ?? user.seguidores
    ?? user.followers_count
    ?? (Array.isArray(user.followersList) ? user.followersList.length : undefined)
    ?? (Array.isArray(user.seguidoresList) ? user.seguidoresList.length : undefined)
  )
  const followingCount = toSafeNumber(
    user.followingCount
    ?? user.cantSeguidos
    ?? user.following
    ?? user.seguidos
    ?? user.following_count
    ?? (Array.isArray(user.followingList) ? user.followingList.length : undefined)
    ?? (Array.isArray(user.seguidosList) ? user.seguidosList.length : undefined)
  )

  return {
    id: user.id ?? '',
    username: user.username ?? 'Usuario desconocido',
    email: user.email ?? '',
    avatarImg: user.avatarImg ?? '',
    createdAt: user.createdAt ?? '',
    followersCount,
    followingCount,
    isFollowedByCurrentUser: Boolean(
      user.isFollowedByCurrentUser
      ?? user.followedByCurrentUser
      ?? user.siguiendo
      ?? user.isFollowing
    )
  }
}

export async function findPostsByUserId(userId: string): Promise<FeedPost[]> {
  const trimmedUserId = userId.trim()

  if (!trimmedUserId) {
    return []
  }

  const encodedUserId = encodeURIComponent(trimmedUserId)
  const userPostsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/user/${encodedUserId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (userPostsResponse.ok) {
    const posts = await userPostsResponse.json()
    return posts.map(mapFeedPost)
  }

  const fallbackResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!fallbackResponse.ok) {
    const errorBody = await fallbackResponse.text().catch(() => '')
    throw new Error(errorBody || 'No se pudieron cargar los posts del perfil')
  }

  const posts = await fallbackResponse.json()
  return posts
    .filter((post: FeedPostResponse) => (post.user?.id ?? '') === trimmedUserId)
    .map(mapFeedPost)
}

export async function followUser(idFollower: string, idFollowed: string): Promise<void> {
  const follower = encodeURIComponent(idFollower)
  const followed = encodeURIComponent(idFollowed)

  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/follow?idFollower=${follower}&idFollowed=${followed}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }
  )

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(errorBody || 'No se pudo seguir al usuario')
  }
}

export async function unfollowUser(idFollower: string, idFollowed: string): Promise<void> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/follow?idFollower=${idFollower}&idFollowed=${idFollowed}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(errorBody || 'No se pudo dejar de seguir al usuario')
  }
}

//POST Service
const mapFeedPost = (post: FeedPostResponse): FeedPost => ({
  id: post.id,
  titulo: post.titulo,
  image: post.imagenes?.[0] ?? '',
  username: post.user?.username ?? 'Usuario desconocido',
  likes: post.likedBy?.length ?? 0,
  user: {
    id: post.user?.id ?? '',
    username: post.user?.username ?? 'Usuario desconocido',
    avatarImg: post.user?.avatarImg ?? '',
    email: post.user?.email ?? ''
  }
})

export async function findAllPosts(): Promise<FeedPost[]> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts`, {
        method: 'GET'
    })
    const posts = await response.json()
  return posts.map(mapFeedPost)
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
    return posts.map(mapFeedPost)
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
    return posts.map(mapFeedPost)
}

export async function findFollowedPosts(): Promise<FeedPost[]> {
    const currentUser = await getCurrentUser()
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/follow`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${currentUser?.idToken ?? ''}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idFollower: currentUser?.id ?? ''
        })
    })
    const posts = await response.json()
    return posts.map(mapFeedPost)
}

export async function getFollowersCount(userId: string): Promise<number> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${encodeURIComponent(userId)}/followers`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  })

  if (!response.ok) {
    return 0
  }

  try {
    const data = await response.json()
    if (Array.isArray(data)) return data.length
    if (typeof data === 'number') return data
    if (typeof data === 'string') return Number.parseInt(data, 10) || 0
    return 0
  } catch {
    const txt = await response.text().catch(() => '')
    const parsed = Number.parseInt(txt.trim(), 10)
    return Number.isFinite(parsed) ? parsed : 0
  }
}

export async function getFollowedCount(userId: string): Promise<number> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${encodeURIComponent(userId)}/followed`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  })

  if (!response.ok) {
    return 0
  }

  try {
    const data = await response.json()
    if (Array.isArray(data)) return data.length
    if (typeof data === 'number') return data
    if (typeof data === 'string') return Number.parseInt(data, 10) || 0
    return 0
  } catch {
    const txt = await response.text().catch(() => '')
    const parsed = Number.parseInt(txt.trim(), 10)
    return Number.isFinite(parsed) ? parsed : 0
  }
}

export async function findPostsByTitle(titulo: string): Promise<FeedPost[]> {
  const title = titulo.trim()

  if (!title) {
    return []
  }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/title?title=${encodeURIComponent(title)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(errorText || 'Error buscando publicaciones por título')
  }

  const posts = await response.json()
  return posts.map(mapFeedPost)
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

export async function updateProfile(userId: string, username: string, file?: File | null): Promise<any> {
  const currentUser = await getCurrentUser()

  const formData = new FormData()

  formData.append(
    'request',
    new Blob([
      JSON.stringify({
        id: userId ?? '',
        username: username ?? '',
        email: currentUser?.email ?? ''
      })
    ], { type: 'application/json' })
  )

  formData.append('file', file? file : new Blob())

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${currentUser?.idToken ?? ''}`
    },
    body: formData
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    throw new Error(err || 'No se pudo actualizar el perfil')
  }

  // Try to parse json response; if not JSON, return text
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
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

export async function savePost(idPost: string, idUser: string): Promise<void> {
  const currentUser = await getCurrentUser()

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/guardar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${currentUser?.idToken ?? ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idPost, idUser }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(errorBody || 'No se pudo guardar la publicación')
  }
}

export async function unsavePost(idPost: string, idUser: string): Promise<void> {
  const currentUser = await getCurrentUser()

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/guardar`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${currentUser?.idToken ?? ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idPost, idUser }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(errorBody || 'No se pudo eliminar el guardado')
  }
}

export async function findSavedPostsByUser(idUser: string): Promise<FeedPost[]> {
  const trimmed = idUser.trim()
  if (!trimmed) return []

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/${encodeURIComponent(trimmed)}/guardados`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(errorBody || 'No se pudieron cargar los posts guardados')
  }

  const posts = await response.json()
  return posts.map(mapFeedPost)
}

export async function isPostSaved(idPost: string, idUser: string): Promise<boolean> {
  try {
    const currentUser = await getCurrentUser()

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/isGuardado`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentUser?.idToken ?? ''}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ idPost, idUser }),
    })

    if (!response.ok) {
      return false
    }

    const text = await response.text()
    const trimmed = text.trim().toLowerCase()

    if (trimmed === 'true' || trimmed === '1') return true
    if (trimmed === 'false' || trimmed === '0' || !trimmed) return false

    try {
      return Boolean(JSON.parse(text))
    } catch {
      return false
    }
  } catch {
    return false
  }
}

export async function getModelSTL(oid: string): Promise<Blob> {
    const currentUser = await getCurrentUser()
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/${oid}/descargar`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${currentUser?.idToken ?? ''}`
        }
    })

    if (!response.ok) {
        throw new Error('Error al descargar el modelo STL')
    }

    return await response.blob()
}

export async function checkIfUserFollows(idFollower: string, idFollowed: string): Promise<boolean> {
  try {
    const requestBody: FollowRequest = {
      idFollower,
      idFollowed,
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/follow/isFollowing`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      return false
    }

    const responseText = await response.text()
    const trimmedResponse = responseText.trim().toLowerCase()

    if (trimmedResponse === 'true' || trimmedResponse === '0') {
      return true
    }

    if (trimmedResponse === 'false' || trimmedResponse === '-1' || !trimmedResponse) {
      return false
    }

    try {
      return Boolean(JSON.parse(responseText))
    } catch {
      return false
    }
  } catch {
    return false
  }
}

function getFilenameFromDisposition(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;

  // filename*=UTF-8''archivo.3mf
  let match = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (match) {
    return decodeURIComponent(match[1]);
  }

  // filename="archivo.3mf" o filename=archivo.3mf
  match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
  if (match) {
    return match[1].replace(/['"]/g, "").trim();
  }

  return null;
}

function extensionFromMimeType(contentType: string | null): string {
  if (!contentType) return "";

  const type = contentType.toLowerCase();

  if (
    type.includes("3mf") ||
    type.includes("3dmanufacturing") ||
    type.includes("zip")
  ) {
    return ".3mf";
  }

  if (type.includes("stl")) {
    return ".stl";
  }

  return "";
}

export async function descargarFichero(oid: string): Promise<void> {
  const currentUser = await getCurrentUser();

  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/posts/${oid}/descargar`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${currentUser?.idToken ?? ""}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error al descargar el archivo");
  }

  const blob = await response.blob();

  // Intentar obtener nombre desde Content-Disposition
  let filename =
    getFilenameFromDisposition(response.headers.get("content-disposition")) ||
    "archivo";

  // Si no tiene extensión, usar Content-Type
  if (!/\.[a-zA-Z0-9]+$/.test(filename)) {
    const ext = extensionFromMimeType(response.headers.get("content-type"));
    filename += ext || ".stl";
  }

  const url = window.URL.createObjectURL(blob);

  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    window.URL.revokeObjectURL(url);
  }
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
        oid: post.oid ?? '',
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