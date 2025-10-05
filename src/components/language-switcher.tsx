"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
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

function LanguageSwitcher() {
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
      <Button
        onClick={handleClick}
        sx={{
          color: "inherit",
          textTransform: "none",
          minWidth: "auto",
          px: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="body2">
            {languageFlags[currentLanguage as keyof typeof languageFlags]}
          </Typography>
          <Typography variant="body2">
            {languageNames[currentLanguage as keyof typeof languageNames]}
          </Typography>
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
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
              minWidth: 120,
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

export default LanguageSwitcher;
