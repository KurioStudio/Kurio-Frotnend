import { Box, Typography } from '@mui/material'
import { FaRegCircleUser } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'

interface CommentProps {
  idPost?: string
  idUser?: string
  username?: string
  contenido?: string
  idComment?: string
  createdAt?: string
}

export default function Comment({ idPost, idUser, username, contenido, idComment, createdAt }: CommentProps) {
  const navigate = useNavigate()
  
  const handleUserClick = () => {
    if (idUser) {
      navigate(`/profile/${idUser}`)
    }
  }
  
  return (
    <Box className="post-card comment-item" role="article" data-comment-id={idComment} data-post-id={idPost}>
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
        <FaRegCircleUser className="post-card__icon" size={16} />
        <Typography className="comment-item__username">{username ?? 'Usuario'}</Typography>
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


