import { Box, ButtonBase, Typography } from '@mui/material'
import {
	IoCloudUploadOutline,
	IoMailOutline,
	IoPeopleOutline,
	IoTimeOutline,
	IoTrendingUpOutline,
} from 'react-icons/io5'
import kurioLogo from '../../assets/iconos/kurioLogo.png'
import '../../styles/SidebarMenu.css'

type SidebarMenuProps = {
	title?: string
	items?: { label: string; icon: React.ReactNode }[]
}

const defaultItems = [
	{ label: 'Top publicaciones', icon: <IoTrendingUpOutline /> },
	{ label: 'Publicaciones recientes', icon: <IoTimeOutline /> },
	{ label: 'Seguidos', icon: <IoPeopleOutline /> },
	{ label: 'Subir modelo', icon: <IoCloudUploadOutline /> },
	{ label: 'Inbox', icon: <IoMailOutline /> },
]

function SidebarMenu({ title = 'Kurio', items = defaultItems }: SidebarMenuProps) {
	return (
		<Box className="sidebar-menu">
			<Box className="sidebar-menu__brand">
				<Box
					component="img"
					src={kurioLogo}
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
					>
						<Box component="span" className="sidebar-menu__item-icon">
							{item.icon}
						</Box>
						{item.label}
					</ButtonBase>
				))}
			</Box>

			<Box className="sidebar-menu__footer">
				<Typography className="sidebar-menu__footer-text">Version 1.0.0</Typography>
			</Box>
		</Box>
	)
}

export default SidebarMenu