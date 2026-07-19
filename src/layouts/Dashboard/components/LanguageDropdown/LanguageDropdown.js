import { Fragment, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Translate from "mdi-material-ui/Translate";
import useLocale from "hooks/useLocale";
import useTheming from "hooks/useTheming";

const LanguageDropdown = () => {
  const { locales, locale: currentLocale, onChange } = useLocale();
  const { layout } = useTheming();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLangDropdownOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleLangDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleLangItemClick = (lang) => {
    handleLangDropdownClose();
    onChange(lang);
  };

  return (
    <Fragment>
      <IconButton
        color="inherit"
        aria-haspopup="true"
        aria-controls="customized-menu"
        onClick={handleLangDropdownOpen}
        sx={layout === "vertical" ? { mr: 0.75 } : { mx: 0.75 }}
      >
        <Translate />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleLangDropdownClose}
        sx={{ "& .MuiMenu-paper": { mt: 4, minWidth: 130 } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {locales.map((locale) => (
          <MenuItem
            key={locale.id}
            sx={{ py: 2 }}
            selected={locale.id === currentLocale.id}
            onClick={() => {
              handleLangItemClick(locale.id);
            }}
          >
            {locale.name}
          </MenuItem>
        ))}
      </Menu>
    </Fragment>
  );
};

export default LanguageDropdown;
