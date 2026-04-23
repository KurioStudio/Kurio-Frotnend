import { useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { IoSearch, IoSettingsSharp, IoChevronDown } from "react-icons/io5";
import { FaRegCircleUser } from "react-icons/fa6";

type CountryOption = {
  code: string;
  name: string;
  flag: string;
};

const countries: CountryOption[] = [
  { code: "es", name: "Espana", flag: "🇪🇸" },
  { code: "us", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "fr", name: "Francia", flag: "🇫🇷" },
  { code: "de", name: "Alemania", flag: "🇩🇪" },
  { code: "it", name: "Italia", flag: "🇮🇹" },
  { code: "pt", name: "Portugal", flag: "🇵🇹" },
];

function Header() {
  const [countryAnchorEl, setCountryAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(countries[0]);

  const countryMenuOpen = Boolean(countryAnchorEl);

  const handleOpenCountryMenu = (event: React.MouseEvent<HTMLElement>) => {
    setCountryAnchorEl(event.currentTarget);
  };

  const handleCloseCountryMenu = () => {
    setCountryAnchorEl(null);
  };

  const handleSelectCountry = (country: CountryOption) => {
    setSelectedCountry(country);
    handleCloseCountryMenu();
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: 50,
          bgcolor: "#1f2a3d",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: { xs: 1, sm: 2, md: 3 },
          py: 0.35,
          borderRadius: 1.2,
        }}
      >
        <Box
          sx={{
            flex: 1,
            maxWidth: "50%",
            height: 30,
            bgcolor: "#203a61",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            px: 1.2,
            gap: 0.7,
          }}
        >
          <IoSearch size={15} color="#0f1827" />
          <InputBase
            placeholder="Buscar"
            sx={{
              color: "#d4dded",
              width: "100%",
              fontSize: "0.875rem",
              "& input::placeholder": { opacity: 1, color: "#b8c8df" },
            }}
          />
        </Box>
      <Box sx={{ display: "flex", gap: 0.8, ml: "auto" }}>
        <IconButton
          onClick={handleOpenCountryMenu}
          sx={{
            color: "#fff",
            borderRadius: 1,
            px: 0.5,
            py: 0.2,
            gap: 0.2,
            bgcolor: "rgba(255,255,255,0.08)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
          }}
          aria-controls={countryMenuOpen ? "country-menu" : undefined}
          aria-expanded={countryMenuOpen ? "true" : undefined}
          aria-haspopup="true"
          aria-label="Seleccionar pais"
        >
          <Typography component="span" sx={{ fontSize: "0.85rem", lineHeight: 1 }}>
            {selectedCountry.flag}
          </Typography>
          <IoChevronDown size={10} />
        </IconButton>

          <IconButton sx={{ color: "#111", p: 0.35 }} aria-label="Configuracion">
            <IoSettingsSharp size={18} color="#ffffff" />
          </IconButton>

          <IconButton sx={{ color: "#111", p: 0.35 }} aria-label="Usuario">
            <FaRegCircleUser size={18} color="#ffffff" />
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
            sx: {
              mt: 0.8,
              minWidth: 220,
              bgcolor: "#1f242d",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 2,
              boxShadow: 10,
            },
          },
        }}
      >
        {countries.map((country) => (
          <MenuItem
            key={country.code}
            onClick={() => handleSelectCountry(country)}
            selected={selectedCountry.code === country.code}
            sx={{
              py: 0.8,
              px: 1.2,
              borderRadius: 1,
              mx: 0.8,
              my: 0.2,
              color: "#dce3ef",
              "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.12)" },
              "&.Mui-selected:hover": { bgcolor: "rgba(255,255,255,0.18)" },
            }}
          >
            <Typography sx={{ mr: 1.2, fontSize: "1.2rem" }}>{country.flag}</Typography>
            <Typography>{country.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default Header;
