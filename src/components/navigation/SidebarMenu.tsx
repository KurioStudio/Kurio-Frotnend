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
import { useTranslation } from 'react-i18next'

type SidebarItemId =
	| 'all'
	| 'top'
	| 'recientes'
	| 'seguidos'
	| 'guardados'
	| 'upload'
	| 'inbox'

type SidebarItem = {
	id: SidebarItemId
	label: string
	icon: React.ReactNode
	filter?: FeedFilter
	path?: string
}

type SidebarMenuProps = {
	title?: string
	onSelect?: (filter: FeedFilter) => void
}

const getDefaultItems = (t: any): SidebarItem[] => [
	{
		id: 'all',
		label: t('sidebar.allPosts'),
		icon: <IoGridOutline />,
		filter: 'all',
	},
	{
		id: 'top',
		label: t('sidebar.topPosts'),
		icon: <IoTrendingUpOutline />,
		filter: 'top',
	},
	{
		id: 'recientes',
		label: t('sidebar.recentPosts'),
		icon: <IoTimeOutline />,
		filter: 'recientes',
	},
	{
		id: 'seguidos',
		label: t('sidebar.followed'),
		icon: <IoPeopleOutline />,
		filter: 'seguidos',
	},
	{
		id: 'guardados',
		label: t('sidebar.saved'),
		icon: <IoBookmarkOutline />,
		filter: 'guardados',
	},
	{
		id: 'upload',
		label: t('sidebar.uploadModel'),
		icon: <IoCloudUploadOutline />,
		path: '/subir-modelo',
	},
	{
		id: 'inbox',
		label: t('sidebar.inbox'),
		icon: <IoMailOutline />,
		path: '/inbox',
	},
]

function SidebarMenu({
	title = 'Kurio',
	onSelect,
}: SidebarMenuProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const { t } = useTranslation()

	const items = getDefaultItems(t)

	const [selectedItem, setSelectedItem] =
		useState<SidebarItemId | null>('all')

	useEffect(() => {
		// If viewing a single model detail or performing a search, clear selection
		if (location.pathname.startsWith('/detalle-modelo') || location.search.includes('search=')) {
			setSelectedItem(null)
			return
		}

		if (location.pathname === '/subir-modelo') {
			setSelectedItem('upload')
		} else if (location.pathname === '/inbox') {
			setSelectedItem('inbox')
		} else if (location.search.includes('filter=top')) {
			setSelectedItem('top')
		} else if (location.search.includes('filter=all')) {
			setSelectedItem('all')
		} else if (location.search.includes('filter=guardados')) {
			setSelectedItem('guardados')
		} else if (location.search.includes('filter=seguidos')) {
			setSelectedItem('seguidos')
		} else if (location.search.includes('filter=recientes')) {
			setSelectedItem('recientes')
		} else {
			// default highlight is 'all' posts
			setSelectedItem('all')
		}
	}, [location])

	const handleItemClick = async (item: SidebarItem) => {
		setSelectedItem(item.id)

		const authRequiredItems: SidebarItemId[] = [
			'seguidos',
			'guardados',
			'upload',
			'inbox',
		]

		if (authRequiredItems.includes(item.id)) {
			const sessionIsValid = await hasValidSession()

			if (!sessionIsValid) {
				let redirectPath = '/'

				if (item.path) {
					redirectPath = item.path
				} else if (item.filter) {
					redirectPath = `/?filter=${item.filter}`
				}

				localStorage.setItem(
					'kurio_post_login_redirect',
					redirectPath
				)
				localStorage.setItem(
					'kurio_post_login_return_to',
					`${location.pathname}${location.search}`
				)

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
					onClick={() => navigate('/')}
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
						key={item.id}
						className={`sidebar-menu__item ${
							selectedItem === item.id
								? 'sidebar-menu__item--active'
								: ''
						}`}
						onClick={() => handleItemClick(item)}
					>
						<Box
							component="span"
							className="sidebar-menu__item-icon"
						>
							{item.icon}
						</Box>

						{item.label}
					</ButtonBase>
				))}
			</Box>

			<Box className="sidebar-menu__footer">
				<Typography className="sidebar-menu__footer-text">
					{t('sidebar.footer.version')} 1.0.5
				</Typography>
			</Box>
		</Box>
	)
}

export default SidebarMenu