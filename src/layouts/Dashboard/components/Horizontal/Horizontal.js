import {
  AppBar as MuiAppBar,
  Box,
  Divider,
  Fab,
  Toolbar as MuiToolbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useLocation } from "react-router-dom";
import ArrowUp from "mdi-material-ui/ArrowUp";
import { THEME } from "config";
import Customizer from "components/Customizer";
import ScrollToTop from "components/ScrollToTop";
import useTheming from "hooks/useTheming";
import ModeToggler from "layouts/Dashboard/components/ModeToggler";
import NotificationDropdown from "layouts/Dashboard/components/NotificationDropdown";
import UserDropdown from "layouts/Dashboard/components/UserDropdown";
import Autocomplete from "layouts/Dashboard/components/Autocomplete";
import DatePickerWrapper from "styles/libs/react-datepicker";
import hexToRGBA from "utils/hexToRgba";
import { AppBar, Navigation } from "./components";
import Footer from "../Footer";
import LanguageDropdown from "layouts/Dashboard/components/LanguageDropdown";

const HorizontalLayoutWrapper = styled("div")({
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  backgroundColor: "#FFFFFF",
  ...(THEME.HORIZONTAL_MENU_ANIMATION && { overflow: "clip" }),
});

const Toolbar = styled(MuiToolbar)(({ theme }) => ({
  width: "100%",
  padding: `${theme.spacing(0, 6)} !important`,
  [theme.breakpoints.down("sm")]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(4),
  },
  [theme.breakpoints.down("xs")]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

const ContentWrapper = styled("main")(({ theme }) => ({
  flexGrow: 1,
  width: "100%",
  padding: theme.spacing(6),
  transition: "padding .25s ease-in-out",
  [theme.breakpoints.down("sm")]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

const Horizontal = ({ children, ...rest }) => {
  const { pathname } = useLocation();
  const { skin, contentWidth } = useTheming();
  const hideFooter = pathname.endsWith("/kitchen-designer");

  return (
    <HorizontalLayoutWrapper className={"layout-wrapper"}>
      <MuiAppBar
        color={"default"}
        elevation={skin === "bordered" ? 0 : 3}
        className={"layout-navbar-and-nav-container"}
        position={"sticky"}
        sx={{
          alignItems: "center",
          color: "text.primary",
          justifyContent: "center",
          ...(skin === "bordered" && {
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }),
          transition:
            "border-bottom 0.2s ease-in-out, backdrop-filter .25s ease-in-out, box-shadow .25s ease-in-out",
          backdropFilter: "blur(8px)",
          backgroundColor: (theme) =>
            hexToRGBA(theme.palette.background.paper, 0.85),
        }}
      >
        <Box
          className={"layout-navbar"}
          sx={{
            width: "100%",
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar
            className={"navbar-content-container"}
            sx={{
              mx: "auto",
              ...(contentWidth === "boxed" && {
                "@media (min-width:1440px)": { maxWidth: 1440 },
              }),
              minHeight: (theme) =>
                `${theme.mixins.toolbar.minHeight - 1}px !important`,
            }}
          >
            <AppBar />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Autocomplete />{" "}
              <Divider orientation={"vertical"} flexItem sx={{ mx: 2.5 }} />
              <LanguageDropdown />
              <Divider orientation={"vertical"} flexItem sx={{ mx: 2.5 }} />
              <ModeToggler />{" "}
              <Divider orientation={"vertical"} flexItem sx={{ mx: 2.5 }} />
              <NotificationDropdown />{" "}
              <Divider orientation={"vertical"} flexItem sx={{ mx: 2.5 }} />
              <UserDropdown />
            </Box>
          </Toolbar>
        </Box>
        <Box className="layout-horizontal-nav" sx={{ width: "100%" }}>
          <Toolbar
            className={"horizontal-nav-content-container"}
            sx={{
              mx: "auto",
              ...(contentWidth === "boxed" && {
                "@media (min-width:1440px)": { maxWidth: 1440 },
              }),
              minHeight: (theme) =>
                `${theme.mixins.toolbar.minHeight - (skin === "bordered" ? 1 : 0)}px !important`,
            }}
          >
            <Navigation />
          </Toolbar>
        </Box>
      </MuiAppBar>
      <ContentWrapper
        className="layout-page-content"
        sx={{
          ...(contentWidth === "boxed" && {
            mx: "auto",
            "@media (min-width:1440px)": { maxWidth: 1440 },
            "@media (min-width:1200px)": { maxWidth: "100%" },
          }),
        }}
      >
        {children}
      </ContentWrapper>
      {!hideFooter && <Footer {...rest} />}
      <DatePickerWrapper sx={{ zIndex: 11 }}>
        <Box id={"react-datepicker-portal"} />
      </DatePickerWrapper>
      {THEME.DISABLE_CUSTOMIZER ? null : <Customizer />}
      <ScrollToTop className={"mui-fixed"}>
        <Fab color={"primary"} size={"small"} aria-label={"scroll back to top"}>
          <ArrowUp />
        </Fab>
      </ScrollToTop>
    </HorizontalLayoutWrapper>
  );
};

export default Horizontal;
