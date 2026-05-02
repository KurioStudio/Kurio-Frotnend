
export type comentarios = {
    idPost: string,
    idUser: string,
    contenido: string,
}

export async function findAllPosts(idPost: string): Promise<comentarios[]> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comentario/post`, {
        method: 'GET',
        
        body: JSON.stringify({
            idPost: idPost
        })
    })
    const comentarios = await response.json()
    return comentarios.map((comentario: any) => ({
        idPost: comentario.idPost,
        idUser: comentario.idUser,
        contenido: comentario.contenido
    }))
}

export const sendComment = async (idPost: string, idUser: string, contenido: string): Promise<string> => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comentario`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idPost,
            idUser,
            contenido
        })
    })
    if (!response.ok) {
        throw new Error('Error al enviar el comentario')
    }
    const data = await response.text();
    
    return data;
}
