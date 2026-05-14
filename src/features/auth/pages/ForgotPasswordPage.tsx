import { useState, type FormEvent, type MouseEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import { Alert, Box, Button, CircularProgress, IconButton, Link as MuiLink, Menu, MenuItem, TextField, Typography } from '@mui/material'
import { IoChevronDown } from 'react-icons/io5'
import { Link as RouterLink } from 'react-router-dom'
import kurioLogo from '../../../assets/iconos/kurioLogo.png'
import forgotVideo from '../../../assets/img_auth/forgotpass.mp4'
import { sendForgotPasswordEmail } from '../../../utils/peticiones'
import '../../../styles/auth.css'
import '../../../styles/Header.css'
import { useTranslation } from 'react-i18next'

type CountryOption = {
	code: string
	name: string
}

const countries: CountryOption[] = [
	{ code: 'es', name: 'Español' },
  { code: 'us', name: 'English' },
]

const getFlagUrl = (countryCode: string) => `https://flagcdn.com/w40/${countryCode}.png`

function getForgotErrorMessage(error: unknown): string {
	if (error instanceof FirebaseError) {
		switch (error.code) {
			case 'auth/invalid-email':
				return 'auth.login.errors.invalidEmail'
			case 'auth/user-not-found':
				return 'auth.login.errors.generic'
			case 'auth/too-many-requests':
				return 'auth.login.errors.tooManyRequests'
			default:
				return 'auth.login.errors.generic'
		}
	}

	if (error instanceof Error) {
		return error.message || 'auth.login.errors.generic'
	}

	return 'auth.login.errors.generic'
}

function ForgotPasswordPage() {
	const { t, i18n } = useTranslation()
	const [countryAnchorEl, setCountryAnchorEl] = useState<null | HTMLElement>(null)
	const [selectedCountry, setSelectedCountry] = useState<CountryOption>(() => {
		const lang = i18n.language.toLowerCase().startsWith('en') ? 'us' : 'es'
		return countries.find(c => c.code === lang) || countries[0]
	})
	const [email, setEmail] = useState('')
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
		i18n.changeLanguage(country.code === 'us' ? 'en' : country.code)
		handleCloseCountryMenu()
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setForgotError(null)
		setForgotSuccess(null)

		if (!email.trim()) {
			setForgotError(t('auth.forgotPassword.errors.completeEmail'))
			return
		}

		setIsSubmitting(true)

		try {
			await sendForgotPasswordEmail(email.trim())
			setForgotSuccess(t('auth.register.success'))
		} catch (error) {
			setForgotError(t(getForgotErrorMessage(error)))
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

					<Box className="auth-page__content auth-page__content--forgot">
						<Typography className="auth-page__title auth-page__title--forgot">{t('auth.forgotPassword.title')}</Typography>
						<Typography className="auth-page__subtitle auth-page__subtitle--forgot">{t('auth.forgotPassword.subtitle')}</Typography>

						<Box component="form" className="auth-page__form" onSubmit={handleSubmit} autoComplete="off">
						<TextField
							size="small"
							fullWidth
							variant="outlined"
							label={t('auth.forgotPassword.email')}
							className="auth-field"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							disabled={isSubmitting}
							placeholder={t('auth.forgotPassword.placeholderEmail')}
							autoComplete="off"
						/>

						{forgotError ? <Alert severity="error">{forgotError}</Alert> : null}
						{forgotSuccess ? <Alert severity="success">{forgotSuccess}</Alert> : null}
							<Button type="submit" variant="contained" className="auth-page__submit" disabled={isSubmitting}>
								{isSubmitting ? <CircularProgress size={20} color="inherit" /> : t('auth.forgotPassword.submit')}
							</Button>

							<MuiLink component={RouterLink} to="/auth/login" underline="hover" className="auth-page__link auth-page__link--centered">
								{t('auth.forgotPassword.back')}
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

				<Box component="section" className="auth-page__visual">
					<Box
						component="video"
						src={forgotVideo}
						className="auth-page__visual-img auth-page__visual-img--zoomin"
						autoPlay
						loop
						muted
						playsInline
						preload="metadata"
						aria-label="Forgot password visual"
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default ForgotPasswordPage
