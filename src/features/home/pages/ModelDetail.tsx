import { useEffect, useRef, useState } from 'react'
import { Box, Button, ButtonBase, IconButton, InputBase, Typography, Stack, Paper, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from '@mui/material'
import {
	IoChevronBackOutline,
	IoChevronForwardOutline,
	IoCubeOutline,
	IoDownloadOutline,
	IoSendOutline,
	IoThumbsUpOutline,
	IoChatbubblesOutline,
	IoShareSocialOutline,
	IoBookmark,
	IoBookmarkOutline,
} from 'react-icons/io5'
import { IoClose } from 'react-icons/io5'
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
	getProfileUserById,
	likePost,
	savePost,
	unsavePost,
	isPostSaved,
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
	avatarImg: string
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
	authorAvatar?: string
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
	const [isSaved, setIsSaved] = useState(false)
	const [followLoading, setFollowLoading] = useState(false)
	const [unfollowConfirmOpen, setUnfollowConfirmOpen] = useState(false)
	const [showing3D, setShowing3D] = useState(false)
	const [shareFeedbackOpen, setShareFeedbackOpen] = useState(false)
	const [shareFeedbackType, setShareFeedbackType] = useState<'success' | 'error'>('success')
	const [shareFeedbackMessage, setShareFeedbackMessage] = useState('')
	const shareFeedbackTimerRef = useRef<number | null>(null)
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

	const openShareFeedback = (type: 'success' | 'error', message: string) => {
		if (shareFeedbackTimerRef.current) {
			window.clearTimeout(shareFeedbackTimerRef.current)
		}

		setShareFeedbackType(type)
		setShareFeedbackMessage(message)
		setShareFeedbackOpen(true)

		shareFeedbackTimerRef.current = window.setTimeout(() => {
			setShareFeedbackOpen(false)
		}, 10000)
	}

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
					// prefer authoritative author data by querying profile via id
					let authorName = post.user.username
					let authorAvatar = post.user.avatarImg ?? ''
					try {
						const authorProfile = await getProfileUserById(post.user.id)
						authorName = authorProfile.username || authorName
						authorAvatar = authorProfile.avatarImg || authorAvatar
					} catch {
						// ignore, fallback to post.user
					}

					setPostData({ ...mapPostToState(post), authorName, authorId: post.user.id, authorAvatar })
				}

				if (user?.id && user.id !== post.user.id) {
					const follows = await checkIfUserFollows(user.id, post.user.id)
					if (!isCancelled) {
						setIsFollowing(follows)
					}
				}

				// check saved state for current user using isPostSaved endpoint
				try {
					if (user?.id && postId) {
						const saved = await isPostSaved(postId, user.id)
						if (!isCancelled) {
							setIsSaved(Boolean(saved))
						}
					}
				} catch {
					// ignore errors determining saved state
				}

				const response = await findAllComments(postId)
				const comentariosConUsuario = await Promise.all(
					response.map(async (comentario) => {
						try {
							const usuario = await getProfileUserById(comentario.idUser)
							return {
								...comentario,
								username: usuario.username,
								avatarImg: usuario.avatarImg,
							}
						} catch {
							return {
								...comentario,
								username: comentario.idUser,
								avatarImg: '',
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
			if (shareFeedbackTimerRef.current) {
				window.clearTimeout(shareFeedbackTimerRef.current)
			}
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
						const usuario = await getProfileUserById(comentario.idUser)
						return { ...comentario, username: usuario.username, avatarImg: usuario.avatarImg }
					} catch {
						return { ...comentario, username: comentario.idUser, avatarImg: '' }
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
			
			// Preserve author avatar and name by querying profile
			let authorName = updatedPost.user.username
			let authorAvatar = updatedPost.user.avatarImg ?? ''
			try {
				const authorProfile = await getProfileUserById(updatedPost.user.id)
				authorName = authorProfile.username || authorName
				authorAvatar = authorProfile.avatarImg || authorAvatar
			} catch {
				// ignore, fallback to post.user
			}
			
			setPostData({ ...mapPostToState(updatedPost), authorName, authorAvatar })
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
				// ask for confirmation before unfollowing
				setUnfollowConfirmOpen(true)
				setFollowLoading(false)
				return
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

	const handleToggleSave = async () => {
		if (!postId) return

		const user = await getCurrentUser()

		if (!user) {
			localStorage.setItem('kurio_post_login_redirect', window.location.pathname)
			navigate('/auth/login', { replace: true })
			return
		}

		try {
			if (isSaved) {
				await unsavePost(postId, user.id)
				setIsSaved(false)
			} else {
				await savePost(postId, user.id)
				setIsSaved(true)
			}
			
			// Reload post data to ensure author info is preserved
			const updatedPost = await getPostById(postId)
			
			// Preserve author avatar and name by querying profile
			let authorName = updatedPost.user.username
			let authorAvatar = updatedPost.user.avatarImg ?? ''
			try {
				const authorProfile = await getProfileUserById(updatedPost.user.id)
				authorName = authorProfile.username || authorName
				authorAvatar = authorProfile.avatarImg || authorAvatar
			} catch {
				// ignore, fallback to post.user
			}
			
			setPostData({ ...mapPostToState(updatedPost), authorName, authorAvatar })
		} catch (error) {
			console.error('Error al actualizar guardado:', error)
		}
	}

	const confirmUnfollow = async () => {
		if (!currentUserId || !postData.authorId) return

		setFollowLoading(true)
		setUnfollowConfirmOpen(false)

		try {
			await unfollowUser(currentUserId, postData.authorId)
			setIsFollowing(false)
		} catch (error) {
			console.error('Error al dejar de seguir:', error)
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

	const handleSharePost = async () => {
		if (!postId) {
			openShareFeedback('error', 'No se pudo copiar el enlace del post.')
			return
		}

		try {
			await navigator.clipboard.writeText(window.location.href)
			openShareFeedback('success', 'Enlace copiado al portapapeles.')
		} catch (error) {
			console.error('Error al copiar el enlace del post:', error)
			openShareFeedback('error', 'No se pudo copiar el enlace del post.')
		}
	}

	return (
		<Box className="model-detail">
			<SidebarMenu />
			<Box className="model-detail__content">
				<Header />

				{loadingPost ? (
					<Box className="model-detail__loader">
						<CircularProgress size={72} thickness={5} />
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
											{postData.authorAvatar ? (
												<Box component="img" src={postData.authorAvatar} alt={postData.authorName} className="model-detail__user-avatar" />
											) : (
												<FaRegCircleUser className="model-detail__user-icon" />
											)}
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
										{ icon: isSaved ? IoBookmark : IoBookmarkOutline, label: 'Guardar', num: undefined },
										{ icon: IoChatbubblesOutline, label: 'Comentarios', num: String(commentCount) },
										{ icon: IoShareSocialOutline, label: 'Compartir', num: undefined },
									].map((stat) => (
										<IconButton
											key={stat.label}
											className={`model-detail__stat-btn ${stat.label === 'Me gusta' && isLikedByCurrentUser ? 'model-detail__stat-btn--liked' : ''} ${stat.label === 'Guardar' && isSaved ? 'model-detail__stat-btn--saved' : ''}`}
											aria-label={stat.label}
											onClick={stat.label === 'Me gusta' ? handleLikePost : stat.label === 'Comentarios' ? handleScrollToComments : stat.label === 'Guardar' ? handleToggleSave : stat.label === 'Compartir' ? handleSharePost : undefined}
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
									<CircularProgress size={56} thickness={5} />
								</Box>
							) : (
								<Box className="model-detail__comments-list">
									{comentarios.map((cmt, idx) => (
										<Comment
											key={`${cmt.idPost}-${cmt.idUser}-${idx}`}
											idPost={cmt.idPost}
											idUser={cmt.idUser}
											username={cmt.username}
											avatarImg={cmt.avatarImg}
											contenido={cmt.contenido}
											createdAt={cmt.createdAt}
											idComment={`${cmt.idPost}-${idx}`}
										/>
									))}
								</Box>
							)}
						</Paper>

							{/* Unfollow confirmation dialog */}
							<Dialog
								open={unfollowConfirmOpen}
								onClose={() => setUnfollowConfirmOpen(false)}
								aria-labelledby="unfollow-confirm-title"
								slotProps={{
									paper: {
										className: 'model-detail__dialog-paper',
									},
								}}
							>
								<DialogTitle id="unfollow-confirm-title" className="model-detail__dialog-title">Dejar de seguir</DialogTitle>
								<DialogContent className="model-detail__dialog-content">
									<DialogContentText className="model-detail__dialog-description">
										¿Estás seguro de que quieres dejar de seguir a {postData.authorName}?
									</DialogContentText>
								</DialogContent>
								<DialogActions className="model-detail__dialog-actions">
									<Button onClick={() => setUnfollowConfirmOpen(false)} className="model-detail__dialog-button">Cancelar</Button>
									<Button onClick={() => void confirmUnfollow()} variant="contained" color="error" className="model-detail__dialog-button model-detail__dialog-button--danger">Dejar de seguir</Button>
								</DialogActions>
							</Dialog>

							<Snackbar
								open={shareFeedbackOpen}
								anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
								onClose={(_, reason) => {
									if (reason === 'clickaway') {
										return
									}
									setShareFeedbackOpen(false)
								}}
							>
								<Alert
									icon={false}
									severity={shareFeedbackType === 'success' ? 'success' : 'error'}
									variant="filled"
									className={`model-detail__feedback-toast model-detail__feedback-toast--${shareFeedbackType}`}
									action={
										<IconButton
											size="small"
											className="model-detail__feedback-close"
											aria-label="Cerrar mensaje"
											onClick={() => setShareFeedbackOpen(false)}
										>
											<IoClose />
										</IconButton>
									}
								>
									<Typography className="model-detail__feedback-title">
										{shareFeedbackType === 'success' ? 'Enlace copiado' : 'Error al compartir'}
									</Typography>
									<Typography className="model-detail__feedback-text">{shareFeedbackMessage}</Typography>
								</Alert>
							</Snackbar>
					</Stack>
				)}
			</Box>
		</Box>
	)
}

export default ModelDetail
