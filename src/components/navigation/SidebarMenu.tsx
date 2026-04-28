import { Box, ButtonBase, Typography } from '@mui/material'
import {
	IoCloudUploadOutline,
	IoMailOutline,
	IoPeopleOutline,
	IoTimeOutline,
	IoTrendingUpOutline,
} from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import kurioLogo from '../../assets/iconos/kurioLogo.png'
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
		{ label: 'Top publicaciones', icon: <IoTrendingUpOutline />, filter: 'top' },
		{ label: 'Publicaciones recientes', icon: <IoTimeOutline />, filter: 'recientes' },
		{ label: 'Seguidos', icon: <IoPeopleOutline />, filter: 'seguidos' },
		{ label: 'Subir modelo', icon: <IoCloudUploadOutline />, path: '/subir-modelo' },
		{ label: 'Inbox', icon: <IoMailOutline /> },
	]

function SidebarMenu({
	title = 'Kurio',
	items = defaultItems,
	onSelect
}: SidebarMenuProps) {
	const navigate = useNavigate()

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
						className="sidebar-menu__item"
						onClick={() => {
							if (item.filter) {
								onSelect?.(item.filter)
								return
							}

							if (item.path) {
								navigate(item.path)
							}
						}}
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