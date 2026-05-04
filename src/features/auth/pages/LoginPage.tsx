import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, Link as MuiLink, Menu, MenuItem, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { IoChevronDown, IoEyeOff, IoEye } from 'react-icons/io5'
import kurioLogo from '../../../assets/iconos/kurioLogo.png'
import loginVideo from '../../../assets/img_auth/login_2.mp4'
import { hasValidSession, loginWithEmail } from '../../../utils/peticiones'
import '../../../styles/auth.css'
import '../../../styles/Header.css'

type CountryOption = {
	code: string
	name: string
}

const countries: CountryOption[] = [
	{ code: 'es', name: 'Español' },
  { code: 'us', name: 'Inglés' },
  { code: 'fr', name: 'Francés' },
  { code: 'de', name: 'Alemán' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Portugués' },
]

const getFlagUrl = (countryCode: string) => `https://flagcdn.com/w40/${countryCode}.png`

function getLoginErrorMessage(error: unknown): string {
	if (error instanceof FirebaseError) {
		switch (error.code) {
			case 'auth/invalid-email':
				return 'El correo no es valido'
			case 'auth/invalid-credential':
			case 'auth/wrong-password':
			case 'auth/user-not-found':
				return 'Correo o contraseña incorrectos'
			case 'auth/user-disabled':
				return 'Esta cuenta fue deshabilitada'
			case 'auth/too-many-requests':
				return 'Demasiados intentos. Intenta mas tarde'
			default:
				return 'No se pudo iniciar sesion'
		}
	}

	if (error instanceof Error) {
		return error.message || 'No se pudo iniciar sesion'
	}

	return 'No se pudo iniciar sesion'
}

function LoginPage() {
	const navigate = useNavigate()
	const [countryAnchorEl, setCountryAnchorEl] = useState<null | HTMLElement>(null)
	const [selectedCountry, setSelectedCountry] = useState<CountryOption>(countries[0])
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [loginError, setLoginError] = useState<string | null>(null)

	const countryMenuOpen = Boolean(countryAnchorEl)

	const handleOpenCountryMenu = (event: MouseEvent<HTMLElement>) => {
		setCountryAnchorEl(event.currentTarget)
	}

	const handleCloseCountryMenu = () => {
		setCountryAnchorEl(null)
	}

	const handleSelectCountry = (country: CountryOption) => {
		setSelectedCountry(country)
		handleCloseCountryMenu()
	}

	useEffect(() => {
		let active = true

		const checkExistingSession = async () => {
			const sessionIsValid = await hasValidSession()

			if (active && sessionIsValid) {
				navigate('/', { replace: true })
			}
		}

		void checkExistingSession()

		return () => {
			active = false
		}
	}, [navigate])

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setLoginError(null)

		if (!email.trim() || !password.trim()) {
			setLoginError('Debes completar correo y contraseña')
			return
		}

		setIsSubmitting(true)

		try {
			await loginWithEmail(email.trim(), password)
			navigate('/', { replace: true })
		} catch (error) {
			setLoginError(getLoginErrorMessage(error))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Box component="main" className="auth-page">
			<Box className="auth-page__shell">
				<Box component="section" className="auth-page__panel">
					<Box className="auth-page__brand">
						<Box component="img" src={kurioLogo} alt="Kurio" className="auth-page__brand-logo" />
						<Typography className="auth-page__brand-name">Kurio</Typography>
					</Box>

					<Box className="auth-page__content">
						<Typography className="auth-page__title">Iniciar sesion</Typography>
						<Typography className="auth-page__subtitle">Bienvenida de nuevo</Typography>

						<Box component="form" className="auth-page__form" onSubmit={handleSubmit} autoComplete="off">
							{loginError ? <Alert severity="error">{loginError}</Alert> : null}

							<TextField
								size="small"
								fullWidth
								variant="outlined"
								label="Correo"
								className="auth-field"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								disabled={isSubmitting}
								placeholder="usuario@correo.com"
								autoComplete="off"
							/>

							<TextField
								size="small"
								type={showPassword ? 'text' : 'password'}
								fullWidth
								variant="outlined"
								label="Contraseña"
								className="auth-field auth-field--password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								disabled={isSubmitting}
								slotProps={{
									input: {
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													size="small"
													aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
													className="auth-field__icon-button"
													onClick={() => setShowPassword((current) => !current)}
													disabled={isSubmitting}
												>
													{showPassword ? <IoEyeOff className="auth-field__icon" /> : <IoEye className="auth-field__icon" />}
												</IconButton>
											</InputAdornment>
										),
									},
								}}
								placeholder="Tu contraseña"
								autoComplete="off"
							/>

							<Button type="submit" variant="contained" className="auth-page__submit" disabled={isSubmitting}>
								{isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Iniciar sesion'}
							</Button>

							<Box className="auth-page__links">
								<MuiLink component={RouterLink} to="/auth/forgot-password" underline="hover" className="auth-page__link">
									¿Contraseña olvidada?
								</MuiLink>

								<MuiLink component={RouterLink} to="/auth/register" underline="hover" className="auth-page__link">
									¿No tienes cuenta?
								</MuiLink>
							</Box>
						</Box>
					</Box>

					<Box component="footer" className="auth-page__footer">
						<Typography className="auth-page__footer-label">Idioma</Typography>
						<IconButton
							className="header__icon-button header__country-button auth-language-button"
							onClick={handleOpenCountryMenu}
							aria-controls={countryMenuOpen ? 'auth-country-menu' : undefined}
							aria-expanded={countryMenuOpen ? 'true' : undefined}
							aria-haspopup="true"
							aria-label="Seleccionar pais"
						>
							<Box
								component="img"
								src={getFlagUrl(selectedCountry.code)}
								alt={selectedCountry.name}
								className="header__country-flag-image"
								loading="lazy"
							/>
							<IoChevronDown className="header__icon" size={10} />
						</IconButton>
					</Box>

					<Menu
						id="auth-country-menu"
						anchorEl={countryAnchorEl}
						open={countryMenuOpen}
						onClose={handleCloseCountryMenu}
						anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
						transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						slotProps={{
							paper: {
								className: 'header__menu-paper header__menu-paper--countries',
							},
						}}
					>
						{countries.map((country) => (
							<MenuItem
								key={country.code}
								className="header__menu-item"
								onClick={() => handleSelectCountry(country)}
								selected={selectedCountry.code === country.code}
							>
								<Box
									component="img"
									src={getFlagUrl(country.code)}
									alt={country.name}
									className="header__menu-flag-image"
									loading="lazy"
								/>
								<Typography>{country.name}</Typography>
							</MenuItem>
						))}
					</Menu>
				</Box>

				<Box component="section" className="auth-page__visual">
					<Box
						component="video"
						src={loginVideo}
						className="auth-page__visual-img"
						autoPlay
						loop
						muted
						playsInline
						preload="metadata"
						aria-label="Login visual"
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default LoginPage
