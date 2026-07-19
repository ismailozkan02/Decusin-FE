import { Box, Typography } from "@mui/material";
import { dummyPrivacyPolicy } from "../../../dummyData";

const PrivacyPolicy = () => (
  <Box
    sx={{
      minHeight: "100vh",
      bgcolor: (theme) => theme.palette.background.default,
      backgroundImage: "url(/images/placeholder.svg)",
      backgroundPosition: "center",
      backgroundSize: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 3,
    }}
  >
    <Box
      sx={{
        bgcolor: (theme) => theme.palette.background.paper,
        width: "100%",
        maxWidth: 1000,
        p: { xs: 4, sm: 8 },
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Typography variant="h3" sx={{ mb: 4 }}>
        {dummyPrivacyPolicy.title}
      </Typography>
      {dummyPrivacyPolicy.body.map((paragraph) => (
        <Typography key={paragraph} sx={{ mb: 2 }} color="text.secondary">
          {paragraph}
        </Typography>
      ))}
    </Box>
  </Box>
);

export default PrivacyPolicy;
