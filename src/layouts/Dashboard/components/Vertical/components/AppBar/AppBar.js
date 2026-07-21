import { styled, useTheme } from "@mui/material/styles";
import { Box, IconButton, useScrollTrigger } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import MuiToolbar from "@mui/material/Toolbar";
import MenuIcon from "mdi-material-ui/Menu";
import useTheming from "hooks/useTheming";
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

const AppBar = ({ hidden, toggleNavVisibility }) => {
  const theme = useTheme();
  const { skin, contentWidth } = useTheming();
  const scrollTrigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true,
  });

  const appBarFixedStyles = () => ({
    paddingLeft: `${theme.spacing(5)} !important`,
    paddingRight: `${theme.spacing(5)} !important`,
    backdropFilter: "blur(8px)",
    boxShadow: theme.shadows[skin === "bordered" ? 0 : 3],
    backgroundColor: hexToRGBA(theme.palette.background.paper, 0.85),
    ...(skin === "bordered" && {
      border: `1px solid ${theme.palette.divider}`,
      borderTopWidth: 0,
    }),
  });

  return (
    <AppBarWrapper
      elevation={0}
      color="default"
      className="layout-navbar"
      position="sticky"
    >
      <ToolbarWrapper
        className="navbar-content-container"
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
          className="actions-left"
          sx={{ mr: 2, display: "flex", alignItems: "center" }}
        >
          {hidden ? (
            <IconButton color="inherit" sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
              <MenuIcon />
            </IconButton>
          ) : null}
        </Box>
      </ToolbarWrapper>
    </AppBarWrapper>
  );
};

export default AppBar;
