import { useState, type FormEvent, type MouseEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import { Alert, Box, Button, CircularProgress, IconButton, Link as MuiLink, Menu, MenuItem, TextField, Typography } from '@mui/material'
import { IoChevronDown } from 'react-icons/io5'
import { Link as RouterLink } from 'react-router-dom'
import kurioLogo from '../../../assets/iconos/kurioLogo.png'
import { sendForgotPasswordEmail } from '../../../utils/peticiones'
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

function getForgotErrorMessage(error: unknown): string {
	if (error instanceof FirebaseError) {
		switch (error.code) {
			case 'auth/invalid-email':
				return 'El correo no es valido'
			case 'auth/user-not-found':
				return 'No existe una cuenta con este correo'
			case 'auth/too-many-requests':
				return 'Demasiados intentos. Intenta mas tarde'
			default:
				return 'No se pudo enviar el correo de recuperación'
		}
	}

	if (error instanceof Error) {
		return error.message || 'No se pudo enviar el correo de recuperación'
	}

	return 'No se pudo enviar el correo de recuperación'
}

function ForgotPasswordPage() {
	const [countryAnchorEl, setCountryAnchorEl] = useState<null | HTMLElement>(null)
	const [selectedCountry, setSelectedCountry] = useState<CountryOption>(countries[0])
	const [email, setEmail] = useState('')
	const [code, setCode] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [forgotError, setForgotError] = useState<string | null>(null)
	const [forgotSuccess, setForgotSuccess] = useState<string | null>(null)

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

	const handleSendCode = async () => {
		setForgotError(null)
		setForgotSuccess(null)

		if (!email.trim()) {
			setForgotError('Debes ingresar un correo')
			return
		}

		setIsSubmitting(true)

		try {
			await sendForgotPasswordEmail(email.trim())
			setForgotSuccess('Te enviamos un enlace de recuperación a tu correo')
			setCode('')
		} catch (error) {
			setForgotError(getForgotErrorMessage(error))
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		void handleSendCode()
	}

	return (
		<Box component="main" className="auth-page">
			<Box className="auth-page__shell">
				<Box component="section" className="auth-page__panel">
					<Box className="auth-page__brand">
						<Box component="img" src={kurioLogo} alt="Kurio" className="auth-page__brand-logo" />
						<Typography className="auth-page__brand-name">Kurio</Typography>
					</Box>

					<Box className="auth-page__content auth-page__content--forgot">
						<Typography className="auth-page__title auth-page__title--forgot">Restablecer contraseña</Typography>
						<Typography className="auth-page__subtitle auth-page__subtitle--forgot">Ingresa tu correo y el código recibido</Typography>

						<Box component="form" className="auth-page__form" onSubmit={handleSubmit} autoComplete="off">
							{forgotError ? <Alert severity="error">{forgotError}</Alert> : null}
							{forgotSuccess ? <Alert severity="success">{forgotSuccess}</Alert> : null}

							<TextField
								size="small"
								fullWidth
								variant="outlined"
								label="Correo"
								className="auth-field"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								disabled={isSubmitting}
								placeholder="usuario@correo.com"
								autoComplete="off"
							/>

							<Box className="auth-page__code-row">
								<TextField
									size="small"
									fullWidth
									variant="outlined"
									label="Código"
									className="auth-field"
									value={code}
									onChange={(event) => setCode(event.target.value)}
									disabled={isSubmitting}
									placeholder="Código de verificación"
									autoComplete="off"
								/>

								<Button type="button" variant="contained" className="auth-page__code-button" onClick={() => void handleSendCode()} disabled={isSubmitting}>
									{isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Enviar código'}
								</Button>
							</Box>

							<Button type="submit" variant="contained" className="auth-page__submit" disabled={isSubmitting}>
								{isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Restablecer'}
							</Button>

							<MuiLink component={RouterLink} to="/auth/login" underline="hover" className="auth-page__link auth-page__link--centered">
								Volver al inicio de sesion
							</MuiLink>
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

				<Box component="section" className="auth-page__visual" />
			</Box>
		</Box>
	)
}

export default ForgotPasswordPage
