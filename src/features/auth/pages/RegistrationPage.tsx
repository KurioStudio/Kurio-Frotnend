import { useState } from 'react'
import { Box, Button, IconButton, InputAdornment, Link, MenuItem, Select, TextField, Typography } from '@mui/material'
import { IoEyeOff } from 'react-icons/io5'
import kurioLogo from '../../../assets/iconos/kurioLogo.png'

function RegistrationPage() {
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
			transform: 'translate(14px, 13px) scale(1)',
			transition: 'transform 160ms ease, color 160ms ease, max-width 160ms ease',
			pointerEvents: 'none',
			zIndex: 1,
		},
		'& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.MuiInputLabel-shrink': {
			transform: 'translate(14px, -9px) scale(0.75)',
			color: '#d7a449',
			backgroundColor: '#223852',
			paddingInline: '6px',
		},
		'& .MuiInputLabel-root:not(.Mui-focused):not(.MuiInputLabel-shrink)': {
			maxWidth: 'calc(100% - 28px)',
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
						overflowY: 'auto',
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
							Registro
						</Typography>

						<Typography sx={{ color: '#dce5f5', fontWeight: 700, mb: 2.1, fontSize: '1.1rem' }}>
							Crea tu cuenta
						</Typography>

						<Box component="form" sx={{ display: 'grid', gap: 1.45 }}>
							<TextField
								size="small"
								fullWidth
								variant="outlined"
								label="Usuario"
								slotProps={{ inputLabel: { shrink: false } }}
								placeholder="username"
								autoComplete="username"
								sx={outlinedInputSx}
							/>

							<TextField
								size="small"
								fullWidth
								variant="outlined"
								label="Correo"
								slotProps={{ inputLabel: { shrink: false } }}
								placeholder="example@email.com"
								type="email"
								autoComplete="email"
								sx={outlinedInputSx}
							/>

							<TextField
								size="small"
								type="password"
								fullWidth
								variant="outlined"
								label="Contraseña"
								slotProps={{
									inputLabel: { shrink: false },
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
								autoComplete="new-password"
								sx={outlinedInputSx}
							/>

							<TextField
								size="small"
								type="password"
								fullWidth
								variant="outlined"
								label="Confirmar contraseña"
								slotProps={{
									inputLabel: { shrink: false },
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
								autoComplete="new-password"
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
									bgcolor: '#d7a449',
									color: '#1c2028',
									boxShadow: 'none',
									'&:hover': { bgcolor: '#e2ad4f', boxShadow: 'none' },
								}}
							>
								Registrarse
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
								¿Ya tienes cuenta?
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
							<MenuItem value="es">Español</MenuItem>
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

export default RegistrationPage
