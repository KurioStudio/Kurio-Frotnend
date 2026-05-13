import { Box, IconButton, Typography } from '@mui/material'
import { FaRegCircleUser, FaTrashCan } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'

interface CommentProps {
  idPost?: string
  idUser?: string
  username?: string
  avatarImg?: string
  contenido?: string
  idComment?: string
  createdAt?: string
  canDelete?: boolean
  onDelete?: () => void
}

export default function Comment({ idPost, idUser, username, avatarImg, contenido, idComment, createdAt, canDelete = false, onDelete }: CommentProps) {
  const navigate = useNavigate()
  
  const handleUserClick = () => {
    if (idUser) {
      navigate(`/profile/${idUser}`)
    }
  }
  
  return (
    <Box className="post-card comment-item" role="article" data-comment-id={idComment} data-post-id={idPost}>
      <Box className="comment-item__top-row">
        <Box
          className="comment-item__header comment-item__header--clickable"
          onClick={handleUserClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleUserClick()
            }
          }}
          aria-label={`Ver perfil de ${username}`}
        >
          {avatarImg ? (
            <Box component="img" src={avatarImg} alt={username ?? 'Usuario'} className="comment-item__avatar" loading="lazy" />
          ) : (
            <Box className="comment-item__avatar comment-item__avatar--fallback">
              <FaRegCircleUser className="post-card__icon" size={16} />
            </Box>
          )}
          <Typography className="comment-item__username">{username ?? 'Usuario'}</Typography>
        </Box>

        {canDelete && (
          <IconButton
            size="small"
            aria-label="Eliminar comentario"
            className="comment-item__delete-btn"
            onClick={(event) => {
              event.stopPropagation()
              onDelete?.()
            }}
          >
            <FaTrashCan size={13} />
          </IconButton>
        )}
      </Box>


      <Typography className="comment-item__main">{contenido}</Typography>

      {createdAt && (
        <Typography className="comment-item__date" variant="caption">
          {createdAt}
        </Typography>
      )}
    </Box>
  )
}


