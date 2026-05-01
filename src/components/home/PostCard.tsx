import { Box, CircularProgress, Tooltip, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { IoThumbsUpOutline } from 'react-icons/io5'
import { FaRegCircleUser } from 'react-icons/fa6'
import '../../styles/PostCard.css'

type PostCardProps = {
	title: string
	author: string
	likes: number
	image: string
	userImage: string
	onClick?: () => void
}

const formatLikes = (likes: number): string => {
	if (likes < 1000) {
		return `${likes}`
	}

	if (likes < 1000000) {
		return `${Math.round(likes / 1000)}k`
	}

	if (likes < 1000000000) {
		return `${Math.round(likes / 1000000)}M`
	}

	return `${Math.round(likes / 1000000000)}B`
}

function PostCard({ title, author, likes, image, userImage, onClick }: PostCardProps) {
	const [imageLoading, setImageLoading] = useState(true)

	useEffect(() => {
		setImageLoading(true)
	}, [image])

	return (
		<Box
			className={`post-card ${onClick ? 'post-card--clickable' : ''}`}
			onClick={onClick}
		>
			<Box className="post-card__image-wrapper">
				{imageLoading && (
					<Box className="post-card__image-loader" aria-label="Cargando imagen">
						<CircularProgress size={28} thickness={4} />
					</Box>
				)}
				<Box
					className={`post-card__image ${imageLoading ? 'post-card__image--hidden' : ''}`}
					component="img"
					src={image}
					alt={title}
					onLoad={() => setImageLoading(false)}
					onError={() => setImageLoading(false)}
				/>
			</Box>

			<Tooltip title={title} placement="top" arrow>
				<Typography className="post-card__title">
					{title}
				</Typography>
			</Tooltip>

			<Box className="post-card__meta">
				<Box className="post-card__meta-group">
					{userImage ? (
						<Box
							className="post-card__avatar"
							component="img"
							src={userImage}
							alt={author}
						/>
					) : (
						<FaRegCircleUser className="post-card__icon" size={18} />
					)}
					<Tooltip title={author} placement="top" arrow>
						<Typography className="post-card__meta-text post-card__meta-text--author">{author}</Typography>
					</Tooltip>
				</Box>

				<Box className="post-card__meta-group">
					<IoThumbsUpOutline className="post-card__icon" size={16} />
					<Typography className="post-card__meta-text" title={`${likes} likes`}>{formatLikes(likes)}</Typography>
				</Box>
			</Box>
		</Box>
	)
}

export default PostCard
