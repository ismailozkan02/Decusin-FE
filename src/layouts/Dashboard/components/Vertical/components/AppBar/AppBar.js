import { useEffect, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  useScrollTrigger,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import MuiToolbar from "@mui/material/Toolbar";
import MenuIcon from "mdi-material-ui/Menu";
import useTheming from "hooks/useTheming";
import UserDropdown from "layouts/Dashboard/components/UserDropdown";
import hexToRGBA from "utils/hexToRgba";

const money = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const AppBarWrapper = styled(MuiAppBar)(({ theme }) => ({
  transition: "none",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0, 6),
  backgroundColor: "transparent",
  color: theme.palette.text.primary,
  minHeight: theme.mixins.toolbar.minHeight,
  [theme.breakpoints.down("sm")]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

const ToolbarWrapper = styled(MuiToolbar)(({ theme }) => ({
  width: "100%",
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  padding: `${theme.spacing(0)} !important`,
  minHeight: `${theme.mixins.toolbar.minHeight}px !important`,
  transition:
    "padding .25s ease-in-out, box-shadow .25s ease-in-out, backdrop-filter .25s ease-in-out, background-color .25s ease-in-out",
}));

const AppBar = ({ hidden, toggleNavVisibility }) => {
  const theme = useTheme();
  const { skin, contentWidth } = useTheming();
  const [quoteTotal, setQuoteTotal] = useState(() =>
    Number(window.localStorage.getItem("decusinQuoteTotal") || 0),
  );
  const [quote, setQuote] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("decusinQuote") || "{}");
    } catch {
      return {};
    }
  });
  const [quoteOpen, setQuoteOpen] = useState(false);
  const scrollTrigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true,
  });

  useEffect(() => {
    const updateQuoteTotal = (event) => {
      setQuoteTotal(Number(event.detail?.total || 0));
      setQuote(event.detail?.quote || {});
    };

    window.addEventListener("decusin:quote-total", updateQuoteTotal);
    return () => window.removeEventListener("decusin:quote-total", updateQuoteTotal);
  }, []);

  const appBarFixedStyles = () => {
    return {
      paddingLeft: `${theme.spacing(5)} !important`,
      paddingRight: `${theme.spacing(5)} !important`,
      backdropFilter: "blur(8px)",
      boxShadow: theme.shadows[skin === "bordered" ? 0 : 3],
      backgroundColor: hexToRGBA(theme.palette.background.paper, 0.85),
      ...(skin === "bordered" && {
        border: `1px solid ${theme.palette.divider}`,
        borderTopWidth: 0,
      }),
    };
  };

  return (
    <AppBarWrapper
      elevation={0}
      color={"default"}
      className={"layout-navbar"}
      position={"sticky"}
    >
      <ToolbarWrapper
        className={"navbar-content-container"}
        sx={{
          ...(scrollTrigger && { ...appBarFixedStyles() }),
          ...(contentWidth === "boxed" && {
            "@media (min-width:1440px)": {
              maxWidth: `calc(1440px - ${theme.spacing(6)} * 2)`,
            },
          }),
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            className={"actions-left"}
            sx={{ mr: 2, display: "flex", alignItems: "center" }}
          >
            {hidden ? (
              <IconButton
                color="inherit"
                sx={{ ml: -2.75 }}
                onClick={toggleNavVisibility}
              >
                <MenuIcon />
              </IconButton>
            ) : null}
            <Box
              onClick={() => setQuoteOpen(true)}
              sx={{
                px: 1.5,
                py: 0.7,
                borderRadius: 1,
                bgcolor: "#E8F3FF",
                border: "1px solid #B9D9FF",
                minWidth: 140,
                cursor: "pointer",
                "&:hover": { bgcolor: "#DCEEFF" },
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#2563EB", lineHeight: 1 }}>
                Toplam Fiyat
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#0F172A", lineHeight: 1.35 }}>
                {money(quoteTotal)}
              </Typography>
            </Box>
            <Dialog open={quoteOpen} onClose={() => setQuoteOpen(false)} fullWidth maxWidth="sm">
              <DialogTitle sx={{ fontWeight: 900 }}>Toplam Fiyat Detayi</DialogTitle>
              <DialogContent dividers>
                <Stack spacing={1.4}>
                  {(quote?.lines || []).length ? (
                    quote.lines.map((line, index) => (
                      <Stack
                        key={`${line.catalog_item_id}-${index}`}
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 800 }}>{line.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {line.quantity} adet - opsiyon {money(line.modifiers_total)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 900 }}>{money(line.line_total)}</Typography>
                      </Stack>
                    ))
                  ) : (
                    <Typography color="text.secondary">Sahnede henuz urun yok.</Typography>
                  )}
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Ara toplam</Typography>
                    <Typography sx={{ fontWeight: 800 }}>{money(quote?.subtotal)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Montaj</Typography>
                    <Typography sx={{ fontWeight: 800 }}>{money(quote?.installation)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      Toplam
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {money(quoteTotal)}
                    </Typography>
                  </Stack>
                </Stack>
              </DialogContent>
            </Dialog>
          </Box>
          <Box
            className={"actions-right"}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <UserDropdown />
          </Box>
        </Box>
      </ToolbarWrapper>
    </AppBarWrapper>
  );
};

export default AppBar;
