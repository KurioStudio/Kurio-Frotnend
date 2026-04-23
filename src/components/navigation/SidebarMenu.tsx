import { Box, ButtonBase, Typography } from '@mui/material'
import {
	IoCloudUploadOutline,
	IoMailOutline,
	IoPeopleOutline,
	IoTimeOutline,
	IoTrendingUpOutline,
} from 'react-icons/io5'
import kurioLogo from '../../assets/iconos/kurioLogo.png'

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
		<Box
			sx={{
				width: 260,
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				bgcolor: '#1f2a3d',
				border: '1px solid rgba(255,255,255,0.06)',
			}}
		>
			<Box
				sx={{
					px: 3,
					pt: 3.2,
					pb: 2.4,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					textAlign: 'center',
					borderBottom: '1px solid rgba(255,255,255,0.12)',
					background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
				}}
			>
				<Box
					component="img"
					src={kurioLogo}
					alt={title}
					sx={{ width: 102, height: 102, objectFit: 'contain', mb: 1.1 }}
				/>
				<Typography sx={{ color: '#d7a449', fontSize: '2.2rem', fontWeight: 700, lineHeight: 1 }}>
					{title}
				</Typography>
			</Box>

			<Box sx={{ px: 2.2, pt: 1.7, display: 'grid', gap: 0.35 }}>
				{items.map((item) => (
					<ButtonBase
						key={item.label}
						sx={{
							justifyContent: 'flex-start',
							textAlign: 'left',
							display: 'flex',
							alignItems: 'center',
							gap: 1,
							borderRadius: 1,
							px: 1.4,
							py: 1.15,
							color: '#ecf1fb',
							fontSize: '1.05rem',
							fontWeight: 500,
							'&:hover': {
								bgcolor: 'rgba(255,255,255,0.06)',
							},
						}}
					>
						<Box component="span" sx={{ display: 'inline-flex', fontSize: '1.12rem', color: '#d7a449' }}>
							{item.icon}
						</Box>
						{item.label}
					</ButtonBase>
				))}
			</Box>

			<Box
				sx={{
					mt: 'auto',
					bgcolor: '#1f2a3d',
					px: 1.5,
					py: 1.1,
					borderTop: '1px solid rgba(255,255,255,0.14)',
				}}
			>
				<Typography sx={{ color: '#dce5f5', fontSize: '0.95rem', textAlign: 'center' }}>Version 1.0.0</Typography>
			</Box>
		</Box>
	)
}

export default SidebarMenu