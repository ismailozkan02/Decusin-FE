import { useRef, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Box, Button, List } from "@mui/material";
import { useLocation } from "react-router-dom";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import useAuth from "hooks/useAuth";
import useLocale from "hooks/useLocale";
import useTheming from "hooks/useTheming";
import nav from "routes/nav";
import hexToRGBA from "utils/hexToRgba";
import QuoteSummaryControl from "../QuoteSummaryControl";
import { Drawer, NavHeader, NavItems } from "./components";

const StyledBoxForShadow = styled(Box)({
  top: 55,
  left: -8,
  zIndex: 2,
  height: 75,
  display: "none",
  position: "absolute",
  pointerEvents: "none",
  width: "calc(100% + 15px)",
  "&.d-block": {
    display: "block",
  },
});

const Navigation = (props) => {
  const { me, logout } = useAuth();

  const { navHover } = props;
  const { pathname } = useLocation();
  const theme = useTheme();
  const { skin, navCollapsed } = useTheming();
  const { formatMessage } = useLocale();
  const shadowRef = useRef(null);
  const [groupActive, setGroupActive] = useState([]);
  const [currentActiveGroup, setCurrentActiveGroup] = useState([]);
  const showQuoteSummary = pathname.endsWith("/kitchen-designer");

  // ** Scroll Menu
  const scrollMenu = (container) => {
    container = container.target || container;
    if (shadowRef.current && container.scrollTop > 0) {
      if (!shadowRef.current.classList.contains("d-block")) {
        shadowRef.current.classList.add("d-block");
      }
    } else if (shadowRef.current) {
      shadowRef.current.classList.remove("d-block");
    }
  };

  const shadowBgColor = () => {
    if (skin === "semi-dark" && theme.palette.mode === "light") {
      return `linear-gradient(${theme.palette.customColors.darkBg} 40%,${hexToRGBA(
        theme.palette.customColors.darkBg,
        0.1,
      )} 95%,${hexToRGBA(theme.palette.customColors.darkBg, 0.05)})`;
    }

    if (skin === "semi-dark" && theme.palette.mode === "dark") {
      return `linear-gradient(${theme.palette.customColors.lightBg} 40%,${hexToRGBA(
        theme.palette.customColors.lightBg,
        0.1,
      )} 95%,${hexToRGBA(theme.palette.customColors.lightBg, 0.05)})`;
    }

    return `linear-gradient(${theme.palette.background.default} 40%,${hexToRGBA(
      theme.palette.background.default,
      0.1,
    )} 95%,${hexToRGBA(theme.palette.background.default, 0.05)})`;
  };

  return (
    <Drawer {...props}>
      <NavHeader {...props} />

      <StyledBoxForShadow
        ref={shadowRef}
        sx={{ background: shadowBgColor() }}
      />
      <Box
        onScroll={scrollMenu}
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          overflowX: "hidden",
          flex: 1,
          minHeight: 0,
          overscrollBehavior: "contain",
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: 8,
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: (theme) => theme.palette.action.disabled,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        }}
      >
        <List
          className={"nav-items"}
          sx={{
            transition: "padding .25s ease",
            pr: !navCollapsed || (navCollapsed && navHover) ? 4.5 : 1.25,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              width: "100%",
              minHeight: "100%",
            }}
          >
            <NavItems
              items={nav(me, formatMessage)}
              groupActive={groupActive}
              setGroupActive={setGroupActive}
              currentActiveGroup={currentActiveGroup}
              setCurrentActiveGroup={setCurrentActiveGroup}
              {...props}
            />
            {showQuoteSummary && (
              <Box
                sx={{
                  flex: 1,
                  px: navCollapsed && !navHover ? 0 : 2.75,
                  py: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <QuoteSummaryControl compact={navCollapsed && !navHover} />
              </Box>
            )}
          </Box>
        </List>
      </Box>
      <Box
        sx={{
          flexShrink: 0,
          borderTop: (theme) => `thin solid rgba(${theme.palette.customColors.main}, .12)`,
          px: navCollapsed && !navHover ? 1.25 : 3,
          pt: 2,
          pb: 3,
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(248,250,252,0.96) 100%)",
        }}
      >
        <Button
          fullWidth
          type="button"
          onClick={logout}
          sx={{
            minWidth: 0,
            px: navCollapsed && !navHover ? 0 : 1.4,
            py: 1.25,
            justifyContent: "center",
            borderRadius: 1.8,
            color: "#991B1B",
            bgcolor: "rgba(255,255,255,0.94)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(254,242,242,0.96) 54%, rgba(255,228,230,0.92) 100%)",
            border: "1px solid rgba(248,113,113,0.26)",
            boxShadow: "0 14px 30px rgba(153,27,27,0.12), inset 0 1px 0 rgba(255,255,255,0.92)",
            textTransform: "none",
            fontWeight: 900,
            "&:hover": {
              background:
                "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(254,226,226,0.98) 54%, rgba(254,205,211,0.94) 100%)",
              boxShadow: "0 18px 38px rgba(153,27,27,0.16), inset 0 1px 0 rgba(255,255,255,0.96)",
            },
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.2,
              display: "grid",
              placeItems: "center",
              mr: navCollapsed && !navHover ? 0 : 1,
              color: "#DC2626",
              bgcolor: "rgba(254,226,226,0.85)",
              border: "1px solid rgba(248,113,113,0.28)",
            }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 19 }} />
          </Box>
          {navCollapsed && !navHover ? null : "Çıkış yap"}
        </Button>
      </Box>
    </Drawer>
  );
};

export default Navigation;
