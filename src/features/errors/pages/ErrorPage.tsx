import { Box, Button, Typography } from '@mui/material'
import { IoArrowBackOutline, IoWarningOutline, IoHomeOutline } from 'react-icons/io5'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../../../components/home/Header'
import SidebarMenu from '../../../components/navigation/SidebarMenu'

interface ErrorPageProps {
	statusCode?: number
	title?: string
	message?: string
	showDetails?: boolean
}

function ErrorPage({
	statusCode = 500,
	title = 'Algo salió mal',
	message = 'Hubo un error inesperado. Por favor, intenta de nuevo.',
	showDetails = false
}: ErrorPageProps) {
	const navigate = useNavigate()
	const location = useLocation()

	const getErrorDescription = () => {
		switch (statusCode) {
			case 400:
				return 'Solicitud inválida'
			case 401:
				return 'No autenticado'
			case 403:
				return 'Acceso denegado'
			case 404:
				return 'No encontrado'
			case 500:
				return 'Error del servidor'
			case 503:
				return 'Servicio no disponible'
			default:
				return 'Error desconocido'
		}
	}

	return (
		<Box sx={{
			minHeight: '100vh',
			background: 'radial-gradient(circle at 88% 8%, rgba(215, 164, 73, 0.14), transparent 34%), radial-gradient(circle at 12% 92%, rgba(32, 58, 97, 0.48), transparent 38%), var(--kurio-bg)',
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
				{/* Error Icon */}
				<Box sx={{
					fontSize: '5rem',
					color: 'var(--kurio-accent)',
					display: 'flex',
					justifyContent: 'center'
				}}>
					<IoWarningOutline />
				</Box>

				{/* Status Code */}
				<Typography sx={{
					fontSize: { xs: '3rem', sm: '4rem' },
					fontWeight: 900,
					lineHeight: 1,
					background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.8))',
					backgroundClip: 'text',
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					letterSpacing: '-2px'
				}}>
					{statusCode}
				</Typography>

				{/* Title */}
				<Typography sx={{
					fontSize: { xs: '1.75rem', sm: '2.25rem' },
					fontWeight: 700,
					color: 'var(--kurio-text)'
				}}>
					{title}
				</Typography>

				{/* Description */}
				<Typography sx={{
					fontSize: '1rem',
					color: 'var(--kurio-text-soft)',
					lineHeight: 1.6,
					maxWidth: 400
				}}>
					{message}
				</Typography>

				{/* Divider */}
				<Box sx={{
					width: 60,
					height: 2,
					background: 'var(--kurio-accent)',
					borderRadius: '999px'
				}} />

				{/* Action Buttons */}
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
						Atrás
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
						Ir al inicio
					</Button>
				</Box>

				{/* Additional Info */}
				<Box sx={{
					marginTop: 3,
					padding: 2,
					background: 'rgba(18, 24, 35, 0.62)',
					border: '1px solid rgba(255, 255, 255, 0.06)',
					borderRadius: '12px',
					width: '100%'
				}}>
					<Typography sx={{
						fontSize: '0.85rem',
						color: 'var(--kurio-text-muted)',
						marginBottom: 1
					}}>
						Error Details:
					</Typography>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
						<Typography sx={{
							fontSize: '0.9rem',
							color: 'var(--kurio-text-soft)',
							fontFamily: 'monospace'
						}}>
							Status: {statusCode} - {getErrorDescription()}
						</Typography>
						{showDetails && (
							<Typography sx={{
								fontSize: '0.85rem',
								color: 'var(--kurio-text-muted)',
								fontFamily: 'monospace'
							}}>
								Path: {location.pathname}
							</Typography>
						)}
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

export default ErrorPage
