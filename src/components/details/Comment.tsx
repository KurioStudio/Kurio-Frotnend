import { Box, Typography } from '@mui/material'
import { FaRegCircleUser } from 'react-icons/fa6'

interface CommentProps {
  idPost?: string
  idUser?: string
  username?: string
  contenido?: string
  idComment?: string
  createdAt?: string
}

export default function Comment({ idPost, username, contenido, idComment, createdAt }: CommentProps) {
  return (
    <Box className="post-card comment-item" role="article" data-comment-id={idComment} data-post-id={idPost}>
      <Box className="comment-item__header">
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


