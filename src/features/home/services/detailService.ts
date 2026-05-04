export type comentarios = {
    idPost: string,
    idUser: string,
    contenido: string,
    idComment?: string,
    createdAt?: string
}

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
