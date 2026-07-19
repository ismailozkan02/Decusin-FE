import { Box, CircularProgress } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <img
        src={`${process.env.PUBLIC_URL}/favs/favicon.png`}
        width={300}
        alt={""}
      />
      <CircularProgress disableShrink sx={{ mt: 6 }} />
    </Box>
  );
};

export default LoadingScreen;
