import { Box, Button, Typography } from '@mui/material'
import { IoArrowBackOutline, IoHomeOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../../../components/home/Header'
import SidebarMenu from '../../../components/navigation/SidebarMenu'

function ComingSoonPage() {
	const navigate = useNavigate()
	const { t } = useTranslation()

	return (
		<Box sx={{
			minHeight: '100vh',
			background: 'rgba(32, 58, 97, 0.48), transparent 38%), var(--kurio-bg)',
			marginLeft: 'var(--kurio-sidebar-width)',
			padding: 'calc(var(--kurio-header-height) + 30px) 16px 24px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		}}>
			<SidebarMenu />
			<Header />

			<Box sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				textAlign: 'center',
				maxWidth: 600,
				gap: 3
			}}>
				<Typography sx={{
					fontSize: { xs: '2.25rem', sm: '3.25rem' },
					fontWeight: 700,
					color: 'var(--kurio-text)'
				}}>
					{t('errors.comingSoon.title')}
				</Typography>


				<Typography sx={{
					fontSize: '1rem',
					color: 'var(--kurio-text-soft)',
					lineHeight: 1.6,
					maxWidth: 400
				}}>
					{t('errors.comingSoon.description')}
				</Typography>


				<Box sx={{
					width: 60,
					height: 2,
					background: 'var(--kurio-accent)',
					borderRadius: '999px'
				}} />


				<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, width: '100%', maxWidth: 400 }}>
					<Button
						onClick={() => navigate(-1)}
						sx={{
							flex: 1,
							height: 44,
							borderRadius: '8px',
							border: '1px solid var(--kurio-accent)',
							color: 'var(--kurio-accent)',
							textTransform: 'none',
							fontWeight: 600,
							fontSize: '0.95rem',
							background: 'rgba(215, 164, 73, 0.08)',
							transition: 'all 120ms ease',
							'&:hover': {
								background: 'var(--kurio-accent)',
								color: '#fff'
							}
						}}
						startIcon={<IoArrowBackOutline />}
					>
						{t('errors.comingSoon.back')}
					</Button>

					<Button
						onClick={() => navigate('/')}
						sx={{
							flex: 1,
							height: 44,
							borderRadius: '8px',
							color: '#fff',
							textTransform: 'none',
							fontWeight: 600,
							fontSize: '0.95rem',
							background: 'var(--kurio-accent)',
							transition: 'all 120ms ease',
							'&:hover': {
								background: 'var(--kurio-accent-hover)'
							}
						}}
						startIcon={<IoHomeOutline />}
					>
						{t('errors.comingSoon.home')}
					</Button>
				</Box>
			</Box>
		</Box>
	)
}

export default ComingSoonPage
