import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Box, Button, CircularProgress, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, DialogContentText } from '@mui/material'
import { FaPen, FaRegCircleUser, FaTrashCan } from 'react-icons/fa6'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../../../components/home/Header'
import PostCard from '../../../components/home/PostCard'
import SidebarMenu from '../../../components/navigation/SidebarMenu'
import {
  findPostsByUserId,
  checkIfUserFollows,
  followUser,
  getCurrentUser,
  getProfileUserById,
  updateProfile,
  type FeedPost,
  type ProfileUser,
  unfollowUser,
  getFollowersCount,
  getFollowedCount,
  deletePost,
} from '../../../utils/peticiones'
import '../../../styles/ProfilePage.css'
import { useAlert } from '../../../contexts/AlertContext'

function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { userId: userIdParam } = useParams<{ userId?: string }>()
  const [currentUserId, setCurrentUserId] = useState('')
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [unfollowConfirmOpen, setUnfollowConfirmOpen] = useState(false)
  const [error, setError] = useState('')
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [usernameDraft, setUsernameDraft] = useState('')
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameConfirmDialogOpen, setUsernameConfirmDialogOpen] = useState(false)
  const [deletePostConfirmOpen, setDeletePostConfirmOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<FeedPost | null>(null)
  const [deletingPost, setDeletingPost] = useState(false)

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { showAlert } = useAlert()

  const isOwnProfile = useMemo(() => {
    return Boolean(currentUserId && profileUser?.id && currentUserId === profileUser.id)
  }, [currentUserId, profileUser])

  const formatMemberDate = (rawDate: string): string => {
    if (!rawDate) return t('profile.noUsername')
    const date = new Date(rawDate)
    if (Number.isNaN(date.getTime())) return rawDate
    return date.toLocaleDateString('es-ES')
  }

  // useAlert provides showAlert({ type, title?, message, onClose? })

  useEffect(() => {
    let isCancelled = false

    const loadProfile = async () => {
      setIsEditingUsername(false)
      setUsernameDraft('')
      setUsernameConfirmDialogOpen(false)
      setAvatarDialogOpen(false)
      setAvatarPreview('')
      setSelectedAvatarFile(null)
      setError('')

      setLoadingProfile(true)
      setLoadingPosts(true)

      try {
        const currentUser = await getCurrentUser()

        if (!currentUser) {
          navigate('/auth/login', { replace: true })
          return
        }

        const targetUserId = (userIdParam?.trim() || currentUser.id).trim()
        const [profile, userPosts] = await Promise.all([
          getProfileUserById(targetUserId),
          findPostsByUserId(targetUserId),
        ])

        let followsCurrentUser = Boolean(profile.isFollowedByCurrentUser)
        if (currentUser.id !== targetUserId) {
          followsCurrentUser = await checkIfUserFollows(currentUser.id, targetUserId)
        }

        if (!isCancelled) {
          setCurrentUserId(currentUser.id)
          try {
            const [followersCount, followingCount] = await Promise.all([
              getFollowersCount(targetUserId),
              getFollowedCount(targetUserId),
            ])
            profile.followersCount = followersCount
            profile.followingCount = followingCount
          } catch {}

          setProfileUser(profile)
          setPosts(userPosts)
          setIsFollowing(followsCurrentUser)
          setLoadingProfile(false)
          setLoadingPosts(false)
        }
      } catch {
        if (!isCancelled) {
          setLoadingProfile(false)
          setLoadingPosts(false)
        }
      }
    }

    void loadProfile()
    return () => { 
      isCancelled = true
    }
  }, [navigate, userIdParam])

  const handleToggleFollow = async () => {
    if (!profileUser || !currentUserId || isOwnProfile) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        setUnfollowConfirmOpen(true)
        return
      } else {
        await followUser(currentUserId, profileUser.id)
        setIsFollowing(true)
        setProfileUser((current) => {
          if (!current) return current
          return { ...current, followersCount: current.followersCount + 1 }
        })
        showAlert({ type: 'success', message: t('profile.follow.success') })
      }
    } catch {
      setError(t('profile.unfollow'))
      showAlert({ type: 'error', message: t('profile.follow.error') })
    } finally {
      setFollowLoading(false)
    }
  }

  const confirmUnfollow = async () => {
    if (!profileUser || !currentUserId) return

    setFollowLoading(true)
    setUnfollowConfirmOpen(false)
    try {
      await unfollowUser(currentUserId, profileUser.id)
      setIsFollowing(false)
      setProfileUser((current) => {
        if (!current) return current
        return { ...current, followersCount: Math.max(0, current.followersCount - 1) }
      })
      showAlert({ type: 'success', message: t('profile.unfollow.success') })
    } catch {
      setError(t('profile.unfollow'))
      showAlert({ type: 'error', message: t('profile.unfollow.error') })
    } finally {
      setFollowLoading(false)
    }
  }

  const handleConfirmUsername = async () => {
    if (!profileUser) return
    if (!usernameDraft.trim()) {
      setError(t('profile.changeUsername'))
      return
    }
    setUsernameSaving(true)
    setError('')
    try {
      await updateProfile(profileUser.id, usernameDraft, null)
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: { username: usernameDraft, avatarImg: profileUser?.avatarImg } }))
      setProfileUser((p) => p ? { ...p, username: usernameDraft } : p)
      setIsEditingUsername(false)
      setUsernameConfirmDialogOpen(false)
      showAlert({ type: 'success', message: t('profile.changeUsername.success') })
    } catch (err: any) {
      console.error(err)
      setError(err?.message || t('profile.changeUsername'))
      showAlert({ type: 'error', message: t('profile.changeUsername.error') })
    } finally {
      setUsernameSaving(false)
    }
  }

  const handleConfirmAvatar = async () => {
    if (!selectedAvatarFile) return
    setAvatarSaving(true)
    setError('')
    try {
      await updateProfile(profileUser?.id || '', profileUser?.username || '', selectedAvatarFile)
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: { username: profileUser?.username, avatarImg: avatarPreview } }))
      setProfileUser((p) => p ? { ...p, avatarImg: avatarPreview || '' } : p)
      setAvatarDialogOpen(false)
      setSelectedAvatarFile(null)
      setAvatarPreview('')
      showAlert({ type: 'success', message: t('profile.uploadNewAvatar.success') })
    } catch (err: any) {
      console.error(err)
      setError(err?.message || t('profile.uploadNewAvatar'))
      showAlert({ type: 'error', message: t('profile.uploadNewAvatar.error') })
    } finally {
      setAvatarSaving(false)
    }
  }

  const handleOpenDeletePostConfirm = (post: FeedPost) => {
    setPostToDelete(post)
    setDeletePostConfirmOpen(true)
  }

  const handleCloseDeletePostConfirm = () => {
    if (deletingPost) return
    setDeletePostConfirmOpen(false)
    setPostToDelete(null)
  }

  const handleConfirmDeletePost = async () => {
    if (!postToDelete?.id) return

    setDeletingPost(true)
    try {
      await deletePost(postToDelete.id)
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postToDelete.id))
      setDeletePostConfirmOpen(false)
      setPostToDelete(null)
      showAlert({ type: 'success', message: 'Post eliminado correctamente' })
    } catch {
      showAlert({ type: 'error', message: 'No se pudo eliminar el post' })
    } finally {
      setDeletingPost(false)
    }
  }

  

  return (
    <Box className="profile-page">
      <SidebarMenu />
      <Box className="profile-page__content">
        <Header />
        {loadingProfile ? (
          <Box className="profile-page__loader">
            <CircularProgress />
          </Box>
        ) : (
          <Box className="profile-page__layout">
            <Box className="profile-page__user-panel">
              <Box className="profile-page__avatar-wrap">
                {profileUser?.avatarImg ? (
                  <Box
                    component="img"
                    src={profileUser.avatarImg}
                    alt={profileUser.username}
                    className="profile-page__avatar-image"
                  />
                ) : (
                  <FaRegCircleUser className="profile-page__avatar-icon" />
                )}
                {isOwnProfile && (
                  <Box
                    className="profile-page__avatar-overlay"
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={() => fileInputRef.current?.click()}
                  >
                    <FaPen className="profile-page__avatar-overlay-icon" />
                  </Box>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    setSelectedAvatarFile(f)
                    const reader = new FileReader()
                    reader.onload = () => setAvatarPreview(String(reader.result || ''))
                    reader.readAsDataURL(f)
                    setAvatarDialogOpen(true)
                    e.currentTarget.value = ''
                  }}
                />
              </Box>

              <Box className="profile-page__username-row">
                {isEditingUsername ? (
                  <Box className="profile-page__username-edit-wrap">
                    <TextField
                      size="small"
                      value={usernameDraft}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setUsernameDraft(e.target.value)}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Escape') setIsEditingUsername(false)
                      }}
                      autoFocus
                      className="profile-page__username-edit-field"
                    />
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => setUsernameConfirmDialogOpen(true)}
                      className="profile-page__username-confirm-btn"
                    >
                      {t('profile.changeUsername')}
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Typography className="profile-page__username">
                      {profileUser?.username ?? t('profile.noUsername')}
                    </Typography>

                    {isOwnProfile && (
                      <IconButton
                        size="small"
                        className="profile-page__edit-username"
                        onClick={() => {
                          setUsernameDraft(profileUser?.username || '')
                          setIsEditingUsername(true)
                        }}
                      >
                        <FaPen className="profile-page__edit-icon" />
                      </IconButton>
                    )}
                  </>
                )}
              </Box>

              {!isOwnProfile && (
                <Button
                  variant="contained"
                  onClick={() => void handleToggleFollow()}
                  disabled={followLoading}
                  className="profile-page__follow-button"
                >
                  {followLoading ? t('home.loadingPosts') : isFollowing ? t('profile.unfollow') : t('profile.follow')}
                </Button>
              )}

              <Typography className="profile-page__stats">
                {profileUser?.followingCount ?? 0} {t('profile.following')} | {profileUser?.followersCount ?? 0} {t('profile.followers')}
              </Typography>

              <Typography className="profile-page__member-since">
                {t('profile.viewProfile')}: {formatMemberDate(profileUser?.createdAt ?? '')}
              </Typography>

              {error && (
                <Typography className="profile-page__error">
                  {error}
                </Typography>
              )}
            </Box>

            {/* Username confirmation dialog */}
            <Dialog open={usernameConfirmDialogOpen} onClose={() => setUsernameConfirmDialogOpen(false)} className="profile-dialog">
              <DialogTitle>{t('profile.editUsername')}?</DialogTitle>
              <DialogContent>
                <Typography>{`${t('profile.changeUsername')}: `}<strong>{usernameDraft}</strong></Typography>
              </DialogContent>
              <DialogActions>
                <Button variant="outlined" onClick={() => { setUsernameConfirmDialogOpen(false); setIsEditingUsername(false) }}>{t('profile.cancel')}</Button>
                <Button onClick={() => void handleConfirmUsername()} disabled={usernameSaving} variant="contained">
                  {usernameSaving ? <CircularProgress size={18} /> : t('profile.changeUsername')}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Avatar confirmation dialog */}
            <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} className="profile-dialog">
              <DialogTitle>{t('profile.editAvatar')}?</DialogTitle>
              <DialogContent>
                {avatarPreview ? <Box component="img" src={avatarPreview} alt="preview" style={{ maxWidth: '320px', width: '100%' }} /> : null}
              </DialogContent>
              <DialogActions>
                <Button variant="outlined" onClick={() => { setAvatarDialogOpen(false); setSelectedAvatarFile(null); setAvatarPreview('') }}>{t('profile.cancel')}</Button>
                <Button onClick={() => void handleConfirmAvatar()} disabled={avatarSaving} variant="contained">
                  {avatarSaving ? <CircularProgress size={18} /> : t('profile.uploadNewAvatar')}
                </Button>
              </DialogActions>
            </Dialog>

            <Box className="profile-page__posts-area">
              <Typography className="profile-page__posts-title">
                {isOwnProfile ? t('profile.posts') : `${t('profile.viewProfile')}`}
              </Typography>

              {loadingPosts ? (
                <Box className="profile-page__posts-loading" sx={{ minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, p: 1 }}>
                  <CircularProgress />
                  <Typography>{t('home.loadingPosts')}</Typography>
                </Box>
              ) : posts.length ? (
                <Box className="profile-page__posts-grid">
                  {posts.map((post) => (
                    <Box key={post.id} className="profile-page__post-card-wrap">
                      {isOwnProfile && (
                        <IconButton
                          size="small"
                          aria-label="Eliminar post"
                          className="profile-page__delete-post-button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleOpenDeletePostConfirm(post)
                          }}
                        >
                          <FaTrashCan />
                        </IconButton>
                      )}
                      <PostCard
                        title={post.titulo}
                        author={post.username}
                        image={post.image}
                        likes={post.likes}
                        userImage={post.user.avatarImg ? post.user.avatarImg : ''}
                        onClick={() => navigate(`/detalle-modelo/${post.id}`)}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box className="profile-page__empty-wrapper">
                  <Typography className="profile-page__empty-posts">
                    {t('home.noPosts')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Unfollow confirmation dialog */}
      <Dialog
        open={unfollowConfirmOpen}
        onClose={() => setUnfollowConfirmOpen(false)}
        aria-labelledby="unfollow-confirm-title"
        slotProps={{
          paper: {
            className: 'profile-page__dialog-paper',
          },
        }}
      >
        <DialogTitle id="unfollow-confirm-title" className="profile-page__dialog-title">{t('profile.unfollow')}</DialogTitle>
        <DialogContent className="profile-page__dialog-content">
          <DialogContentText className="profile-page__dialog-description">
            {`${t('profile.unfollow')} ${profileUser?.username ?? t('profile.noUsername')}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions className="profile-page__dialog-actions">
          <Button onClick={() => setUnfollowConfirmOpen(false)} className="profile-page__dialog-button">{t('profile.cancel')}</Button>
          <Button onClick={() => void confirmUnfollow()} variant="contained" color="error" className="profile-page__dialog-button profile-page__dialog-button--danger">{t('profile.unfollow')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deletePostConfirmOpen}
        onClose={handleCloseDeletePostConfirm}
        aria-labelledby="delete-post-confirm-title"
        slotProps={{
          paper: {
            className: 'profile-page__dialog-paper',
          },
        }}
      >
        <DialogTitle id="delete-post-confirm-title" className="profile-page__dialog-title">
          Eliminar publicacion
        </DialogTitle>
        <DialogContent className="profile-page__dialog-content">
          <DialogContentText className="profile-page__dialog-description">
            {`Estas seguro de que quieres eliminar el post "${postToDelete?.titulo ?? ''}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions className="profile-page__dialog-actions">
          <Button onClick={handleCloseDeletePostConfirm} disabled={deletingPost} className="profile-page__dialog-button">
            {t('profile.cancel')}
          </Button>
          <Button
            onClick={() => void handleConfirmDeletePost()}
            variant="contained"
            color="error"
            disabled={deletingPost}
            className="profile-page__dialog-button profile-page__dialog-button--danger"
          >
            {deletingPost ? <CircularProgress size={18} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      
    </Box>
  )
}

export default ProfilePage