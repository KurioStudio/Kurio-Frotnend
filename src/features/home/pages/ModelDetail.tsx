import { useEffect, useRef, useState } from 'react'
import { Box, Button, ButtonBase, IconButton, InputBase, Typography, Stack, Paper, CircularProgress } from '@mui/material'
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
import Model3DViewer from '../../../components/details/Model3DViewer'
import SidebarMenu from '../../../components/navigation/SidebarMenu'
import {
	checkIfUserFollows,
	descargarFichero,
	findAllComments,
	followUser,
	getCurrentUser,
	getModelSTL,
	getPostById,
	getUserById,
	likePost,
	sendComment,
	type comentarios,
	type PostDetail,
	unfollowUser,
} from '../../../utils/peticiones'
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
	likedBy: string[]
	comentarios: number
	createdAt: string
	authorName: string
	authorId: string
	oid: string
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
		likedBy: [],
		comentarios: 0,
		createdAt: '',
		authorName: '',
		authorId: '',
		oid: '',
	})
	const [commentValue, setCommentValue] = useState('')
	const [comentarios, setComentarios] = useState<CommentView[]>([])
	const [currentUserId, setCurrentUserId] = useState<string | null>(null)
	const [loadingPost, setLoadingPost] = useState(true)
	const [loadingComments, setLoadingComments] = useState(false)
	const [stlBlob, setStlBlob] = useState<Blob | undefined>()
	const [loadingSTL, setLoadingSTL] = useState(false)
	const [isFollowing, setIsFollowing] = useState(false)
	const [followLoading, setFollowLoading] = useState(false)
	const [showing3D, setShowing3D] = useState(false)
	const currentImages = postData.imagenes.length > 0 ? postData.imagenes : []
	const currentImage = currentImages.length > 0 ? currentImages[postData.imageIndex % currentImages.length] : ''
	const commentCount = comentarios.length
	const isLikedByCurrentUser = Boolean(currentUserId && postData.likedBy.includes(currentUserId))
	const canFollowAuthor = Boolean(currentUserId && postData.authorId && currentUserId !== postData.authorId)

	const mapPostToState = (post: PostDetail): ModelPostState => ({
		imageIndex: 0,
		titulo: post.titulo,
		descripcion: post.descripcion,
		imagenes: post.imagenes.length > 0 ? post.imagenes : [],
		likes: post.likedBy.length,
		likedBy: post.likedBy,
		comentarios: post.cantComentarios,
		createdAt: post.createdAt,
		authorName: post.user.username,
		authorId: post.user.id,
		oid: post.oid,
	})

  useEffect(() => {
		let isCancelled = false

		const loadPost = async () => {
			setLoadingPost(true)
			setLoadingComments(true)
			setComentarios([])
			setShowing3D(false)
			setStlBlob(undefined)
			setIsFollowing(false)

			try {
				const user = await getCurrentUser()
				if (!isCancelled) {
					setCurrentUserId(user?.id ?? null)
				}

				if (!postId) {
					return
				}

				const post = await getPostById(postId)
				if (!isCancelled) {
					setPostData(mapPostToState(post))
				}

				if (user?.id && user.id !== post.user.id) {
					const follows = await checkIfUserFollows(user.id, post.user.id)
					if (!isCancelled) {
						setIsFollowing(follows)
					}
				}

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
				console.error('Error al cargar el post:', error)
			} finally {
				if (!isCancelled) {
					setLoadingPost(false)
					setLoadingComments(false)
				}
			}
		}

		void loadPost()

		return () => {
			isCancelled = true
		}
  }, [postId])

	const handleSendComment = async () => {
		if (!postId) return

		const user = await getCurrentUser()

		if (!user) {
			localStorage.setItem('kurio_post_login_redirect', window.location.pathname)
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

	const handleLikePost = async () => {
		if (!postId) return

		const user = await getCurrentUser()

		if (!user) {
			localStorage.setItem('kurio_post_login_redirect', window.location.pathname)
			navigate('/auth/login', { replace: true })
			return
		}

		try {
			await likePost(postId)
			const updatedPost = await getPostById(postId)
			setCurrentUserId(user.id)
			setPostData(mapPostToState(updatedPost))
		} catch (error) {
			console.error('Error al dar like al post:', error)
		}
	}

	const handleScrollToComments = () => {
		sendCommentButtonRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' })
		commentInputRef.current?.focus()
	}

	const handleToggleFollow = async () => {
		if (!canFollowAuthor || !currentUserId) {
			return
		}

		setFollowLoading(true)

		try {
			if (isFollowing) {
				await unfollowUser(currentUserId, postData.authorId)
				setIsFollowing(false)
			} else {
				await followUser(currentUserId, postData.authorId)
				setIsFollowing(true)
			}
		} catch (error) {
			console.error('Error al actualizar el seguimiento:', error)
		} finally {
			setFollowLoading(false)
		}
	}

	const handleDownload = async () => {
		if (!postData.oid) {
			return
		}

		try {
			await descargarFichero(postData.oid)
		} catch (error) {
			console.error('Error descargando archivo:', error)
		}
	}

	const handleToggleModel = async () => {
		if (!showing3D && !stlBlob && postData.oid) {
			setLoadingSTL(true)
			try {
				const blob = await getModelSTL(postData.oid)
				setStlBlob(blob)
			} catch (error) {
				console.error('Error loading STL:', error)
			} finally {
				setLoadingSTL(false)
			}
		}

		setShowing3D((current) => !current)
	}

	return (
		<Box className="model-detail">
			<SidebarMenu />
			<Box className="model-detail__content">
				<Header />

				{loadingPost ? (
					<Box className="model-detail__loader">
						<CircularProgress />
					</Box>
				) : (
					<Stack spacing={2} className="model-detail__container">
						<Box className="model-detail__grid">
							<Paper elevation={0} className="model-detail__gallery-paper">
								<Box className="model-detail__image-container model-detail__3d-container">
									{showing3D ? (
										<Model3DViewer modelBlob={stlBlob} loading={loadingSTL} />
									) : (
										<Box component="img" src={currentImage} alt={postData.titulo || 'Modelo 3D'} className="model-detail__image" />
									)}

									<Button
										className="model-detail__preview-btn"
										startIcon={<IoCubeOutline />}
										onClick={() => void handleToggleModel()}
										variant={showing3D ? 'contained' : 'outlined'}
										disabled={loadingSTL}
									>
										{showing3D ? 'Ver imágenes' : 'Vista previa en 3D'}
									</Button>
								</Box>

								{!showing3D && (
									<Box className="model-detail__thumbnails" role="list" aria-label="Miniaturas del modelo">
										<IconButton
											className="model-detail__carousel-btn model-detail__carousel-btn--prev"
											onClick={() => setPostData((current) => ({ ...current, imageIndex: (current.imageIndex - 1 + currentImages.length) % currentImages.length }))}
											aria-label="Imagen anterior"
											disabled={currentImages.length === 0}
										>
											<IoChevronBackOutline />
										</IconButton>

										{currentImages.map((image, idx) => (
											<ButtonBase
												key={`${image}-${idx}`}
												onClick={() => setPostData((current) => ({ ...current, imageIndex: idx }))}
												className={`model-detail__thumbnail ${postData.imageIndex === idx ? 'model-detail__thumbnail--active' : ''}`}
											>
												<Box component="img" src={image} alt={`Miniatura ${idx + 1}`} className="model-detail__thumbnail-img" />
											</ButtonBase>
										))}

										<IconButton
											className="model-detail__carousel-btn model-detail__carousel-btn--next"
											onClick={() => setPostData((current) => ({ ...current, imageIndex: (current.imageIndex + 1) % currentImages.length }))}
											aria-label="Imagen siguiente"
											disabled={currentImages.length === 0}
										>
											<IoChevronForwardOutline />
										</IconButton>
									</Box>
								)}

								<Box className="model-detail__meta-row">
									<Box className="model-detail__meta-group">
										<Box
											component="button"
											onClick={() => navigate(`/profile/${postData.authorId}`)}
											className="model-detail__user-profile-btn"
											aria-label={`Ver perfil de ${postData.authorName}`}
										>
											<FaRegCircleUser className="model-detail__user-icon" />
											<Typography className="model-detail__username">{postData.authorName}</Typography>
										</Box>
										{canFollowAuthor && (
											<Button
												className="model-detail__follow-btn"
												onClick={() => void handleToggleFollow()}
												disabled={followLoading}
											>
												{followLoading ? 'Procesando...' : isFollowing ? 'Siguiendo' : 'Seguir'}
											</Button>
										)}
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

								<Button className="model-detail__download-btn" startIcon={<IoDownloadOutline />} onClick={() => void handleDownload()}>
									Descargar
								</Button>

								<Box className="model-detail__stats-bar">
									{[
										{ icon: IoThumbsUpOutline, label: 'Me gusta', num: String(postData.likes) },
										{ icon: IoBookmarkOutline, label: 'Guardar', num: undefined },
										{ icon: IoChatbubblesOutline, label: 'Comentarios', num: String(commentCount) },
										{ icon: IoShareSocialOutline, label: 'Compartir', num: undefined },
									].map((stat) => (
										<IconButton
											key={stat.label}
											className={`model-detail__stat-btn ${stat.label === 'Me gusta' && isLikedByCurrentUser ? 'model-detail__stat-btn--liked' : ''}`}
											aria-label={stat.label}
											onClick={stat.label === 'Me gusta' ? handleLikePost : stat.label === 'Comentarios' ? handleScrollToComments : undefined}
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
							{loadingComments ? (
								<Box className="model-detail__comments-loader">
									<CircularProgress />
								</Box>
							) : (
								<Box className="model-detail__comments-list">
									{comentarios.map((cmt, idx) => (
										<Comment
											key={`${cmt.idPost}-${cmt.idUser}-${idx}`}
											idPost={cmt.idPost}
											idUser={cmt.idUser}
											username={cmt.username}
											contenido={cmt.contenido}
											createdAt={cmt.createdAt}
											idComment={`${cmt.idPost}-${idx}`}
										/>
									))}
								</Box>
							)}
						</Paper>
					</Stack>
				)}
			</Box>
		</Box>
	)
}

export default ModelDetail
