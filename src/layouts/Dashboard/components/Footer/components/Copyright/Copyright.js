import { Box, Typography } from "@mui/material";

const Copyright = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "100%",
    }}
  >
    <Typography sx={{ mr: 2 }}>
      © 2026, Made with{" "}
      <Box component="span" sx={{ color: "error.main" }}>
        ❤️
      </Box>{" "}
      by Fatih ÖZKAN
    </Typography>
  </Box>
);

export default Copyright;
