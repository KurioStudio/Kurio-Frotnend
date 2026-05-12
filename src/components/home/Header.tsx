import { useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputBase, Menu, MenuItem, Typography } from '@mui/material'
import { IoSearch, IoChevronDown } from 'react-icons/io5'
import { FaRegCircleUser } from 'react-icons/fa6'
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { getProfileUserById, hasValidSession, logoutUser, touchSessionActivity } from '../../utils/peticiones'
import '../../styles/Header.css'
import { useTranslation } from 'react-i18next'
import { useAlert } from '../../contexts/AlertContext'

type CountryOption = {
  code: string
  name: string
}

const countries: CountryOption[] = [
  { code: 'es', name: 'Español' },
  { code: 'us', name: 'English' },
]

const getCountryFromLanguage = (language: string): CountryOption =>
  language.toLowerCase().startsWith('en') ? countries[1] : countries[0]

const getFlagUrl = (countryCode: string) => `https://flagcdn.com/w40/${countryCode}.png`
const headerProfileCacheKey = 'kurio_header_profile_cache'

type HeaderProfileCache = {
  username: string
  avatarImg: string
}

const saveCachedHeaderProfile = (profile: HeaderProfileCache): void => {
  localStorage.setItem(headerProfileCacheKey, JSON.stringify(profile))
}

const clearCachedHeaderProfile = (): void => {
  localStorage.removeItem(headerProfileCacheKey)
}

function Header() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [countryAnchorEl, setCountryAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(() =>
    getCountryFromLanguage(i18n.resolvedLanguage ?? i18n.language)
  )
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null)
  const [profileUserName, setProfileUserName] = useState<string>(t('header.login'))
  const [profileUserAvatar, setProfileUserAvatar] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const { showAlert } = useAlert()

  const countryMenuOpen = Boolean(countryAnchorEl)
  const profileMenuOpen = Boolean(profileAnchorEl)

  useEffect(() => {
    setSelectedCountry(getCountryFromLanguage(i18n.resolvedLanguage ?? i18n.language))
  }, [i18n.language, i18n.resolvedLanguage])

  useEffect(() => {
    let isCancelled = false
    const auth = getAuth()

    const applyProfile = (user: FirebaseUser | null) => {
      if (!user) {
        setProfileUserName(t('header.login'))
        setProfileUserAvatar('')
        clearCachedHeaderProfile()
        return
      }

      return getProfileUserById(user.uid).then((profile) => {
        if (isCancelled) return

        const nextUsername = profile.username || user.email || 'Usuario'
        const nextAvatar = profile.avatarImg || ''

        setProfileUserName(nextUsername)
        setProfileUserAvatar(nextAvatar)

        saveCachedHeaderProfile({
          username: nextUsername,
          avatarImg: nextAvatar,
        })
      })
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void applyProfile(user)
    })

    const handleProfileUpdate = (e?: Event) => {
      // If the event contains profile details, use them immediately
      const custom = e as CustomEvent | undefined
      if (custom?.detail && (custom.detail.username !== undefined || custom.detail.avatarImg !== undefined)) {
        const { username, avatarImg } = custom.detail
        const nextUsername = username !== undefined ? username : profileUserName
        const nextAvatar = avatarImg !== undefined ? avatarImg : profileUserAvatar
        setProfileUserName(nextUsername)
        setProfileUserAvatar(nextAvatar)
        // Always update cache with latest values to avoid stale data on page reload
        saveCachedHeaderProfile({ username: nextUsername, avatarImg: nextAvatar })
        return
      }

      const user = auth.currentUser
      if (user) {
        void applyProfile(user)
      }
    }

    window.addEventListener('profile-updated', handleProfileUpdate)

    const events: Array<keyof WindowEventMap> = [
      'click',
      'keydown',
      'mousemove',
      'scroll',
      'touchstart',
    ]

    const handleActivity = () => touchSessionActivity()

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true })
    })

    return () => {
      isCancelled = true
      unsubscribe()
      window.removeEventListener('profile-updated', handleProfileUpdate)
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity)
      })
    }
  }, [t])

  const handleOpenCountryMenu = (event: MouseEvent<HTMLElement>) => {
    setCountryAnchorEl(event.currentTarget)
  }

  const handleCloseCountryMenu = () => {
    setCountryAnchorEl(null)
  }

  const handleSelectCountry = (country: CountryOption) => {
    setSelectedCountry(country)
    const nextLanguage = country.code === 'us' ? 'en' : country.code
    void i18n.changeLanguage(nextLanguage)
    handleCloseCountryMenu()
    showAlert({ type: 'success', message: t('header.languageChanged') })
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    const trimmedSearch = searchValue.trim()
    if (trimmedSearch) {
      navigate(`/?search=${encodeURIComponent(trimmedSearch)}`)
    }
  }

  const ensureSessionOrRedirect = async (): Promise<boolean> => {
    const isSessionValid = await hasValidSession()

    if (!isSessionValid) {
      navigate('/auth/login')
      return false
    }

    return true
  }

  const handleViewProfile = async () => {
    handleCloseProfileMenu()

    if (!(await ensureSessionOrRedirect())) {
      return
    }

    navigate('/profile')
  }

  const handleOpenProfileMenu = async (anchorElement: HTMLElement) => {
    const isSessionValid = await hasValidSession()

    if (!isSessionValid) {
      navigate('/auth/login')
      return
    }

    setProfileAnchorEl(anchorElement)
  }

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null)
  }

  const handleLogout = async () => {
    await logoutUser()
    handleCloseProfileMenu()
    setLogoutDialogOpen(false)
    clearCachedHeaderProfile()
    setProfileUserName(t('header.login'))
    setProfileUserAvatar('')
    navigate('/')
  }

  const handleAskLogout = () => {
    handleCloseProfileMenu()
    setLogoutDialogOpen(true)
  }

  const handleCloseLogoutDialog = () => {
    setLogoutDialogOpen(false)
  }

  const handleProfileButtonClick = async (event: MouseEvent<HTMLElement>) => {
    const currentUser = getAuth().currentUser

    if (!currentUser) {
      navigate('/auth/login')
      return
    }

    await handleOpenProfileMenu(event.currentTarget)
  }

  return (
    <>
      <Box className="header">
        <Box className="header__search">
          <IoSearch className="header__search-icon" size={15} />
          <InputBase
            placeholder={t('search.placeholder')}
            className="header__search-input"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </Box>

        <Box className="header__actions">
          <IconButton
            className="header__icon-button header__country-button"
            onClick={handleOpenCountryMenu}
            aria-controls={countryMenuOpen ? 'country-menu' : undefined}
            aria-expanded={countryMenuOpen ? 'true' : undefined}
            aria-haspopup="true"
            aria-label={t('header.login')}
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

          <ButtonBase
            className="header__profile-button"
            onClick={(event) => {
              void handleProfileButtonClick(event)
            }}
            aria-controls={profileMenuOpen ? 'profile-menu' : undefined}
            aria-expanded={profileMenuOpen ? 'true' : undefined}
            aria-haspopup="true"
            aria-label={profileUserName}
          >
            {profileUserAvatar ? (
              <Box
                component="img"
                src={profileUserAvatar}
                alt={profileUserName}
                className="header__profile-avatar"
                loading="lazy"
              />
            ) : (
              <Box className="header__profile-avatar header__profile-avatar--fallback">
                <FaRegCircleUser className="header__icon header__icon--profile" size={18} />
              </Box>
            )}
            <Typography className="header__profile-label">
              {profileUserName}
            </Typography>
          </ButtonBase>
        </Box>
      </Box>

      <Menu
        id="country-menu"
        anchorEl={countryAnchorEl}
        open={countryMenuOpen}
        onClose={handleCloseCountryMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
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

      <Menu
        id="profile-menu"
        anchorEl={profileAnchorEl}
        open={profileMenuOpen}
        onClose={handleCloseProfileMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            className: 'header__menu-paper',
          },
        }}
      >
        <MenuItem
          className="header__menu-item"
          onClick={() => void handleViewProfile()}
        >
          {t('header.viewProfile')}
        </MenuItem>
        <MenuItem
          className="header__menu-item header__menu-item--danger"
          onClick={handleAskLogout}
        >
          {t('header.logout')}
        </MenuItem>
      </Menu>

      <Dialog
        open={logoutDialogOpen}
        onClose={handleCloseLogoutDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        slotProps={{
          paper: {
            className: 'header__dialog-paper',
          },
        }}
      >
        <DialogTitle id="logout-dialog-title" className="header__dialog-title">
          {t('header.logoutConfirmTitle')}
        </DialogTitle>
        <DialogContent className="header__dialog-content">
          <DialogContentText id="logout-dialog-description" className="header__dialog-description">
            {t('header.logoutConfirmText')}
          </DialogContentText>
        </DialogContent>
        <DialogActions className="header__dialog-actions">
          <Button onClick={handleCloseLogoutDialog} className="header__dialog-button">
            {t('header.cancel')}
          </Button>
          <Button onClick={() => void handleLogout()} variant="contained" color="error" className="header__dialog-button header__dialog-button--danger">
            {t('header.logout')}
          </Button>
        </DialogActions>
      </Dialog>

      
    </>
  )
}

export default Header
