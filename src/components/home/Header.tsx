import { useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputBase, Menu, MenuItem, Typography } from '@mui/material'
import { IoSearch, IoChevronDown } from 'react-icons/io5'
import { FaRegCircleUser } from 'react-icons/fa6'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, getProfileUserById, hasValidSession, logoutUser, touchSessionActivity } from '../../utils/peticiones'
import '../../styles/Header.css'

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

function Header() {
  const navigate = useNavigate()
  const [countryAnchorEl, setCountryAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(countries[0])
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null)
  const [profileUserName, setProfileUserName] = useState('Iniciar Sesión')
  const [profileUserAvatar, setProfileUserAvatar] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const countryMenuOpen = Boolean(countryAnchorEl)
  const profileMenuOpen = Boolean(profileAnchorEl)

  useEffect(() => {
    let isCancelled = false

    const loadProfile = async () => {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        if (!isCancelled) {
          setProfileUserName('Iniciar Sesión')
          setProfileUserAvatar('')
        }
        return
      }

      try {
        const profile = await getProfileUserById(currentUser.id)

        if (!isCancelled) {
          setProfileUserName(profile.username || currentUser.username || 'Usuario')
          setProfileUserAvatar(profile.avatarImg || '')
        }
      } catch {
        if (!isCancelled) {
          setProfileUserName(currentUser.username || 'Usuario')
          setProfileUserAvatar('')
        }
      }
    }

    void loadProfile()

    const events: Array<keyof WindowEventMap> = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart']
    const handleActivity = () => {
      touchSessionActivity()
    }

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true })
    })

    return () => {
      isCancelled = true
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity)
      })
    }
  }, [])

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

  const handleEditProfile = async () => {
    handleCloseProfileMenu()

    if (!(await ensureSessionOrRedirect())) {
      return
    }

    navigate('/profile/edit')
  }

  const handleOpenProfileMenu = (anchorElement: HTMLElement) => {
    setProfileAnchorEl(anchorElement)
  }

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null)
  }

  const handleLogout = async () => {
    await logoutUser()
    handleCloseProfileMenu()
    setLogoutDialogOpen(false)
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

    handleOpenProfileMenu(event.currentTarget)
  }

  return (
    <>
      <Box className="header">
        <Box className="header__search">
          <IoSearch className="header__search-icon" size={15} />
          <InputBase
            placeholder="Buscar"
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
          Ver perfil
        </MenuItem>
        <MenuItem
          className="header__menu-item"
          onClick={() => void handleEditProfile()}
        >
          Editar perfil
        </MenuItem>
        <MenuItem
          className="header__menu-item header__menu-item--danger"
          onClick={handleAskLogout}
        >
          Cerrar sesión
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
          Confirmar cierre de sesión
        </DialogTitle>
        <DialogContent className="header__dialog-content">
          <DialogContentText id="logout-dialog-description" className="header__dialog-description">
            ¿Estás seguro de que quieres cerrar sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="header__dialog-actions">
          <Button onClick={handleCloseLogoutDialog} className="header__dialog-button">
            Cancelar
          </Button>
          <Button onClick={() => void handleLogout()} variant="contained" color="error" className="header__dialog-button header__dialog-button--danger">
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Header
