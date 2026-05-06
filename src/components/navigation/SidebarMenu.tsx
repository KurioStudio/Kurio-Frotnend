import { Box, ButtonBase, Typography } from '@mui/material'
import {
	IoCloudUploadOutline,
	IoGridOutline,
	IoMailOutline,
	IoPeopleOutline,
	IoTimeOutline,
	IoTrendingUpOutline,
	IoBookmarkOutline,
} from 'react-icons/io5'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import kurioLogo from '../../assets/iconos/kurioLogo.png'
import { hasValidSession } from '../../utils/peticiones'
import '../../styles/SidebarMenu.css'
import type { FeedFilter } from '../../features/home/pages/HomePage'

type SidebarMenuProps = {
	title?: string;
	items?: {
		label: string;
		icon: React.ReactNode;
		filter?: FeedFilter;
		path?: string;
	}[];
	onSelect?: (filter: FeedFilter) => void;
}

const defaultItems: {
	label: string;
	icon: React.ReactNode;
	filter?: FeedFilter;
	path?: string;
}[] = [
		{ label: 'Todas las publicaciones', icon: <IoGridOutline />, filter: 'all' },
		{ label: 'Top publicaciones', icon: <IoTrendingUpOutline />, filter: 'top' },
		{ label: 'Publicaciones recientes', icon: <IoTimeOutline />, filter: 'recientes' },
		{ label: 'Seguidos', icon: <IoPeopleOutline />, filter: 'seguidos' },
		{ label: 'Guardados', icon: <IoBookmarkOutline />, filter: 'guardados' },
		{ label: 'Subir modelo', icon: <IoCloudUploadOutline />, path: '/subir-modelo' },
		{ label: 'Inbox', icon: <IoMailOutline /> },
	]

function SidebarMenu({
	title = 'Kurio',
	items = defaultItems,
	onSelect
}: SidebarMenuProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const [selectedItem, setSelectedItem] = useState<string>('Top publicaciones')

	useEffect(() => {
		// Map routes to sidebar item labels
		if (location.pathname === '/subir-modelo') {
			setSelectedItem('Subir modelo')
		} else if (location.search.includes('search=')) {
			setSelectedItem('')
		} else if (location.search.includes('filter=all')) {
			setSelectedItem('Todas las publicaciones')
		} else if (location.search.includes('filter=guardados')) {
			setSelectedItem('Guardados')
		} else if (location.search.includes('filter=seguidos')) {
			setSelectedItem('Seguidos')
		} else if (location.search.includes('filter=recientes')) {
			setSelectedItem('Publicaciones recientes')
		} else if (location.pathname === '/' || location.search.includes('filter=top')) {
			setSelectedItem('Top publicaciones')
		}
	}, [location])

	const handleItemClick = async (item: typeof defaultItems[0]) => {
		setSelectedItem(item.label)
		
		// Items that require authentication
		const authRequiredItems = ['Seguidos', 'Guardados', 'Subir modelo', 'Inbox']
		
		if (authRequiredItems.includes(item.label)) {
			const sessionIsValid = await hasValidSession()
			if (!sessionIsValid) {
				// Save the redirect path based on the item
				let redirectPath = '/'
				if (item.path) {
					redirectPath = item.path
				} else if (item.filter) {
					redirectPath = `/?filter=${item.filter}`
				}
				localStorage.setItem('kurio_post_login_redirect', redirectPath)
				navigate('/auth/login', { replace: true })
				return
			}
		}

		if (item.filter) {
			onSelect?.(item.filter)
			navigate(`/?filter=${item.filter}`)
			return
		}

		if (item.path) {
			navigate(item.path)
		}
	}

	return (
		<Box className="sidebar-menu">
			<Box className="sidebar-menu__brand">
				<Box
					component="img"
					src={kurioLogo}
					onClick={() => window.location.href = '/'}
					onSelect={() => onSelect?.('all')}
					alt={title}
					className="sidebar-menu__logo"
				/>
				<Typography className="sidebar-menu__title">
					{title}
				</Typography>
			</Box>

			<Box className="sidebar-menu__items">
				{items.map((item) => (
					<ButtonBase
						key={item.label}
						className={`sidebar-menu__item ${selectedItem === item.label ? 'sidebar-menu__item--active' : ''}`}
						onClick={() => handleItemClick(item)}
					>
						<Box component="span" className="sidebar-menu__item-icon">
							{item.icon}
						</Box>
						{item.label}
					</ButtonBase>
				))}
			</Box>

			<Box className="sidebar-menu__footer">
				<Typography className="sidebar-menu__footer-text">
					Version 1.0.0
				</Typography>
			</Box>
		</Box>
	);
}

export default SidebarMenu