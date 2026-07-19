import { Link as RouterLink } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import useSettings from "hooks/useSettings";
import { APP } from "config";
import useAuth from "hooks/useAuth";
import { baseURL } from "hooks/useLocale";
import { useState } from "react";
import { useEffect } from "react";

const StyledLink = styled(RouterLink)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  marginRight: theme.spacing(3),
}));

const VersionText = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  lineHeight: "normal",
  letterSpacing: "0.21px",
  color: theme.palette.text.disabled,
  fontWeight: theme.typography.fontWeightMedium,
}));

const AppBar = () => {
  const {
    system: { logo, title },
  } = useSettings();

  const { me } = useAuth();

  const [organization, setorganization] = useState({ name: "", logo: "" });

  useEffect(() => {
    if (me?.organization?.id) {
      setorganization({
        name: me.organization.name,
        logo: me.organization.details.logo,
      });
      console.log(
        `${baseURL}${organization.logo ? "/files/" + organization.logo : "/favs/favicon.png"}`
      );
    }
  }, [me?.organization]);

  return (
    <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
      <StyledLink to={"/"}>
        <Box
          component={"img"}
          src={
            logo ||
            `${baseURL}${organization.logo ? "/files/" + organization.logo : "/favs/favicon.png"}`
          }
          alt={organization?.name || title}
          sx={{
            height: 45,
          }}
        />
        <Typography
          variant={"h6"}
          sx={{
            ml: 3,
            fontWeight: 600,
            lineHeight: "normal",
            textTransform: "uppercase",
          }}
        >
          {organization?.name || title}
        </Typography>
      </StyledLink>
      <VersionText>v.{APP.VERSION}</VersionText>
    </Box>
  );
};

export default AppBar;
