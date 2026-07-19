import { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import PerfectScrollbarComponent from "react-perfect-scrollbar";
import { Link as RouterLink } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Badge,
  Box,
  Button,
  IconButton,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  Typography,
  useMediaQuery,
} from "@mui/material";
import BellOutline from "mdi-material-ui/BellOutline";
import CustomChip from "components/Chip";
import CustomAvatar from "components/Avatar";
import useSettings from "hooks/useSettings";
import { DASHBOARD } from "routes/paths";

const styles = {
  maxHeight: 349,
  "& .MuiMenuItem-root:last-of-type": {
    border: 0,
  },
};

const PerfectScrollbar = styled(PerfectScrollbarComponent)(styles);

const Avatar = styled(CustomAvatar)({
  width: "2.375rem",
  height: "2.375rem",
  fontSize: "1.125rem",
});

const Menu = styled(MuiMenu)(({ theme }) => ({
  "& .MuiMenu-paper": {
    width: 380,
    overflow: "hidden",
    marginTop: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  "& .MuiMenu-list": {
    padding: 0,
  },
}));

const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const MenuItemTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  flex: "1 1 100%",
  overflow: "hidden",
  fontSize: "0.875rem",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  marginBottom: theme.spacing(0.75),
}));

const MenuItemSubtitle = styled(Typography)({
  flex: "1 1 100%",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

const NotificationDropdown = () => {
  const { dispatch, unread } = useSettings();
  const hidden = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDropdownOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const ScrollWrapper = ({ children }) => {
    if (hidden) {
      return (
        <Box sx={{ ...styles, overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </Box>
      );
    } else {
      return (
        <PerfectScrollbar
          options={{ wheelPropagation: false, suppressScrollX: true }}
        >
          {children}
        </PerfectScrollbar>
      );
    }
  };

  const ShowIcon = () => {
    const icon = <BellOutline />;

    if (unread?.notification) {
      return (
        <Badge badgeContent={unread.notification} color={"error"}>
          {icon}
        </Badge>
      );
    }

    return icon;
  };

  return (
    <Fragment>
      <IconButton
        color={"inherit"}
        aria-haspopup={"true"}
        onClick={handleDropdownOpen}
      >
        <ShowIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disableRipple>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>
              <FormattedMessage
                id={"label.notifications"}
                defaultMessage={"Notifications"}
              />
            </Typography>
            <CustomChip
              skin={"light"}
              size={"small"}
              label="8 New"
              color={"primary"}
              sx={{
                height: 20,
                fontSize: "0.75rem",
                fontWeight: 500,
                borderRadius: "10px",
              }}
            />
          </Box>
        </MenuItem>
        <ScrollWrapper>
          <MenuItem onClick={handleDropdownClose}>
            <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
              <Avatar alt="Flora" src="/images/avatars/4.png" />
              <Box
                sx={{
                  mx: 4,
                  flex: "1 1",
                  display: "flex",
                  overflow: "hidden",
                  flexDirection: "column",
                }}
              >
                <MenuItemTitle>Congratulation Flora! 🎉</MenuItemTitle>
                <MenuItemSubtitle variant="body2">
                  Won the monthly best seller badge
                </MenuItemSubtitle>
              </Box>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                Today
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleDropdownClose}>
            <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
              <Avatar skin="light">VU</Avatar>
              <Box
                sx={{
                  mx: 4,
                  flex: "1 1",
                  display: "flex",
                  overflow: "hidden",
                  flexDirection: "column",
                }}
              >
                <MenuItemTitle>New user registered.</MenuItemTitle>
                <MenuItemSubtitle variant="body2">5 hours ago</MenuItemSubtitle>
              </Box>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                Yesterday
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleDropdownClose}>
            <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
              <Avatar alt="message" src="/images/avatars/5.png" />
              <Box
                sx={{
                  mx: 4,
                  flex: "1 1",
                  display: "flex",
                  overflow: "hidden",
                  flexDirection: "column",
                }}
              >
                <MenuItemTitle>New message received 👋🏻</MenuItemTitle>
                <MenuItemSubtitle variant="body2">
                  You have 10 unread messages
                </MenuItemSubtitle>
              </Box>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                11 Aug
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleDropdownClose}>
            <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
              <Avatar alt="order" src="/images/avatars/3.png" />
              <Box
                sx={{
                  mx: 4,
                  flex: "1 1",
                  display: "flex",
                  overflow: "hidden",
                  flexDirection: "column",
                }}
              >
                <MenuItemTitle>Revised Order 📦</MenuItemTitle>
                <MenuItemSubtitle variant="body2">
                  New order revised from john
                </MenuItemSubtitle>
              </Box>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                19 Mar
              </Typography>
            </Box>
          </MenuItem>
        </ScrollWrapper>
        <MenuItem
          disableRipple
          sx={{
            py: 3.5,
            borderBottom: 0,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            fullWidth
            component={RouterLink}
            to={DASHBOARD.my.notifications}
            variant={"contained"}
            onClick={handleDropdownClose}
          >
            <FormattedMessage
              id={"button.view_all"}
              defaultMessage={"View All"}
            />
          </Button>
        </MenuItem>
      </Menu>
    </Fragment>
  );
};

export default NotificationDropdown;
