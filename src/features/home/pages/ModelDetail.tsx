import { useEffect, useRef, useState, useCallback } from 'react'
import { Box, Button, ButtonBase, IconButton, InputBase, Typography, Stack, Paper, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
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
import { useTranslation } from 'react-i18next'
import { useAlert } from '../../../contexts/AlertContext'

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
	const { t } = useTranslation()
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
	const { showAlert } = useAlert()

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

	// useAlert provides a global showAlert({ type, title?, message, onClose? })

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

				if (!postId) return

				const post = await getPostById(postId)

				if (!isCancelled) {
					let authorName = post.user.username
					let authorAvatar = post.user.avatarImg ?? ''

					try {
						const authorProfile = await getProfileUserById(post.user.id)
						authorName = authorProfile.username || authorName
						authorAvatar = authorProfile.avatarImg || authorAvatar
					} catch {}

					setPostData({ ...mapPostToState(post), authorName, authorId: post.user.id, authorAvatar })
				}

				if (user?.id && user.id !== post.user.id) {
					const follows = await checkIfUserFollows(user.id, post.user.id)
					if (!isCancelled) setIsFollowing(follows)
				}

				try {
					if (user?.id && postId) {
						const saved = await isPostSaved(postId, user.id)
						if (!isCancelled) setIsSaved(Boolean(saved))
					}
				} catch {}

				const response = await findAllComments(postId)

				const comentariosConUsuario = await Promise.all(
					response.map(async (comentario) => {
						try {
							const usuario = await getProfileUserById(comentario.idUser)
							return { ...comentario, username: usuario.username, avatarImg: usuario.avatarImg }
						} catch {
							return { ...comentario, username: comentario.idUser, avatarImg: '' }
						}
					})
				)

				if (!isCancelled) setComentarios(comentariosConUsuario)
			} catch (error) {
				console.error(error)
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

	// Refresh author profile (avatar) when it's updated
	const handleProfileUpdate = useCallback(async () => {
		if (!postData.authorId) return

		try {
			const authorProfile = await getProfileUserById(postData.authorId)
			setPostData((prev) => ({
				...prev,
				authorName: authorProfile.username || prev.authorName,
				authorAvatar: authorProfile.avatarImg || prev.authorAvatar,
			}))
		} catch (error) {
			console.error('Error refreshing author profile:', error)
		}
	}, [postData.authorId])

	useEffect(() => {
		window.addEventListener('profile-updated', handleProfileUpdate)

		return () => {
			window.removeEventListener('profile-updated', handleProfileUpdate)
		}
	}, [handleProfileUpdate])

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
			showAlert({ type: 'success', message: t('post.comment.success') })
		} catch (error) {
			console.error(error)
			showAlert({ type: 'error', message: t('post.comment.error') })
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

			let authorName = updatedPost.user.username
			let authorAvatar = updatedPost.user.avatarImg ?? ''

			try {
				const authorProfile = await getProfileUserById(updatedPost.user.id)
				authorName = authorProfile.username || authorName
				authorAvatar = authorProfile.avatarImg || authorAvatar
			} catch {}

			const isNowLiked = updatedPost.likedBy.includes(user.id)
			setPostData({ ...mapPostToState(updatedPost), authorName, authorAvatar })
			showAlert({ type: 'success', message: isNowLiked ? t('post.like.added') : t('post.like.removed') })
		} catch (error) {
			console.error(error)
			showAlert({ type: 'error', message: t('post.like.error') })
		}
	}

	const handleScrollToComments = () => {
		sendCommentButtonRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' })
		commentInputRef.current?.focus()
	}

	const handleToggleFollow = async () => {
		if (!canFollowAuthor || !currentUserId) return

		setFollowLoading(true)

		try {
			if (isFollowing) {
				setUnfollowConfirmOpen(true)
				setFollowLoading(false)
				return
			} else {
				await followUser(currentUserId, postData.authorId)
				setIsFollowing(true)
				showAlert({ type: 'success', message: t('post.follow.success') })
			}
		} catch (error) {
			console.error(error)
			showAlert({ type: 'error', message: t('post.follow.error') })
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

		const wasSaved = isSaved

		try {
			if (isSaved) {
				await unsavePost(postId, user.id)
				setIsSaved(false)
			} else {
				await savePost(postId, user.id)
				setIsSaved(true)
			}

			const updatedPost = await getPostById(postId)

			let authorName = updatedPost.user.username
			let authorAvatar = updatedPost.user.avatarImg ?? ''

			try {
				const authorProfile = await getProfileUserById(updatedPost.user.id)
				authorName = authorProfile.username || authorName
				authorAvatar = authorProfile.avatarImg || authorAvatar
			} catch {}

			setPostData({ ...mapPostToState(updatedPost), authorName, authorAvatar })
			showAlert({ type: 'success', message: wasSaved ? t('post.unsave.success') : t('post.save.success') })
		} catch (error) {
			console.error(error)
			showAlert({ type: 'error', message: t('post.save.error') })
		}
	}

	const confirmUnfollow = async () => {
		if (!currentUserId || !postData.authorId) return

		setFollowLoading(true)
		setUnfollowConfirmOpen(false)

		try {
			await unfollowUser(currentUserId, postData.authorId)
			setIsFollowing(false)
			showAlert({ type: 'success', message: t('post.unfollow.success') })
		} catch (error) {
			console.error(error)
			showAlert({ type: 'error', message: t('post.unfollow.error') })
		} finally {
			setFollowLoading(false)
		}
	}

	const handleDownload = async () => {
		if (!postData.oid) return

		try {
			await descargarFichero(postData.oid)
		} catch (error) {
			console.error(error)
		}
	}

	const handleToggleModel = async () => {
		if (!showing3D && !stlBlob && postData.oid) {
			setLoadingSTL(true)
			try {
				const blob = await getModelSTL(postData.oid)
				setStlBlob(blob)
			} catch (error) {
				console.error(error)
			} finally {
				setLoadingSTL(false)
			}
		}

		setShowing3D((c) => !c)
	}

	const handleSharePost = async () => {
		try {
			const input = document.createElement('input')
			input.value = window.location.href
			document.body.appendChild(input)
			input.select()
			document.execCommand('copy')
			input.remove()
			showAlert({ type: 'success', message: t('post.share.success') })
		} catch {
			showAlert({ type: 'error', message: t('post.share.error') })
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
										<Box component="img" src={currentImage} alt={postData.titulo || t('post.image.alt')} className="model-detail__image" />
									)}

									<Button
										className="model-detail__preview-btn"
										startIcon={<IoCubeOutline />}
										onClick={() => void handleToggleModel()}
										variant={showing3D ? 'contained' : 'outlined'}
										disabled={loadingSTL}
									>
										{showing3D ? t('post.viewimages') : t('post.view3d')}
									</Button>
								</Box>

								{!showing3D && (
									<Box className="model-detail__thumbnails" role="list" aria-label="Model thumbnails">
										<IconButton
											className="model-detail__carousel-btn model-detail__carousel-btn--prev"
											onClick={() => setPostData((c) => ({ ...c, imageIndex: (c.imageIndex - 1 + currentImages.length) % currentImages.length }))}
											aria-label={t('post.thumbnails.previous')}
											disabled={currentImages.length === 0}
										>
											<IoChevronBackOutline />
										</IconButton>

										{currentImages.map((image, idx) => (
											<ButtonBase
												key={`${image}-${idx}`}
												onClick={() => setPostData((c) => ({ ...c, imageIndex: idx }))}
												className={`model-detail__thumbnail ${postData.imageIndex === idx ? 'model-detail__thumbnail--active' : ''}`}
											>
												<Box component="img" src={image} alt={`Thumbnail ${idx + 1}`} className="model-detail__thumbnail-img" />
											</ButtonBase>
										))}

										<IconButton
											className="model-detail__carousel-btn model-detail__carousel-btn--next"
											onClick={() => setPostData((c) => ({ ...c, imageIndex: (c.imageIndex + 1) % currentImages.length }))}
											aria-label={t('post.thumbnails.next')}
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
											aria-label={t('post.user.profile', { username: postData.authorName })}
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
												{followLoading ? t('post.follow.processing') : isFollowing ? t('post.following') : t('post.follow')}
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
									{t('post.date.label')} {postData.createdAt ? new Date(postData.createdAt).toLocaleDateString() : t('post.date.unknown')}
								</Typography>

								<Typography className="model-detail__info-title">{postData.titulo}</Typography>

								<Typography className="model-detail__info-desc">{postData.descripcion}</Typography>

								<Button className="model-detail__download-btn" startIcon={<IoDownloadOutline />} onClick={() => void handleDownload()}>
									{t('post.download')}
								</Button>

								<Box className="model-detail__stats-bar">
									{[
										{ icon: IoThumbsUpOutline, label: 'Like', num: String(postData.likes) },
										{ icon: isSaved ? IoBookmark : IoBookmarkOutline, label: 'Save', num: undefined },
										{ icon: IoChatbubblesOutline, label: 'Comments', num: String(commentCount) },
										{ icon: IoShareSocialOutline, label: 'Share', num: undefined },
									].map((stat) => (
										<IconButton
											key={stat.label}
											className={`model-detail__stat-btn ${stat.label === 'Like' && isLikedByCurrentUser ? 'model-detail__stat-btn--liked' : ''} ${stat.label === 'Save' && isSaved ? 'model-detail__stat-btn--saved' : ''}`}
											aria-label={stat.label}
											onClick={
												stat.label === 'Like'
													? handleLikePost
													: stat.label === 'Comments'
													? handleScrollToComments
													: stat.label === 'Save'
													? handleToggleSave
													: stat.label === 'Share'
													? handleSharePost
													: undefined
											}
										>
											<stat.icon />
											{stat.num && <Typography component="span">{stat.num}</Typography>}
										</IconButton>
									))}
								</Box>
							</Paper>
						</Box>

						<Paper elevation={0} className="model-detail__comments-paper">
							<Typography className="model-detail__comments-title">
								{t('post.comments.title')} ({commentCount})
							</Typography>

							<Box className="model-detail__comment-input-row">
								<InputBase
									placeholder={t('post.comment.placeholder')}
									value={commentValue}
									onChange={(e) => setCommentValue(e.target.value)}
									className="model-detail__comment-input"
									fullWidth
									inputRef={commentInputRef}
								/>

								<Button className="model-detail__send-btn" variant="contained" endIcon={<IoSendOutline />} onClick={handleSendComment} ref={sendCommentButtonRef}>
									{t('post.comment.send')}
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

						<Dialog
							open={unfollowConfirmOpen}
							onClose={() => setUnfollowConfirmOpen(false)}
							aria-labelledby="unfollow-confirm-title"
							slotProps={{
								paper: {
									className: 'model-detail__dialog-paper',
								}
							}}
						>
							<DialogTitle id="unfollow-confirm-title">{t('post.unfollow.title')}</DialogTitle>

							<DialogContent>
								<DialogContentText className="model-detail__dialog-description">
									{t('post.unfollow.message')} {postData.authorName} {'?'}
								</DialogContentText>
							</DialogContent>

							<DialogActions>
								<Button onClick={() => setUnfollowConfirmOpen(false)}>{t('post.unfollow.cancel')}</Button>
								<Button onClick={() => void confirmUnfollow()} variant="contained" color="error">
									{t('post.unfollow.confirm')}
								</Button>
							</DialogActions>
						</Dialog>


					</Stack>
				)}
			</Box>
		</Box>
	)
}

export default ModelDetail