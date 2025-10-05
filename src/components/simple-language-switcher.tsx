"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LanguageIcon from "@mui/icons-material/Language";
import { useTranslation } from "@/services/i18n/client";
import useStoreLanguageActions from "@/services/i18n/use-store-language-actions";
import useLanguage from "@/services/i18n/use-language";
import { languages } from "@/services/i18n/config";
import { usePathname, useRouter } from "next/navigation";

const languageNames = {
  en: "English",
  fa: "فارسی",
};

const languageFlags = {
  en: "🇺🇸",
  fa: "🇮🇷",
};

function SimpleLanguageSwitcher() {
  const { i18n } = useTranslation("common");
  const { setLanguage } = useStoreLanguageActions();
  const currentLanguage = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language: string) => {
    setLanguage(language);
    i18n.changeLanguage(language);

    // Remove current language prefix from pathname
    const pathWithoutLanguage = pathname.replace(/^\/[a-z]{2}/, "") || "/";

    // Redirect to the same page with new language prefix
    router.push(`/${language}${pathWithoutLanguage}`);

    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: "inherit",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        <LanguageIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            minWidth: 120,
          },
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language}
            onClick={() => handleLanguageChange(language)}
            selected={currentLanguage === language}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="body2">
              {languageFlags[language as keyof typeof languageFlags]}
            </Typography>
            <Typography variant="body2">
              {languageNames[language as keyof typeof languageNames]}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default SimpleLanguageSwitcher;
