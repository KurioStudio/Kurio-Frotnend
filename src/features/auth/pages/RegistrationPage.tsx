import { useState, type FormEvent, type MouseEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { IoChevronDown, IoEye, IoEyeOff } from 'react-icons/io5'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import kurioLogo from '../../../assets/iconos/kurioLogo.png'
import registerVideo from '../../../assets/img_auth/register.mp4'
import { registerWithEmail } from '../../../utils/peticiones'
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

function getRegisterErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'auth.register.errors.emailInUse'
      case 'auth/invalid-email':
        return 'auth.register.errors.invalidEmail'
      case 'auth/weak-password':
        return 'auth.register.errors.weakPassword'
      default:
        return 'auth.register.errors.generic'
    }
  }

  if (error instanceof Error) {
    return error.message || 'auth.register.errors.generic'
  }

  return 'auth.register.errors.generic'
}

function RegistrationPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [countryAnchorEl, setCountryAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(() => {
    const lang = i18n.language.toLowerCase().startsWith('en') ? 'us' : 'es'
    return countries.find((c) => c.code === lang) || countries[0]
  })
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null)

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
    setRegisterError(null)
    setRegisterSuccess(null)

    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setRegisterError(t('auth.register.errors.completeFields'))
      return
    }

    if (password !== confirmPassword) {
      setRegisterError(t('auth.register.errors.passwordMismatch'))
      return
    }

    setIsSubmitting(true)

    try {
      await registerWithEmail({
        username: username.trim(),
        email: email.trim(),
        password,
      })

      setRegisterSuccess(t('auth.register.success'))
      const redirectPath = localStorage.getItem('kurio_post_login_redirect')
      if (redirectPath) {
        localStorage.removeItem('kurio_post_login_redirect')
        const returnTo = localStorage.getItem('kurio_post_login_return_to')

        if (returnTo) {
          localStorage.removeItem('kurio_post_login_return_to')
        }

        navigate(redirectPath, {
          replace: true,
          state: returnTo ? { returnTo } : location.state,
        })
      } else {
        navigate('/', { replace: true })
      }
    } catch (error) {
      setRegisterError(t(getRegisterErrorMessage(error)))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box component="main" className="auth-page">
      <Box className="auth-page__shell">
        <Box component="section" className="auth-page__panel auth-page__panel--scroll">
          <ButtonBase
            className="auth-page__brand"
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none', cursor: 'pointer', width: 'fit-content', alignSelf: 'flex-start' }}
          >
            <Box component="img" src={kurioLogo} alt="Kurio" className="auth-page__brand-logo" />
            <Typography className="auth-page__brand-name">Kurio</Typography>
          </ButtonBase>

          <Box className="auth-page__content">
            <Typography className="auth-page__title">{t('auth.register.title')}</Typography>
            <Typography className="auth-page__subtitle">{t('auth.register.subtitle')}</Typography>

            <Box component="form" className="auth-page__form" onSubmit={handleSubmit} autoComplete="off">
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                label={t('auth.register.username')}
                className="auth-field"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={isSubmitting}
                placeholder={t('auth.register.placeholderUsername')}
                autoComplete="off"
              />

              <TextField
                size="small"
                fullWidth
                variant="outlined"
                label={t('auth.register.email')}
                className="auth-field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                placeholder={t('auth.register.placeholderEmail')}
                type="email"
                autoComplete="off"
              />

              <TextField
                size="small"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                label={t('auth.register.password')}
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
                          aria-label={t('auth.register.password')}
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
                placeholder={t('auth.register.placeholderPassword')}
                autoComplete="off"
              />

              <TextField
                size="small"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                label={t('auth.register.confirmPassword')}
                className="auth-field auth-field--password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isSubmitting}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          aria-label={t('auth.register.confirmPassword')}
                          className="auth-field__icon-button"
                          onClick={() => setShowConfirmPassword((current) => !current)}
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? <IoEyeOff className="auth-field__icon" /> : <IoEye className="auth-field__icon" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                placeholder={t('auth.register.placeholderConfirm')}
                autoComplete="off"
              />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                {registerError ? <Alert severity="error">{registerError}</Alert> : null}
                {registerSuccess ? <Alert severity="success">{registerSuccess}</Alert> : null}
              </Box>

              <Button type="submit" variant="contained" className="auth-page__submit" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : t('auth.register.submit')}
              </Button>

              <MuiLink component={RouterLink} to="/auth/login" underline="hover" className="auth-page__link auth-page__link--centered">
                {t('auth.register.haveAccount')}
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
            src={registerVideo}
            className="auth-page__visual-img auth-page__visual-img--zoomin"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label="Registration visual"
          />
        </Box>
      </Box>
    </Box>
  )
}

export default RegistrationPage
