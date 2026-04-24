import { Box } from '@mui/material'
import Header from '../../../components/home/Header'
import PostCard from '../../../components/home/PostCard'
import SidebarMenu from '../../../components/navigation/SidebarMenu'
import '../../../styles/HomePage.css'

const samplePosts = [
	{ id: 1, title: 'Titulo del post', author: 'Usuario Usu usu', likes: 12345 },
	{ id: 2, title: 'Titulo del post', author: 'Usuario Usu usu', likes: 12345 },
	{ id: 3, title: 'Titulo del post', author: 'Usuario Usu usu', likes: 12345 },
]

function HomePage() {
	return (
		<Box className="home-page">
			<SidebarMenu />

			<Box className="home-page__content">
				<Header />
				<Box className="home-page__posts">
					{samplePosts.map((post) => (
						<PostCard key={post.id} title={post.title} author={post.author} likes={post.likes} />
					))}
				</Box>
			</Box>
		</Box>
	)
}

export default HomePage
