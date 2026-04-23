import { Box } from '@mui/material'
import Header from '../../../components/home/Header'
import PostCard from '../../../components/home/PostCard'
import SidebarMenu from '../../../components/navigation/SidebarMenu'

const samplePosts = [
	{ id: 1, title: 'Titulo del post', author: 'Usuario Usu usu', likes: 12345 },
	{ id: 2, title: 'Titulo del post', author: 'Usuario Usu usu', likes: 12345 },
	{ id: 3, title: 'Titulo del post', author: 'Usuario Usu usu', likes: 12345 },
]

function HomePage() {
	return (
		<Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#141a23' }}>
			<SidebarMenu />

			<Box sx={{ flex: 1, p: 1.2, display: 'grid', gap: 1.2, gridTemplateRows: 'auto 1fr' }}>
				<Header />
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
						gap: 1.2,
						alignContent: 'start',
						borderRadius: 1,
						p: 1.2,
						overflow: 'auto',
						maxHeight: 'calc(100vh - 180px)',
					}}
				>
					{samplePosts.map((post) => (
						<PostCard key={post.id} title={post.title} author={post.author} likes={post.likes} />
					))}
				</Box>
			</Box>
		</Box>
	)
}

export default HomePage
