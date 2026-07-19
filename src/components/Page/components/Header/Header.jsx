import { Fragment } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";

const Header = ({ mainTitle = null, title, actions = [] }) => {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={5}
      sx={{
        alignItems: {
          xs: "center",
          md: "flex-end",
        },
        justifyContent: {
          xs: "center",
          md: "space-between",
        },
        mb: 5,
      }}
    >
      <Helmet>
        <title>
          {mainTitle ? `${mainTitle} - ` : ""}
          {title ? `${title} | ` : ""}Euro Link
        </title>
      </Helmet>

      <Box>
        {mainTitle && <Typography variant={"body2"}>{mainTitle}</Typography>}
        <Typography
          variant={"h5"}
          color={"primary"}
          sx={{ textTransform: "capitalize" }}
        >
          {title}
        </Typography>
      </Box>
      {Array.isArray(actions) && actions.length > 0 && (
        <Box>
          {actions.map((action, index) => (
            <Fragment key={index}>{action}</Fragment>
          ))}
        </Box>
      )}
    </Stack>
  );
};

export default Header;
