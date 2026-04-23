import { useState } from 'react'
import { Box, Button, IconButton, InputAdornment, Link, MenuItem, Select, TextField, Typography } from '@mui/material'
import { IoEyeOff } from 'react-icons/io5'
import kurioLogo from '../../../assets/iconos/kurioLogo.png'

function LoginPage() {
	const [language, setLanguage] = useState('es')

	const outlinedInputSx = {
		'& .MuiInputBase-root': {
			height: 48,
			color: '#edf3ff',
			bgcolor: 'transparent',
			borderRadius: 0.9,
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(236,243,255,0.66)',
		},
		'& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: '#ffffff',
		},
		'& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: '#d7a449',
		},
		'& .MuiInputLabel-root': {
			color: '#ebeff7',
			fontWeight: 500,
		},
		'& .MuiInputLabel-root.Mui-focused': {
			color: '#d7a449',
		},
		'& .MuiInputBase-input::placeholder': {
			opacity: 1,
			color: '#d6e2f3',
		},
	}

	return (
		<Box
			component="main"
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'stretch',
				justifyContent: 'stretch',
				pt: 0,
				px: 0,
				pb: 0,
				background: '#141a23',
			}}
		>
			<Box
				sx={{
					width: '100%',
					height: '100vh',
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					borderRadius: 0,
					overflow: 'hidden',
					boxShadow: 'none',
					border: 0,
				}}
			>
				<Box
					component="section"
					sx={{
						position: 'relative',
						width: { xs: '100%', md: 'min(38vw, 430px)' },
						px: { xs: 3.2, md: 5.2 },
						pt: { xs: 3.2, md: 5.4 },
						pb: { xs: 3.2, md: 4.2 },
						bgcolor: '#223852',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'flex-start',
						height: '100%',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, mb: 4.6 }}>
						<Box
							component="img"
							src={kurioLogo}
							alt="Kurio"
							sx={{ width: 44, height: 44, objectFit: 'contain' }}
						/>
						<Typography sx={{ color: '#d7a449', fontWeight: 700, fontSize: '2.35rem', lineHeight: 1 }}>
							Kurio
						</Typography>
					</Box>

					<Box sx={{ width: '100%', maxWidth: 340, mx: 'auto' }}>
						<Typography
							sx={{
								color: '#d7a449',
								fontWeight: 500,
								mb: 0.6,
								fontSize: '2.05rem',
								textAlign: 'left',
							}}
						>
							Iniciar sesion
						</Typography>

						<Typography sx={{ color: '#dce5f5', fontWeight: 700, mb: 2.1, fontSize: '1.1rem' }}>
							Bienvenida de nuevo
						</Typography>

						<Box component="form" sx={{ display: 'grid', gap: 1.45 }}>
							<TextField
								size="small"
								fullWidth
								variant="outlined"
								label="Correo"
								slotProps={{ inputLabel: { shrink: true } }}
								placeholder="example@email.com"
								defaultValue=""
								autoComplete="username"
								sx={outlinedInputSx}
							/>

							<TextField
								size="small"
								type="password"
								fullWidth
								variant="outlined"
								label="Contraseña"
								slotProps={{
									inputLabel: { shrink: true },
									input: {
										endAdornment: (
											<InputAdornment position="end">
												<IconButton size="small" aria-label="Ocultar contrasena" sx={{ color: '#d7a449' }}>
													<IoEyeOff />
												</IconButton>
											</InputAdornment>
										),
									},
								}}
								placeholder="........"
								autoComplete="current-password"
								sx={outlinedInputSx}
							/>

							<Button
								type="submit"
								variant="contained"
								sx={{
									mt: 1.5,
									mx: 'auto',
									width: '100%',
									height: 46,
									fontSize: '1.1rem',
									fontWeight: 700,
									textTransform: 'none',
									borderRadius: 999,
									bgcolor: '#1c2028',
									color: '#ffffff',
									boxShadow: 'none',
									'&:hover': { bgcolor: '#252a34', boxShadow: 'none' },
								}}
							>
								Iniciar sesion
							</Button>

							<Button
								variant="contained"
								sx={{
									mt: 0.5,
									mx: 'auto',
									width: '100%',
									height: 46,
									fontSize: '1.1rem',
									fontWeight: 500,
									textTransform: 'none',
									borderRadius: 999,
									bgcolor: '#1c2028',
									color: '#ffffff',
									boxShadow: 'none',
									'&:hover': { bgcolor: '#252a34', boxShadow: 'none' },
								}}
							>
								Continuar con correo
							</Button>

							<Link
								href="#"
								underline="hover"
								sx={{
									mx: 'auto',
									mt: 0.9,
									fontSize: '0.96rem',
									fontWeight: 500,
									color: '#ebeff7',
								}}
							>
								¿Contraseña olvidada?
							</Link>
						</Box>
					</Box>

					<Box
						component="footer"
						sx={{
							mt: 'auto',
							pt: 2,
							display: 'flex',
							alignItems: 'center',
							justifyContent: { xs: 'center', md: 'flex-end' },
							gap: 1,
							borderTop: '1px solid rgba(255,255,255,0.08)',
						}}
					>
						<Typography sx={{ color: '#dce5f5', fontSize: '0.92rem', fontWeight: 600 }}>Idioma</Typography>
						<Select
							size="small"
							value={language}
							onChange={(event) => setLanguage(event.target.value)}
							sx={{
								minWidth: 126,
								height: 34,
								color: '#ebeff7',
								bgcolor: 'rgba(255,255,255,0.06)',
								borderRadius: 1,
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: 'rgba(236,243,255,0.32)',
								},
								'&:hover .MuiOutlinedInput-notchedOutline': {
									borderColor: 'rgba(236,243,255,0.6)',
								},
								'& .MuiSvgIcon-root': {
									color: '#d7a449',
								},
							}}
						>
							<MenuItem value="es">Espanol</MenuItem>
							<MenuItem value="en">English</MenuItem>
							<MenuItem value="fr">Francais</MenuItem>
							<MenuItem value="pt">Portugues</MenuItem>
						</Select>
					</Box>

				</Box>

				<Box
					component="section"
					sx={{
						flex: 1,
						minHeight: { xs: 260, md: 'auto' },
						position: 'relative',
						overflow: 'hidden',
						background:
							'linear-gradient(92deg, rgba(29,52,80,0.97) 0%, rgba(29,52,80,0.91) 28%, rgba(35,63,95,0.8) 58%, rgba(41,73,108,0.62) 100%)',
						'&::before': {
							content: '""',
							position: 'absolute',
							inset: 0,
							background:
								'radial-gradient(circle at 16% 50%, rgba(16,31,51,0.82), transparent 34%), radial-gradient(circle at 64% 30%, rgba(74,115,168,0.36), transparent 40%)',
						},
					}}
				>
				</Box>
			</Box>

		</Box>
	)
}

export default LoginPage
