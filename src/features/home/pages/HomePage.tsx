import { Box } from '@mui/material'
import Header from '../../../components/home/Header'
import PostCard from '../../../components/home/PostCard'
import SidebarMenu from '../../../components/navigation/SidebarMenu'
import '../../../styles/HomePage.css'
import { useEffect, useState } from 'react'
import { findFollowedPosts, findRecentPosts, findTopPosts, findAllPosts, type FeedPost,  } from '../services/postService'

export type FeedFilter = 'all' |'top' | 'recientes' | 'seguidos'

function HomePage() {
	const [filter, setFilter] = useState<FeedFilter>('all')
	const [posts, setPosts] = useState<FeedPost[]>([])

	const cargarPosts = async () => {
		switch (filter) {
			case 'all':
				findAllPosts().then(response => setPosts(response))
				break
			case 'top':
				findTopPosts().then(response => setPosts(response))
				break
			case 'recientes':
				findRecentPosts().then(response => setPosts(response))
				break
			case 'seguidos':
				findFollowedPosts().then(response => setPosts(response))
				break
		}
	}

	useEffect(() => {
		cargarPosts()
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
							likes={post.likes}
						/>
					))}
				</Box>
			</Box>
		</Box>
	)
}

export default HomePage
