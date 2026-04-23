import { Box, Typography } from '@mui/material'
import { IoThumbsUpOutline } from 'react-icons/io5'
import { FaRegCircleUser } from 'react-icons/fa6'

type PostCardProps = {
	title: string
	author: string
	likes: number
}

function PostCard({ title, author, likes }: PostCardProps) {
	return (
		<Box
			sx={{
				bgcolor: '#1f2a3d',
				borderRadius: 2.4,
				p: 1.1,
				border: '1px solid rgba(255,255,255,0.05)',
				display: 'grid',
				gap: 1.1,
			}}
		>
			<Box
				sx={{
					height: 170,
					bgcolor: '#be9043',
					borderRadius: 2,
				}}
			/>

			<Typography sx={{ color: '#edf3ff', fontSize: '1.95rem', lineHeight: 1.1 }}>
				{title}
			</Typography>

			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#dce5f5' }}>
					<FaRegCircleUser size={18} color="#000" />
					<Typography sx={{ fontSize: '1.2rem' }}>{author}</Typography>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, color: '#dce5f5' }}>
					<IoThumbsUpOutline size={16} color="#000" />
					<Typography sx={{ fontSize: '1.2rem' }}>{likes}</Typography>
				</Box>
			</Box>
		</Box>
	)
}

export default PostCard
