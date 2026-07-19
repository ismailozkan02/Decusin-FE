import Box from "@mui/material/Box";
import { THEME } from "config";
import nav from "routes/nav";
import useAuth from "hooks/useAuth";
import useLocale from "hooks/useLocale";
import { NavItems } from "./components";

const Navigation = () => {
  const { me } = useAuth();
  const { formatMessage } = useLocale();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: 1,
      }}
    >
      <Box
        flex={1}
        className={"menu-content"}
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          "& > *": {
            "&:not(:last-child)": { mr: 2 },
            ...(THEME.MENU_TEXT_TRUNCATE && { maxWidth: 220 }),
          },
        }}
      >
        <NavItems items={nav(me, formatMessage)} />
      </Box>{" "}
    </Box>
  );
};

export default Navigation;
