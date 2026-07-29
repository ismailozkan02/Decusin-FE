import { useState } from "react";
import { Backdrop, Box, Fab, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useLocation } from "react-router-dom";
import ArrowUp from "mdi-material-ui/ArrowUp";
import MenuIcon from "mdi-material-ui/Menu";
import { THEME } from "config";
import useTheming from "hooks/useTheming";
import ScrollToTop from "layouts/Dashboard/components/ScrollToTop";
import DatePickerWrapper from "styles/libs/react-datepicker";
import AppBar from "./components/AppBar";
import Navigation from "./components/Navigation";
import Footer from "../Footer";

const VerticalLayoutWrapper = styled(Box)({
  height: "100%",
  display: "flex",
});

const MainContentWrapper = styled(Box)({
  flexGrow: 1,
  minWidth: 0,
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  backgroundColor: "#FFFFFF",
});

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

const Vertical = ({ children, ...rest }) => {
  const { pathname } = useLocation();
  const { skin, contentWidth } = useTheming();
  const navWidth = THEME.NAVIGATION_SIZE;
  const collapsedNavWidth = THEME.COLLAPSED_NAVIGATION_SIZE;
  const navigationBorderWidth = skin === "bordered" ? 1 : 0;
  const [navHover, setNavHover] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const isKitchenPage = pathname.startsWith("/kitchen-");
  const hideFooter = pathname.endsWith("/kitchen-designer");

  const toggleNavVisibility = () => setNavVisible(!navVisible);

  return (
    <>
      <VerticalLayoutWrapper className={"layout-wrapper"}>
        <Navigation
          navWidth={navWidth}
          navHover={navHover}
          navVisible={navVisible}
          setNavHover={setNavHover}
          setNavVisible={setNavVisible}
          collapsedNavWidth={collapsedNavWidth}
          toggleNavVisibility={toggleNavVisibility}
          navigationBorderWidth={navigationBorderWidth}
          {...rest}
        />
        <MainContentWrapper className={"layout-content-wrapper"}>
          {!isKitchenPage && (
            <AppBar
              setShowBackdrop={setShowBackdrop}
              toggleNavVisibility={toggleNavVisibility}
              {...rest}
            />
          )}
          {isKitchenPage && rest.hidden && (
            <IconButton
              color="inherit"
              aria-label="Menuyu ac"
              onClick={toggleNavVisibility}
              sx={{
                position: "fixed",
                top: 10,
                left: 10,
                zIndex: 20,
                width: 40,
                height: 40,
                borderRadius: 1,
                color: "#0F172A",
                bgcolor: "rgba(255,255,255,0.94)",
                border: "1px solid rgba(203,213,225,0.9)",
                boxShadow: "0 12px 28px rgba(15,23,42,0.14)",
                backdropFilter: "blur(8px)",
                "&:hover": { bgcolor: "#FFFFFF" },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <ContentWrapper
            className={"layout-page-content"}
            sx={{
              ...(isKitchenPage && {
                pt: { xs: 9, lg: 2.5 },
              }),
              ...(hideFooter && {
                height: "100vh",
                minHeight: 0,
                overflow: "hidden",
                bgcolor: "#FFFFFF",
                backgroundColor: "#FFFFFF",
              }),
              ...(contentWidth === "boxed" && {
                mx: "auto",
                "@media (min-width:1440px)": { maxWidth: 1440 },
                "@media (min-width:1200px)": { maxWidth: "100%" },
              }),
            }}
          >
            {children}
          </ContentWrapper>
          {!hideFooter && <Footer showBackdrop={showBackdrop} />}
          <DatePickerWrapper sx={{ zIndex: 11 }}>
            <Box id={"react-datepicker-portal"} />
          </DatePickerWrapper>
        </MainContentWrapper>
        <Backdrop open={Boolean(showBackdrop)} onClick={() => setShowBackdrop(false)} sx={{ zIndex: 12 }} />
      </VerticalLayoutWrapper>
      <ScrollToTop className={"mui-fixed"}>
        <Fab color={"primary"} size={"small"} aria-label={"scroll back to top"}>
          <ArrowUp />
        </Fab>
      </ScrollToTop>
    </>
  );
};

export default Vertical;
