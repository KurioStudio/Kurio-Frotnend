import { useEffect, useState } from 'react'
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
import { findAllComments, sendComment, type comentarios } from '../services/detailService'
import Comment from '../../../components/details/Comment'
import { getCurrentUser, getUserById, type User } from '../../auth/services/authService'
import { useParams } from 'react-router-dom'
import '../../../styles/ModelDetail.css'

const galleryImages = [
	'https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=1200&q=80',
	'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
	'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80',
]

type CommentView = comentarios & {
	username: string
}

function ModelDetail() {
  const { postId } = useParams<{ postId?: string }>()
	const [imageIndex, setImageIndex] = useState(0)
	const [commentValue, setCommentValue] = useState('')
	const [comentarios, setComentarios] = useState<CommentView[]>([])
	const [currentUser, setCurrentUser] = useState<User | null>(null)
	const currentImage = galleryImages[imageIndex]

  useEffect(() => {
		let isCancelled = false

		const cargarComentarios = async () => {
			setComentarios([])
			const user = await getCurrentUser()
			if (!isCancelled) {
				setCurrentUser(user)
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
		if (!commentValue.trim() || !postId) return
		try {
			await sendComment(postId, currentUser?.id ?? '', currentUser?.idToken ?? '', commentValue)
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
								onClick={() => setImageIndex((prevIndex) => (prevIndex - 1 + galleryImages.length) % galleryImages.length)} 
								aria-label="Imagen anterior">
								<IoChevronBackOutline />
							</IconButton>

							{galleryImages.map((image, idx) => (
								<ButtonBase 
									key={`${image}-${idx}`} 
									onClick={() => setImageIndex(idx)} 
									className={`model-detail__thumbnail ${imageIndex === idx ? 'model-detail__thumbnail--active' : ''}`}>
									<Box component="img" src={image} alt={`Miniatura ${idx + 1}`} className="model-detail__thumbnail-img" />
								</ButtonBase>
							))}

							<IconButton 
								className="model-detail__carousel-btn model-detail__carousel-btn--next"
								onClick={() => setImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length)} 
								aria-label="Imagen siguiente">
								<IoChevronForwardOutline />
							</IconButton>
						</Box>


						<Box className="model-detail__meta-row">
							<Box className="model-detail__meta-group">
								<FaRegCircleUser className="model-detail__user-icon" />
								<Typography className="model-detail__username">{currentUser?.username ?? 'Usuario'}</Typography>
								<Button className="model-detail__follow-btn">Seguir</Button>
							</Box>

							<Box className="model-detail__likes-badge">
								<IoThumbsUpOutline />
								<Typography>12345</Typography>
							</Box>
						</Box>
					</Paper>


					<Paper elevation={0} className="model-detail__info-paper">
						<Typography className="model-detail__info-date">
							Fecha publicación:
						</Typography>
						<Typography className="model-detail__info-title">
							Titulo
						</Typography>
						<Typography className="model-detail__info-desc">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris non lorem pharetra, feugiat dolor sed, sodales dui. Fusce fermentum et nisl nec consequat. Ut a ligula viverra, euismod metus nec, dapibus elit.
						</Typography>

						<Button className="model-detail__download-btn" startIcon={<IoDownloadOutline />}>
							Descargar
						</Button>


						<Box className="model-detail__stats-bar">
							{[{ icon: IoThumbsUpOutline, label: 'Me gusta', num: '610' }, { icon: IoBookmarkOutline, label: 'Guardar', num: '1371' }, { icon: IoChatbubblesOutline, label: 'Comentarios', num: '28' }, { icon: IoShareSocialOutline, label: 'Compartir', num: undefined }].map((stat) => (
								<IconButton key={stat.label} className="model-detail__stat-btn" aria-label={stat.label}>
									<stat.icon />
									{stat.num && <Typography component="span" className="model-detail__stat-num">{stat.num}</Typography>}
								</IconButton>
							))}
						</Box>
					</Paper>
				</Box>


				<Paper elevation={0} className="model-detail__comments-paper">
					<Typography className="model-detail__comments-title">
						Comentarios ({comentarios?.length ?? 0})
					</Typography>

					<Box className="model-detail__comment-input-row">
						<InputBase
							placeholder="Escribe tu comentario..."
							value={commentValue}
							onChange={(e) => setCommentValue(e.target.value)}
							className="model-detail__comment-input"
							fullWidth
						/>
						<Button className="model-detail__send-btn" variant="contained" endIcon={<IoSendOutline />} onClick={handleSendComment}>
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
