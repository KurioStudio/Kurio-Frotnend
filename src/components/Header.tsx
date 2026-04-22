import { useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Modal,
  List,
  ListItemButton,
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
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(countries[0]);

  const handleSelectCountry = (country: CountryOption) => {
    setSelectedCountry(country);
    setCountryModalOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          bgcolor: "#21242C",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: { xs: 1, sm: 2, md: 3 },
          py: 1,
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            flex: 1,
            maxWidth: 980,
            height: 34,
            mx: "auto",
            bgcolor: "#203a61",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            px: 1.5,
            gap: 1,
          }}
        >
          <IoSearch size={17} color="#0f1827" />
          <InputBase
            placeholder="Buscar"
            sx={{
              color: "#d4dded",
              width: "100%",
              fontSize: "0.9rem",
              "& input::placeholder": { opacity: 1, color: "#b8c8df" },
            }}
          />
        </Box>

        <IconButton
          onClick={() => setCountryModalOpen(true)}
          sx={{
            color: "#fff",
            borderRadius: 1,
            px: 0.7,
            py: 0.3,
            gap: 0.3,
            bgcolor: "rgba(255,255,255,0.08)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
          }}
          aria-label="Seleccionar pais"
        >
          <Typography component="span" sx={{ fontSize: "1rem", lineHeight: 1 }}>
            {selectedCountry.flag}
          </Typography>
          <IoChevronDown size={12} />
        </IconButton>

        <IconButton sx={{ color: "#111" }} aria-label="Configuracion">
          <IoSettingsSharp size={22} color="#000" />
        </IconButton>

        <IconButton sx={{ color: "#111" }} aria-label="Usuario">
          <FaRegCircleUser size={24} color="#000" />
        </IconButton>
      </Box>

      <Modal
        open={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        aria-labelledby="country-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 360 },
            bgcolor: "#1f242d",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: 24,
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography
            id="country-modal-title"
            sx={{ color: "#f1f4f9", fontWeight: 700, mb: 1.2 }}
          >
            Selecciona tu pais
          </Typography>

          <List sx={{ p: 0 }}>
            {countries.map((country) => (
              <ListItemButton
                key={country.code}
                onClick={() => handleSelectCountry(country)}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.4,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                }}
              >
                <Typography sx={{ mr: 1.2, fontSize: "1.2rem" }}>{country.flag}</Typography>
                <Typography sx={{ color: "#dce3ef" }}>{country.name}</Typography>
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Modal>
    </>
  );
}

export default Header;