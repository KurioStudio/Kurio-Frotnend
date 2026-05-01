import { Box } from '@mui/material'
import Header from '../../../components/home/Header'
import PostCard from '../../../components/home/PostCard'
import SidebarMenu from '../../../components/navigation/SidebarMenu'
import '../../../styles/HomePage.css'
import { useEffect, useState } from 'react'
import { findFollowedPosts, findRecentPosts, findTopPosts, findAllPosts, type FeedPost,  } from '../services/postService'
import { useNavigate } from 'react-router-dom'

export type FeedFilter = 'all' |'top' | 'recientes' | 'seguidos'

function HomePage() {
	const navigate = useNavigate()
	const [filter, setFilter] = useState<FeedFilter>('all')
	const [posts, setPosts] = useState<FeedPost[]>([])

	useEffect(() => {
		let isCancelled = false

		const cargarPosts = async () => {
			setPosts([])

			try {
				let response: FeedPost[] = []

				switch (filter) {
					case 'all':
						response = await findAllPosts()
						break
					case 'top':
						response = await findTopPosts()
						break
					case 'recientes':
						response = await findRecentPosts()
						break
					case 'seguidos':
						response = await findFollowedPosts()
						break
				}

				if (!isCancelled) {
					setPosts(response)
				}
			} catch (error) {
				if (!isCancelled) {
					setPosts([])
				}
				console.error('Error al cargar publicaciones:', error)
			}
		}

		cargarPosts()

		return () => {
			isCancelled = true
		}
	}, [filter])

	return (
		<Box className="home-page">
			<SidebarMenu onSelect={setFilter} />

			<Box className="home-page__content">
				<Header />
				<Box className="home-page__posts">
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
				</Box>
			</Box>
		</Box>
	)
}

export default HomePage
