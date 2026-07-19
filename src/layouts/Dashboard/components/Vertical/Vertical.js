import { useState } from "react";
import { Backdrop, Box, Fab } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useLocation } from "react-router-dom";
import ArrowUp from "mdi-material-ui/ArrowUp";
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
          <AppBar setShowBackdrop={setShowBackdrop} toggleNavVisibility={toggleNavVisibility} {...rest} />
          <ContentWrapper
            className={"layout-page-content"}
            sx={{
              ...(hideFooter && {
                height: "calc(100vh - 64px)",
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
