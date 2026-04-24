import { Box, Typography } from '@mui/material'
import { IoThumbsUpOutline } from 'react-icons/io5'
import { FaRegCircleUser } from 'react-icons/fa6'
import '../../styles/PostCard.css'

type PostCardProps = {
	title: string
	author: string
	likes: number
}

function PostCard({ title, author, likes }: PostCardProps) {
	return (
		<Box className="post-card">
			<Box className="post-card__image" />

			<Typography className="post-card__title">
				{title}
			</Typography>

			<Box className="post-card__meta">
				<Box className="post-card__meta-group">
					<FaRegCircleUser className="post-card__icon" size={18} />
					<Typography className="post-card__meta-text">{author}</Typography>
				</Box>

				<Box className="post-card__meta-group">
					<IoThumbsUpOutline className="post-card__icon" size={16} />
					<Typography className="post-card__meta-text">{likes}</Typography>
				</Box>
			</Box>
		</Box>
	)
}

export default PostCard
