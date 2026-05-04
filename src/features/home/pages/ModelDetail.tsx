import { useEffect, useRef, useState } from 'react'
import { Box, Button, ButtonBase, IconButton, InputBase, Typography, Stack, Paper } from '@mui/material'
import {
	IoChevronBackOutline,
	IoChevronForwardOutline,
	IoCubeOutline,
	IoDownloadOutline,
	IoSendOutline,
	IoThumbsUpOutline,
	IoChatbubblesOutline,
	IoShareSocialOutline,
	IoBookmarkOutline,
} from 'react-icons/io5'
import { FaRegCircleUser } from 'react-icons/fa6'
import Header from '../../../components/home/Header'
import SidebarMenu from '../../../components/navigation/SidebarMenu'
import { findAllComments, sendComment, type comentarios, getCurrentUser, getUserById, getPostById, type PostDetail } from '../../../utils/peticiones'
import Comment from '../../../components/details/Comment'
import { useNavigate, useParams } from 'react-router-dom'
import '../../../styles/ModelDetail.css'

type CommentView = comentarios & {
	username: string
}

type ModelPostState = {
	imageIndex: number
	titulo: string
	descripcion: string
	imagenes: string[]
	likes: number
	comentarios: number
	createdAt: string
	authorName: string
}

function ModelDetail() {
  const navigate = useNavigate()
  const { postId } = useParams<{ postId?: string }>()
	const sendCommentButtonRef = useRef<HTMLButtonElement | null>(null)
	const commentInputRef = useRef<HTMLInputElement | null>(null)
	const [postData, setPostData] = useState<ModelPostState>({
		imageIndex: 0,
		titulo: '',
		descripcion: '',
		imagenes: [],
		likes: 0,
		comentarios: 0,
		createdAt: '',
		authorName: '',
	})
	const [commentValue, setCommentValue] = useState('')
	const [comentarios, setComentarios] = useState<CommentView[]>([])
	const currentImages = postData.imagenes.length > 0 ? postData.imagenes : []
	const currentImage = currentImages[postData.imageIndex % currentImages.length]
	const commentCount = comentarios.length

  useEffect(() => {
		let isCancelled = false

		const cargarComentarios = async () => {
			setComentarios([])
			await getCurrentUser()

			if (postId) {
				try {
					const post: PostDetail = await getPostById(postId)
					if (!isCancelled) {
						setPostData({
							imageIndex: 0,
							titulo: post.titulo,
							descripcion: post.descripcion,
							imagenes: post.imagenes.length > 0 ? post.imagenes : [],
							likes: post.likes,
							comentarios: post.cantComentarios,
							createdAt: post.createdAt,
							authorName: post.user.username,
						})
					}
				} catch (error) {
					console.error('Error al cargar el post:', error)
				}
			}

			if (!postId) return
			try {
				const response = await findAllComments(postId)
				const comentariosConUsuario = await Promise.all(
					response.map(async (comentario) => {
						try {
							const usuario = await getUserById(comentario.idUser)
							return {
								...comentario,
								username: usuario.username,
							}
						} catch {
							return {
								...comentario,
								username: comentario.idUser,
							}
						}
					})
				)
				if (!isCancelled) {
					setComentarios(comentariosConUsuario)
				}
			} catch (error) {
				if (!isCancelled) {
					setComentarios([])
				}
				console.error('Error al cargar comentarios:', error)
			}
		}
		cargarComentarios()

		return () => {
			isCancelled = true
		}
  }, [postId])

	const handleSendComment = async () => {
		if (!postId) return

		const user = await getCurrentUser()

		if (!user) {
			navigate('/auth/login', { replace: true })
			return
		}

		if (!commentValue.trim()) return
		try {
			await sendComment(postId, user.id, user.idToken, commentValue)
			// recargar comentarios desde el backend para asegurarnos que se muestran correctamente
			const updated = await findAllComments(postId)
			const updatedWithUser = await Promise.all(
				updated.map(async (comentario) => {
					try {
						const usuario = await getUserById(comentario.idUser)
						return { ...comentario, username: usuario.username }
					} catch {
						return { ...comentario, username: comentario.idUser }
					}
				})
			)
			setComentarios(updatedWithUser)
			setCommentValue('')
		} catch (error) {
			console.error('Error al enviar comentario:', error)
		}
	}

	const handleScrollToComments = () => {
		sendCommentButtonRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' })
		commentInputRef.current?.focus()
	}

	return (
		<Box className="model-detail">
			<SidebarMenu />
			<Header />

			<Stack spacing={2} className="model-detail__container">

				<Box className="model-detail__grid">

					<Paper elevation={0} className="model-detail__gallery-paper">

						<Box className="model-detail__image-container">
							<Box component="img" src={currentImage} alt="Modelo 3D" className="model-detail__image" />

							<Button className="model-detail__preview-btn" startIcon={<IoCubeOutline />}>
								Vista previa en 3D
							</Button>
						</Box>


						<Box className="model-detail__thumbnails" role="list" aria-label="Miniaturas del modelo">
							<IconButton 
								className="model-detail__carousel-btn model-detail__carousel-btn--prev"
								onClick={() => setPostData((current) => ({ ...current, imageIndex: (current.imageIndex - 1 + currentImages.length) % currentImages.length }))} 
								aria-label="Imagen anterior">
								<IoChevronBackOutline />
							</IconButton>

							{currentImages.map((image, idx) => (
								<ButtonBase 
									key={`${image}-${idx}`} 
									onClick={() => setPostData((current) => ({ ...current, imageIndex: idx }))} 
									className={`model-detail__thumbnail ${postData.imageIndex === idx ? 'model-detail__thumbnail--active' : ''}`}>
									<Box component="img" src={image} alt={`Miniatura ${idx + 1}`} className="model-detail__thumbnail-img" />
								</ButtonBase>
							))}

							<IconButton 
								className="model-detail__carousel-btn model-detail__carousel-btn--next"
								onClick={() => setPostData((current) => ({ ...current, imageIndex: (current.imageIndex + 1) % currentImages.length }))} 
								aria-label="Imagen siguiente">
								<IoChevronForwardOutline />
							</IconButton>
						</Box>


						<Box className="model-detail__meta-row">
							<Box className="model-detail__meta-group">
								<FaRegCircleUser className="model-detail__user-icon" />
								<Typography className="model-detail__username">{postData.authorName}</Typography>
								<Button className="model-detail__follow-btn">Seguir</Button>
							</Box>

							<Box className="model-detail__likes-badge">
								<IoThumbsUpOutline />
								<Typography>{postData.likes}</Typography>
							</Box>
						</Box>
					</Paper>


					<Paper elevation={0} className="model-detail__info-paper">
						<Typography className="model-detail__info-date">
							Fecha publicación: {postData.createdAt ? new Date(postData.createdAt).toLocaleDateString() : 'Sin fecha'}
						</Typography>
						<Typography className="model-detail__info-title">
							{postData.titulo}
						</Typography>
						<Typography className="model-detail__info-desc">
							{postData.descripcion}
						</Typography>

						<Button className="model-detail__download-btn" startIcon={<IoDownloadOutline />}>
							Descargar
						</Button>


						<Box className="model-detail__stats-bar">
							{[{ icon: IoThumbsUpOutline, label: 'Me gusta', num: String(postData.likes) }, { icon: IoBookmarkOutline, label: 'Guardar', num: undefined }, { icon: IoChatbubblesOutline, label: 'Comentarios', num: String(commentCount) }, { icon: IoShareSocialOutline, label: 'Compartir', num: undefined }].map((stat) => (
								<IconButton
									key={stat.label}
									className="model-detail__stat-btn"
									aria-label={stat.label}
									onClick={stat.label === 'Comentarios' ? handleScrollToComments : undefined}
								>
									<stat.icon />
									{stat.num && <Typography component="span" className="model-detail__stat-num">{stat.num}</Typography>}
								</IconButton>
							))}
						</Box>
					</Paper>
				</Box>


				<Paper elevation={0} className="model-detail__comments-paper">
					<Typography className="model-detail__comments-title">
						Comentarios ({commentCount})
					</Typography>

					<Box className="model-detail__comment-input-row">
						<InputBase
							placeholder="Escribe tu comentario..."
							value={commentValue}
							onChange={(e) => setCommentValue(e.target.value)}
							className="model-detail__comment-input"
							fullWidth
							inputRef={commentInputRef}
						/>
						<Button className="model-detail__send-btn" variant="contained" endIcon={<IoSendOutline />} onClick={handleSendComment} ref={sendCommentButtonRef}>
							Enviar
						</Button>
					</Box>
						<Box className="model-detail__comments-list">
							{comentarios.map((cmt, idx) => (
                <Comment
                  key={`${cmt.idPost}-${cmt.idUser}-${idx}`}
                  idPost={cmt.idPost}
					  username={cmt.username}
                  contenido={cmt.contenido}
									createdAt={cmt.createdAt}
                  idComment={`${cmt.idPost}-${idx}`}
                  />
              ))}
						</Box>
				</Paper>
			</Stack>
		</Box>
	)
}

export default ModelDetail
