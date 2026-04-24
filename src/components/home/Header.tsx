import { useState, type MouseEvent } from 'react'
import { Box, IconButton, InputBase, Menu, MenuItem, Typography } from '@mui/material'
import { IoSearch, IoSettingsSharp, IoChevronDown } from 'react-icons/io5'
import { FaRegCircleUser } from 'react-icons/fa6'
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
  const [countryAnchorEl, setCountryAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(countries[0])
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null)

  const countryMenuOpen = Boolean(countryAnchorEl)
  const profileMenuOpen = Boolean(profileAnchorEl)

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

  const handleOpenProfileMenu = (event: MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget)
  }

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null)
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

          <IconButton className="header__icon-button" aria-label="Configuracion">
            <IoSettingsSharp className="header__icon" size={18} />
          </IconButton>

          <IconButton
            className="header__icon-button"
            onClick={handleOpenProfileMenu}
            aria-controls={profileMenuOpen ? "profile-menu" : undefined}
            aria-expanded={profileMenuOpen ? "true" : undefined}
            aria-haspopup="true"
            aria-label="Usuario"
          >
            <FaRegCircleUser className="header__icon" size={18} />
          </IconButton>
        </Box>
      </Box>

      <Menu
        id="profile-menu"
        anchorEl={profileAnchorEl}
        open={profileMenuOpen}
        onClose={handleCloseProfileMenu}
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
          onClick={handleCloseProfileMenu}
        >
          Ver perfil
        </MenuItem>
        <MenuItem
          className="header__menu-item"
          onClick={handleCloseProfileMenu}
        >
          Editar perfil
        </MenuItem>
        <MenuItem
          className="header__menu-item header__menu-item--danger"
          onClick={handleCloseProfileMenu}
        >
          Cerrar sesion
        </MenuItem>
      </Menu>

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
    </>
  )
}

export default Header
