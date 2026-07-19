import { styled, useTheme } from "@mui/material/styles";
import { Box, Divider, IconButton, useScrollTrigger } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import MuiToolbar from "@mui/material/Toolbar";
import MenuIcon from "mdi-material-ui/Menu";
import useTheming from "hooks/useTheming";
import Autocomplete from "layouts/Dashboard/components/Autocomplete";
import ModeToggler from "layouts/Dashboard/components/ModeToggler";
import NotificationDropdown from "layouts/Dashboard/components/NotificationDropdown";
import UserDropdown from "layouts/Dashboard/components/UserDropdown";
import LanguageDropdown from "layouts/Dashboard/components/LanguageDropdown";
import hexToRGBA from "utils/hexToRgba";

const AppBarWrapper = styled(MuiAppBar)(({ theme }) => ({
  transition: "none",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0, 6),
  backgroundColor: "transparent",
  color: theme.palette.text.primary,
  minHeight: theme.mixins.toolbar.minHeight,
  [theme.breakpoints.down("sm")]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

const ToolbarWrapper = styled(MuiToolbar)(({ theme }) => ({
  width: "100%",
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  padding: `${theme.spacing(0)} !important`,
  minHeight: `${theme.mixins.toolbar.minHeight}px !important`,
  transition:
    "padding .25s ease-in-out, box-shadow .25s ease-in-out, backdrop-filter .25s ease-in-out, background-color .25s ease-in-out",
}));

const AppBar = ({ hidden, toggleNavVisibility, setShowBackdrop }) => {
  const theme = useTheme();
  const { skin, contentWidth } = useTheming();
  const scrollTrigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true,
  });

  const appBarFixedStyles = () => {
    return {
      paddingLeft: `${theme.spacing(5)} !important`,
      paddingRight: `${theme.spacing(5)} !important`,
      backdropFilter: "blur(8px)",
      boxShadow: theme.shadows[skin === "bordered" ? 0 : 3],
      backgroundColor: hexToRGBA(theme.palette.background.paper, 0.85),
      ...(skin === "bordered" && {
        border: `1px solid ${theme.palette.divider}`,
        borderTopWidth: 0,
      }),
    };
  };

  return (
    <AppBarWrapper
      elevation={0}
      color={"default"}
      className={"layout-navbar"}
      position={"sticky"}
    >
      <ToolbarWrapper
        className={"navbar-content-container"}
        sx={{
          ...(scrollTrigger && { ...appBarFixedStyles() }),
          ...(contentWidth === "boxed" && {
            "@media (min-width:1440px)": {
              maxWidth: `calc(1440px - ${theme.spacing(6)} * 2)`,
            },
          }),
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            className={"actions-left"}
            sx={{ mr: 2, display: "flex", alignItems: "center" }}
          >
            {hidden ? (
              <IconButton
                color="inherit"
                sx={{ ml: -2.75 }}
                onClick={toggleNavVisibility}
              >
                <MenuIcon />
              </IconButton>
            ) : null}
            <Autocomplete hidden={hidden} setShowBackdrop={setShowBackdrop} />
          </Box>
          <Box
            className={"actions-right"}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <LanguageDropdown />
            <Divider orientation={"vertical"} flexItem sx={{ mx: 2.5 }} />
            <ModeToggler />{" "}
            <Divider orientation={"vertical"} flexItem sx={{ mx: 2.5 }} />
            <NotificationDropdown />
            <UserDropdown />
          </Box>
        </Box>
      </ToolbarWrapper>
    </AppBarWrapper>
  );
};

export default AppBar;
