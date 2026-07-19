import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { styled } from "@mui/material/styles";
import { Avatar, Badge, Box, Divider, Menu, MenuItem, Typography } from "@mui/material";
import CalendarBlankOutline from "mdi-material-ui/CalendarBlankOutline";
import CogOutline from "mdi-material-ui/CogOutline";
import EmailOutline from "mdi-material-ui/EmailOutline";
import LogoutVariant from "mdi-material-ui/LogoutVariant";
import AccountOutline from "mdi-material-ui/AccountOutline";
import MessageOutline from "mdi-material-ui/MessageOutline";
import HelpCircleOutline from "mdi-material-ui/HelpCircleOutline";
import useAuth from "hooks/useAuth";
import { CDN, DASHBOARD } from "routes/paths";
import getInitials from "utils/getInitials";
import hexToRGBA from "utils/hexToRgba";
import useLocale, { baseURL } from "hooks/useLocale";

const BadgeContentSpan = styled("span")(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: theme?.palette.success.main,
  boxShadow: `0 0 0 2px ${theme?.palette.background.paper}`,
}));

const UserDropdown = () => {
  const { formatMessage } = useLocale();

  const { me, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDropdownOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleDropdownClose = (url) => {
    if (url) {
      navigate(url, { replace: true });
    }

    setAnchorEl(null);
  };

  const styles = {
    py: 2,
    px: 4,
    width: "100%",
    display: "flex",
    alignItems: "center",
    color: "text.primary",
    textDecoration: "none",
    "& svg": {
      fontSize: "1.375rem",
      color: "text.secondary",
    },
  };

  const handleLogout = () => {
    logout();
    handleDropdownClose();
  };

  const DropdownUser = () => {
    return me ? (
      <Avatar
        src={me.avatar && CDN.avatar(me.avatar)}
        alt={me.display_name || ""}
        sx={{
          width: 40,
          height: 40,
          color: (theme) => theme.palette.grey[500],
        }}
        onClick={handleDropdownOpen}
      >
        {!me.avatar && getInitials(me?.display_name || "U S")}
      </Avatar>
    ) : (
      <Avatar
        src=""
        alt={me?.display_name || ""}
        sx={{
          width: 40,
          height: 40,
          bgcolor: (theme) => hexToRGBA(theme.palette.primary.lighter, 0.5),
        }}
        onClick={handleDropdownOpen}
      ></Avatar>
    );
  };

  return (
    <Fragment>
      <Badge
        overlap={"circular"}
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: "pointer" }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <DropdownUser />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ "& .MuiMenu-paper": { width: 230, marginTop: 4 } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Badge
              overlap={"circular"}
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              <DropdownUser />
            </Badge>
            <Box
              sx={{
                display: "flex",
                marginLeft: 3,
                alignItems: "flex-start",
                flexDirection: "column",
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>{me?.display_name || ""}</Typography>
              <Typography variant={"body2"} sx={{ fontSize: "0.8rem", color: "text.disabled" }}>
                {/* {ROLES.find((role) => role.id === me?.role)?.label || "guest"} */}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: 0, mb: 1 }} />
        {me ? (
          <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose("/profile")}>
            <Box sx={styles}>
              <AccountOutline sx={{ marginRight: 2 }} />
              <FormattedMessage id={"nav.profile"} defaultMessage={"Profile"} />
            </Box>
          </MenuItem>
        ) : (
          <MenuItem sx={{ py: 2 }} onClick={() => handleDropdownClose("/auth/login")}>
            <LogoutVariant
              sx={{
                marginRight: 2,
                fontSize: "1.375rem",
                color: "text.secondary",
              }}
            />
            <FormattedMessage id={"nav.login"} defaultMessage={formatMessage("label.Login", "Login")} />
          </MenuItem>
        )}

        <Divider sx={{ mt: 0, mb: 1 }} />

        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose("/appointment")}>
          <Box sx={styles}>
            <CalendarBlankOutline sx={{ marginRight: 2 }} />
            <FormattedMessage id={"nav.calendar"} defaultMessage={formatMessage("label.Appointmant", "Appointmant")} />
          </Box>
        </MenuItem>

        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose(DASHBOARD.email.inbox)}>
          <Box sx={styles}>
            <EmailOutline sx={{ marginRight: 2 }} />
            <FormattedMessage id={"nav.inbox"} defaultMessage={formatMessage("label.Inbox", "Inbox")} />
          </Box>
        </MenuItem>

        <Divider />
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose("/profile")}>
          <Box sx={styles}>
            <CogOutline sx={{ marginRight: 2 }} />
            <FormattedMessage id={"nav.settings"} defaultMessage={formatMessage("label.Settings", "Settings")} />
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose("/faq")}>
          <Box sx={styles}>
            <HelpCircleOutline sx={{ marginRight: 2 }} />
            <FormattedMessage id={"nav.faq"} defaultMessage={formatMessage("label.FAQ", "FAQ")} />
          </Box>
        </MenuItem>
        {me && (
          <div>
            <Divider />
            <MenuItem sx={{ py: 2 }} onClick={handleLogout}>
              <LogoutVariant
                sx={{
                  marginRight: 2,
                  fontSize: "1.375rem",
                  color: "text.secondary",
                }}
              />
              <FormattedMessage id={"nav.logout"} defaultMessage={formatMessage("label.Logout", "Logout")} />
            </MenuItem>
          </div>
        )}
      </Menu>
    </Fragment>
  );
};

export default UserDropdown;
