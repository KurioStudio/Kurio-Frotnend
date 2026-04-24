import { useState, type MouseEvent } from 'react'
import { Box, Button, IconButton, InputAdornment, Link as MuiLink, Menu, MenuItem, TextField, Typography } from '@mui/material'
import { IoChevronDown, IoEyeOff } from 'react-icons/io5'
import { Link as RouterLink } from 'react-router-dom';
import kurioLogo from '../../../assets/iconos/kurioLogo.png'
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

function RegistrationPage() {
	const [countryAnchorEl, setCountryAnchorEl] = useState<null | HTMLElement>(null)
	const [selectedCountry, setSelectedCountry] = useState<CountryOption>(countries[0])

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

	return (
		<Box component="main" className="auth-page">
			<Box className="auth-page__shell">
				<Box component="section" className="auth-page__panel auth-page__panel--scroll">
					<Box className="auth-page__brand">
						<Box component="img" src={kurioLogo} alt="Kurio" className="auth-page__brand-logo" />
						<Typography className="auth-page__brand-name">Kurio</Typography>
					</Box>

					<Box className="auth-page__content">
						<Typography className="auth-page__title">Registro</Typography>
						<Typography className="auth-page__subtitle">Crea tu cuenta</Typography>

						<Box component="form" className="auth-page__form">
							<TextField
								size="small"
								fullWidth
								variant="outlined"
								label="Usuario"
								className="auth-field"
								slotProps={{ inputLabel: { shrink: false } }}
								placeholder="username"
								autoComplete="username"
							/>

							<TextField
								size="small"
								fullWidth
								variant="outlined"
								label="Correo"
								className="auth-field"
								slotProps={{ inputLabel: { shrink: false } }}
								placeholder="example@email.com"
								type="email"
								autoComplete="email"
							/>

							<TextField
								size="small"
								type="password"
								fullWidth
								variant="outlined"
								label="Contraseña"
								className="auth-field auth-field--password"
								slotProps={{
									inputLabel: { shrink: false },
									input: {
										endAdornment: (
											<InputAdornment position="end">
												<IconButton size="small" aria-label="Ocultar contrasena" className="auth-field__icon-button">
													<IoEyeOff className="auth-field__icon" />
												</IconButton>
											</InputAdornment>
										),
									},
								}}
								placeholder="........"
								autoComplete="new-password"
							/>

							<TextField
								size="small"
								type="password"
								fullWidth
								variant="outlined"
								label="Confirmar contraseña"
								className="auth-field auth-field--password"
								slotProps={{
									inputLabel: { shrink: false },
									input: {
										endAdornment: (
											<InputAdornment position="end">
												<IconButton size="small" aria-label="Ocultar contrasena" className="auth-field__icon-button">
													<IoEyeOff className="auth-field__icon" />
												</IconButton>
											</InputAdornment>
										),
									},
								}}
								placeholder="........"
								autoComplete="new-password"
							/>

							<Button type="submit" variant="contained" className="auth-page__submit">
								Registrarse
							</Button>

							<MuiLink component={RouterLink} to="/auth/login" underline="hover" className="auth-page__link auth-page__link--centered">
								¿Ya tienes cuenta?
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

export default RegistrationPage
