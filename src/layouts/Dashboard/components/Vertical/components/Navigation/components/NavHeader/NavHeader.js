import { Link as RouterLink } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Box, IconButton, Typography } from "@mui/material";
import Close from "mdi-material-ui/Close";
import CircleOutline from "mdi-material-ui/CircleOutline";
import RecordCircleOutline from "mdi-material-ui/RecordCircleOutline";
import useSettings from "hooks/useSettings";
import useTheming from "hooks/useTheming";
import useAuth from "hooks/useAuth";
import { baseURL } from "hooks/useLocale";
import { useState } from "react";
import { useEffect } from "react";

const MenuHeaderWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingRight: theme.spacing(4.5),
  transition: "padding .25s ease-in-out",
  minHeight: theme.mixins.toolbar.minHeight,
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  lineHeight: "normal",
  textTransform: "uppercase",
  color: theme.palette.text.primary,
  transition: "opacity .25s ease-in-out, margin .25s ease-in-out",
}));

const StyledLink = styled(RouterLink)({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
});

const NavHeader = ({
  hidden,
  navHover,
  collapsedNavWidth,
  toggleNavVisibility,
  navigationBorderWidth,
}) => {
  const { me } = useAuth();
  const { navCollapsed, onChange } = useTheming();
  const {
    system: { logo, title },
  } = useSettings();
  const menuCollapsedStyles =
    navCollapsed && !navHover ? { opacity: 0 } : { opacity: 1 };

  const menuHeaderPaddingLeft = () => {
    if (navCollapsed && !navHover) {
      return (collapsedNavWidth - navigationBorderWidth - 45) / 8;
    } else {
      return 6;
    }
  };

  const [organization, setorganization] = useState({ name: "", logo: "" });

  useEffect(() => {
    if (me?.organization?.id) {
      setorganization({
        name: me.organization.name,
        logo: me.organization.details.logo,
      });
      console.log(
        `${baseURL}${organization.logo ? "/files/" + organization.logo : "/favs/favicon.png"}`,
      );
    }
  }, [me?.organization]);

  const MenuLockedIcon = () => (
    <RecordCircleOutline
      sx={{
        fontSize: "1.25rem",
        pointerEvents: "none",
        ...menuCollapsedStyles,
        transition: "opacity .25s ease-in-out",
      }}
    />
  );

  const MenuUnlockedIcon = () => (
    <CircleOutline
      sx={{
        fontSize: "1.25rem",
        pointerEvents: "none",
        ...menuCollapsedStyles,
        transition: "opacity .25s ease-in-out",
      }}
    />
  );

  return (
    <MenuHeaderWrapper
      className={"nav-header"}
      sx={{ pl: menuHeaderPaddingLeft() }}
    >
      <StyledLink to={"/"}>
        <Box
          component={"img"}
          src={"/favs/favicon.png"}
          alt={organization?.name || title}
          sx={{
            // ...(navCollapsed &&
            //   !navHover && {
            //     width: 75,
            //   }),
            mt: 5,
            transition: "height .2s",
            transformOrigin: "center left",
            height: navCollapsed && !navHover ? 80 : 80,
            borderRadius: "4px",
          }}
        />
      </StyledLink>
      {hidden ? (
        <IconButton
          disableRipple
          disableFocusRipple
          onClick={toggleNavVisibility}
          sx={{ padding: 0, backgroundColor: "transparent !important" }}
        >
          <Close fontSize={"small"} />
        </IconButton>
      ) : (
        ""
      )}
    </MenuHeaderWrapper>
  );
};

export default NavHeader;
