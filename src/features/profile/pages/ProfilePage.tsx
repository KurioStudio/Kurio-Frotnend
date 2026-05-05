import { useEffect, useMemo, useState } from 'react'
import { Box, Button, CircularProgress, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
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
  type FeedPost,
  type ProfileUser,
  unfollowUser,
  getFollowersCount,
  getFollowedCount,
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
  const [unfollowConfirmOpen, setUnfollowConfirmOpen] = useState(false)
  const [error, setError] = useState('')

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
      setLoadingProfile(true)
      setLoadingPosts(true)
      setError('')

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
          // ensure follower/followed counts are fresh
          try {
            const [followersCount, followingCount] = await Promise.all([
              getFollowersCount(targetUserId),
              getFollowedCount(targetUserId),
            ])

            profile.followersCount = followersCount
            profile.followingCount = followingCount
          } catch {
            // ignore and keep backend values
          }

          setProfileUser(profile)
          setPosts(userPosts)
          setIsFollowing(followsCurrentUser)
          setLoadingProfile(false)
          setLoadingPosts(false)
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError('No se pudo cargar el perfil.')
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
        // ask for confirmation instead of immediate unfollow
        setUnfollowConfirmOpen(true)
        return
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
    } catch {
      setError('No se pudo actualizar el seguimiento.')
    } finally {
      setFollowLoading(false)
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
              </Box>

              <Typography className="profile-page__username">
                {profileUser?.username ?? 'Usuario'}
              </Typography>

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
        <DialogTitle id="unfollow-confirm-title" className="profile-page__dialog-title">Dejar de seguir</DialogTitle>
        <DialogContent className="profile-page__dialog-content">
          <DialogContentText className="profile-page__dialog-description">
            ¿Estás seguro de que quieres dejar de seguir a {profileUser?.username ?? 'este usuario'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="profile-page__dialog-actions">
          <Button onClick={() => setUnfollowConfirmOpen(false)} className="profile-page__dialog-button">Cancelar</Button>
          <Button onClick={() => void confirmUnfollow()} variant="contained" color="error" className="profile-page__dialog-button profile-page__dialog-button--danger">Dejar de seguir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProfilePage