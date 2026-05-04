import { useEffect, useState, type MouseEvent } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputBase, Menu, MenuItem, Typography } from '@mui/material'
import { IoSearch, IoSettingsSharp, IoChevronDown } from 'react-icons/io5'
import { FaRegCircleUser } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { hasValidSession, logoutUser, touchSessionActivity } from '../../utils/peticiones'
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
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  const countryMenuOpen = Boolean(countryAnchorEl)
  const settingsMenuOpen = Boolean(settingsAnchorEl)

  useEffect(() => {
    const syncSessionState = async () => {
      const isSessionValid = await hasValidSession()
      setHasSession(isSessionValid)
    }

    void syncSessionState()
  }, [])

  useEffect(() => {
    const events: Array<keyof WindowEventMap> = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart']
    const handleActivity = () => {
      touchSessionActivity()
    }

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true })
    })

    return () => {
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

  const ensureSessionOrRedirect = async (): Promise<boolean> => {
    const isSessionValid = await hasValidSession()
    setHasSession(isSessionValid)

    if (!isSessionValid) {
      navigate('/auth/login')
      return false
    }

    return true
  }

  const handleEditarPerfil = async () => {
    handleCloseSettingsMenu()

    if (!(await ensureSessionOrRedirect())) {
      return
    }

    navigate('/profile/edit')
  }

  const handleOpenProfileMenu = async () => {
    if (!(await ensureSessionOrRedirect())) {
      return
    }

    navigate('/profile')
  }


  const handleOpenSettingsMenu = (event: MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget)
  }

  const handleCloseSettingsMenu = () => {
    setSettingsAnchorEl(null)
  }

  const handleLogout = async () => {
    await logoutUser()
    setHasSession(false)
    handleCloseSettingsMenu()
    setLogoutDialogOpen(false)
    navigate('/')
  }

  const handleAskLogout = () => {
    handleCloseSettingsMenu()
    setLogoutDialogOpen(true)
  }

  const handleCloseLogoutDialog = () => {
    setLogoutDialogOpen(false)
  }

  return (
    <>
      <Box className="header">
        <Box className="header__search">
          <IoSearch className="header__search-icon" size={15} />
          <InputBase placeholder="Buscar" className="header__search-input" />
        </Box>

        <Box className="header__actions">
        <IconButton
          className="header__icon-button header__country-button"
          onClick={handleOpenCountryMenu}
          aria-controls={countryMenuOpen ? "country-menu" : undefined}
          aria-expanded={countryMenuOpen ? "true" : undefined}
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

          {hasSession && (
            <IconButton 
              className="header__icon-button" 
              aria-label="Configuracion"
              onClick={handleOpenSettingsMenu}
              aria-controls={settingsMenuOpen ? "settings-menu" : undefined}
              aria-expanded={settingsMenuOpen ? "true" : undefined}
              aria-haspopup="true"
            >
              <IoSettingsSharp className="header__icon" size={18} />
            </IconButton>
          )}

          <IconButton
            className="header__icon-button"
            onClick={() => void handleOpenProfileMenu()}
            aria-haspopup="true"
            aria-label="Usuario"
          >
            <FaRegCircleUser className="header__icon" size={18} />
          </IconButton>
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
        id="settings-menu"
        anchorEl={settingsAnchorEl}
        open={settingsMenuOpen}
        onClose={handleCloseSettingsMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            className: 'header__menu-paper',
          },
        }}
      >
        <MenuItem
          className="header__menu-item"
          onClick={() => void handleEditarPerfil()}
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
