import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import { FaPen } from 'react-icons/fa6'
import { FaRegCircleUser } from 'react-icons/fa6'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../../components/home/Header'
import PostCard from '../../../components/home/PostCard'
import SidebarMenu from '../../../components/navigation/SidebarMenu'
import {
  findPostsByUserId,
  checkIfUserFollows,
  followUser,
  getCurrentUser,
  getProfileUserById,
  updateUsername,
  type FeedPost,
  type ProfileUser,
  unfollowUser,
} from '../../../utils/peticiones'
import '../../../styles/ProfilePage.css'

function ProfilePage() {
  const navigate = useNavigate()
  const { userId: userIdParam } = useParams<{ userId?: string }>()
  const [currentUserId, setCurrentUserId] = useState('')
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [usernameDraft, setUsernameDraft] = useState('')
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameConfirmDialogOpen, setUsernameConfirmDialogOpen] = useState(false)

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const isOwnProfile = useMemo(() => {
    return Boolean(currentUserId && profileUser?.id && currentUserId === profileUser.id)
  }, [currentUserId, profileUser])

  const formatMemberDate = (rawDate: string): string => {
    if (!rawDate) {
      return 'No disponible'
    }

    const date = new Date(rawDate)

    if (Number.isNaN(date.getTime())) {
      return rawDate
    }

    return date.toLocaleDateString('es-ES')
  }

  useEffect(() => {
    let isCancelled = false

    const loadProfile = async () => {
      // Reset edit states when changing profiles
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
          setProfileUser(profile)
          setPosts(userPosts)
          setIsFollowing(followsCurrentUser)
          setLoadingProfile(false)
          setLoadingPosts(false)
        }
      } catch (loadError) {
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
    if (!profileUser || !currentUserId || isOwnProfile) {
      return
    }

    setFollowLoading(true)

    try {
      if (isFollowing) {
        await unfollowUser(currentUserId, profileUser.id)
        setIsFollowing(false)
        setProfileUser((current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            followersCount: Math.max(0, current.followersCount - 1),
          }
        })
      } else {
        await followUser(currentUserId, profileUser.id)
        setIsFollowing(true)
        setProfileUser((current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            followersCount: current.followersCount + 1,
          }
        })
      }
    } catch {
      setError('No se pudo actualizar el seguimiento.')
    } finally {
      setFollowLoading(false)
    }
  }

  const handleConfirmUsername = async () => {
    if (!profileUser) return
    if (!usernameDraft.trim()) {
      setError('El nombre de usuario no puede estar vacío')
      return
    }
    setUsernameSaving(true)
    setError('')

    try {
      await updateUsername(usernameDraft, null)
      setProfileUser((p) => p ? { ...p, username: usernameDraft } : p)
      setIsEditingUsername(false)
      setUsernameConfirmDialogOpen(false)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'No se pudo cambiar el nombre')
    } finally {
      setUsernameSaving(false)
    }
  }

  const handleConfirmAvatar = async () => {
    if (!selectedAvatarFile) return
    setAvatarSaving(true)
    setError('')

    try {
      await updateUsername(profileUser?.username || '', selectedAvatarFile)
      setProfileUser((p) => p ? { ...p, avatarImg: avatarPreview || '' } : p)
      setAvatarDialogOpen(false)
      setSelectedAvatarFile(null)
      setAvatarPreview('')
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'No se pudo actualizar la foto')
    } finally {
      setAvatarSaving(false)
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
                    // clear input value to allow re-select same file later
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
                      onChange={(e) => setUsernameDraft(e.target.value)}
                      onKeyDown={(e) => {
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
                      Confirmar
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Typography className="profile-page__username">
                      {profileUser?.username ?? 'Usuario'}
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
                  {followLoading ? 'Procesando...' : isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
              )}

              <Typography className="profile-page__stats">
                {profileUser?.followingCount ?? 0} seguidos | {profileUser?.followersCount ?? 0} seguidores
              </Typography>

              <Typography className="profile-page__member-since">
                Miembro desde: {formatMemberDate(profileUser?.createdAt ?? '')}
              </Typography>

              {error && (
                <Typography className="profile-page__error">
                  {error}
                </Typography>
              )}
            </Box>

            {/* Username confirmation dialog */}
            <Dialog open={usernameConfirmDialogOpen} onClose={() => setUsernameConfirmDialogOpen(false)} className="profile-dialog">
              <DialogTitle>¿Cambiar nombre de usuario?</DialogTitle>
              <DialogContent>
                <Typography>Nuevo nombre: <strong>{usernameDraft}</strong></Typography>
              </DialogContent>
              <DialogActions>
                <Button variant="outlined" onClick={() => { setUsernameConfirmDialogOpen(false); setIsEditingUsername(false) }}>Cancelar</Button>
                <Button onClick={() => void handleConfirmUsername()} disabled={usernameSaving} variant="contained">
                  {usernameSaving ? <CircularProgress size={18} /> : 'Confirmar'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Avatar confirm dialog */}
            <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} className="profile-dialog">
              <DialogTitle>¿Cambiar foto de perfil?</DialogTitle>
              <DialogContent>
                {avatarPreview ? <Box component="img" src={avatarPreview} alt="preview" style={{ maxWidth: '320px', width: '100%' }} /> : null}
              </DialogContent>
              <DialogActions>
                <Button variant="outlined" onClick={() => { setAvatarDialogOpen(false); setSelectedAvatarFile(null); setAvatarPreview('') }}>Cancelar</Button>
                <Button onClick={() => void handleConfirmAvatar()} disabled={avatarSaving} variant="contained">
                  {avatarSaving ? <CircularProgress size={18} /> : 'Confirmar'}
                </Button>
              </DialogActions>
            </Dialog>

            <Box className="profile-page__posts-area">
              <Typography className="profile-page__posts-title">
                {isOwnProfile ? 'Tus creaciones' : `Creaciones de ${profileUser?.username ?? 'Usuario'}`}
              </Typography>

              {loadingPosts ? (
                <Box className="profile-page__loader profile-page__loader--posts">
                  <CircularProgress />
                </Box>
              ) : (
                <Box className="profile-page__posts-grid">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      title={post.titulo}
                      author={post.username}
                      image={post.image}
                      likes={post.likes}
                      userImage={post.user.avatarImg ? post.user.avatarImg : ''}
                      onClick={() => navigate(`/detalle-modelo/${post.id}`)}
                    />
                  ))}

                  {!posts.length && (
                    <Typography className="profile-page__empty-posts">
                      Este usuario todavía no tiene publicaciones.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ProfilePage