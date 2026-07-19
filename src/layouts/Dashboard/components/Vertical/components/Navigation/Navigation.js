import React, { useRef, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Box, List, Typography } from "@mui/material";
import { APP } from "config";
import useAuth from "hooks/useAuth";
import useLocale from "hooks/useLocale";
import useTheming from "hooks/useTheming";
import nav from "routes/nav";
import hexToRGBA from "utils/hexToRgba";
import { Drawer, NavHeader, NavItems } from "./components";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { Header } from "components/Page/components";

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

const VersionText = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  lineHeight: "normal",
  letterSpacing: "0.21px",
  color: theme.palette.text.disabled,
  fontWeight: theme.typography.fontWeightMedium,
  textAlign: "right",
}));

const Navigation = (props) => {
  const { me } = useAuth();

  const { hidden, navHover } = props;
  const theme = useTheme();
  const { skin, navCollapsed } = useTheming();
  const { formatMessage } = useLocale();
  const shadowRef = useRef(null);
  const [groupActive, setGroupActive] = useState([]);
  const [currentActiveGroup, setCurrentActiveGroup] = useState([]);

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
            minHeight: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
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
            <Box flex={1}></Box>

            <Box
              sx={{
                borderTop: (theme) =>
                  `thin solid rgba(${theme.palette.customColors.main}, .12)`,
                py: 3,
                mt: 5,
                px: 5,
              }}
            >
              <VersionText>v.{APP.VERSION}</VersionText>
            </Box>
          </Box>
        </List>
      </Box>
    </Drawer>
  );
};

export default Navigation;
