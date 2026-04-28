import { getCurrentUser, type User } from "../../auth/services/authService";

export type FeedPost = {
    id: string,
    titulo: string,
    image: string,
    username: string,
    likes: number,
    user: User
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