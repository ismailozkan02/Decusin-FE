import { useEffect, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useScrollTrigger,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import MuiToolbar from "@mui/material/Toolbar";
import MenuIcon from "mdi-material-ui/Menu";
import useTheming from "hooks/useTheming";
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
  const [quoteTab, setQuoteTab] = useState(0);
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

  const updateQuoteFee = (field, value) => {
    window.dispatchEvent(
      new CustomEvent("decusin:update-quote-fees", {
        detail: { [field]: Math.max(Number(value) || 0, 0) },
      }),
    );
  };

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
            justifyContent: "flex-start",
            position: "relative",
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
          </Box>
            <Box
              onClick={() => setQuoteOpen(true)}
              sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                px: 2.4,
                py: 0.85,
                borderRadius: 1,
                minWidth: 184,
                cursor: "pointer",
                textAlign: "center",
                overflow: "hidden",
                border: "1px solid rgba(37,99,235,0.2)",
                background:
                  "linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 42%, #EAF2FF 100%)",
                boxShadow:
                  "0 12px 30px rgba(37,99,235,0.14), inset 0 1px 0 rgba(255,255,255,0.96)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: "0 auto 0 0",
                  width: 4,
                  bgcolor: "#2563EB",
                },
                "&:hover": {
                  transform: "translate(-50%, -50%) translateY(-1px)",
                  boxShadow:
                    "0 16px 38px rgba(37,99,235,0.18), inset 0 1px 0 rgba(255,255,255,0.98)",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 900,
                  color: "#2563EB",
                  lineHeight: 1,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                }}
              >
                Toplam Fiyat
              </Typography>
              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 18,
                  fontWeight: 950,
                  color: "#0F172A",
                  lineHeight: 1.15,
                }}
              >
                {money(quoteTotal)}
              </Typography>
            </Box>
            <Dialog
              open={quoteOpen}
              onClose={() => setQuoteOpen(false)}
              fullWidth
              maxWidth="md"
              PaperProps={{
                sx: {
                  width: 920,
                  maxWidth: "calc(100vw - 32px)",
                  borderRadius: 0.5,
                  overflow: "hidden",
                  border: "1px solid rgba(203,213,225,0.7)",
                  boxShadow: "0 32px 90px rgba(15,23,42,0.24)",
                  bgcolor: "#FFFFFF",
                },
              }}
              BackdropProps={{
                sx: {
                  backdropFilter: "blur(4px)",
                  bgcolor: "rgba(15,23,42,0.5)",
                },
              }}
            >
              <DialogTitle
                sx={{
                  display: "none",
                }}
              >
                <Box sx={{ px: 3, py: 2.4 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 950, color: "#2563EB", letterSpacing: 1, textTransform: "uppercase" }}>
                    TEKLİF ÖZETİ
                  </Typography>
                  <Typography sx={{ mt: 0.6, fontSize: 24, fontWeight: 950, color: "#0F172A", lineHeight: 1.1 }}>
                    Toplam Fiyat Detayı
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent
                sx={{
                  p: 0,
                  bgcolor: "#FFFFFF",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0.75,
                    bgcolor: "#FFFFFF",
                    fontWeight: 760,
                    boxShadow: "0 1px 0 rgba(15,23,42,0.04)",
                    transition: "border-color 160ms ease, box-shadow 160ms ease",
                    "& fieldset": {
                      borderColor: "rgba(148,163,184,0.48)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(37,99,235,0.44)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgba(37,99,235,0.72)",
                    },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: 14,
                    color: "#0F172A",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#94A3B8",
                    opacity: 1,
                  },
                  "& .MuiInputLabel-root": { fontWeight: 760, color: "#64748B" },
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
                    minHeight: 560,
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      borderRight: { xs: "none", md: "1px solid rgba(226,232,240,0.86)" },
                      borderBottom: { xs: "1px solid rgba(226,232,240,0.86)", md: "none" },
                      background:
                        "linear-gradient(160deg, #FFFFFF 0%, #F9FBFF 48%, #EDF6FF 100%)",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 11, fontWeight: 950, color: "#2563EB", letterSpacing: 1.1, textTransform: "uppercase" }}>
                        Teklif Merkezi
                      </Typography>
                      <Typography sx={{ mt: 0.8, fontSize: 26, fontWeight: 950, color: "#0F172A", lineHeight: 1.04 }}>
                        Fiyat ve Operasyon
                      </Typography>
                      <Typography sx={{ mt: 1.1, fontSize: 12.5, fontWeight: 720, color: "#64748B", lineHeight: 1.5 }}>
                        Ürün, montaj ve nakliye kalemlerini tek teklif ekranında yönetin.
                      </Typography>
                    </Box>

                    <Stack spacing={1.2} sx={{ mt: 3 }}>
                      <Box
                        sx={{
                          p: 1.6,
                          borderRadius: 1,
                          bgcolor: "rgba(255,255,255,0.86)",
                          border: "1px solid rgba(203,213,225,0.72)",
                          boxShadow: "0 10px 22px rgba(15,23,42,0.045)",
                        }}
                      >
                        <Typography sx={{ fontSize: 10, fontWeight: 950, color: "#0F766E", letterSpacing: 0.9, textTransform: "uppercase" }}>
                          Ara Toplam
                        </Typography>
                        <Typography sx={{ mt: 0.35, fontSize: 22, fontWeight: 950, color: "#0F172A" }}>
                          {money(quote?.subtotal)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.8,
                          borderRadius: 1,
                          background: "linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 45%, #E7F0FF 100%)",
                          border: "1px solid rgba(37,99,235,0.22)",
                          boxShadow: "0 12px 28px rgba(37,99,235,0.1)",
                        }}
                      >
                        <Typography sx={{ fontSize: 11, fontWeight: 950, color: "#2563EB", letterSpacing: 1, textTransform: "uppercase" }}>
                          Genel Toplam
                        </Typography>
                        <Typography sx={{ mt: 0.35, fontSize: 30, fontWeight: 950, color: "#1D4ED8", lineHeight: 1 }}>
                          {money(quoteTotal)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      p: 3,
                      bgcolor: "#F8FAFC",
                      background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)",
                    }}
                  >
                <Tabs
                  value={quoteTab}
                  onChange={(_, value) => setQuoteTab(value)}
                  variant="fullWidth"
                  sx={{
                    mb: 2.2,
                    minHeight: 40,
                    p: 0.3,
                    borderRadius: 0.75,
                    bgcolor: "rgba(255,255,255,0.96)",
                    border: "1px solid rgba(203,213,225,0.82)",
                    boxShadow: "0 8px 18px rgba(15,23,42,0.045)",
                    "& .MuiTab-root": {
                      minHeight: 33,
                      borderRadius: 0.5,
                      textTransform: "none",
                      fontWeight: 880,
                      fontSize: 13,
                      color: "#64748B",
                      letterSpacing: 0,
                    },
                    "& .Mui-selected": {
                      color: "#0F172A !important",
                      bgcolor: "#F1F6FF",
                      boxShadow: "inset 0 0 0 1px rgba(37,99,235,0.1)",
                    },
                    "& .MuiTabs-indicator": { display: "none" },
                  }}
                >
                  <Tab label="Ürünler" />
                  <Tab label="Montaj" />
                  <Tab label="Nakliye" />
                </Tabs>

                {quoteTab === 0 && (
                  <Stack spacing={1.15}>
                    {(quote?.lines || []).length ? (
                      quote.lines.map((line, index) => (
                        <Stack
                          key={`${line.catalog_item_id}-${index}`}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={2}
                          sx={{
                            p: 1.55,
                            borderRadius: 1,
                            border: "1px solid rgba(226,232,240,0.95)",
                            bgcolor: "#FFFFFF",
                            boxShadow: "0 8px 20px rgba(15,23,42,0.045)",
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 950, color: "#0F172A" }}>{line.name}</Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 800 }}>
                              {line.quantity} adet - opsiyon {money(line.modifiers_total)}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 950, color: "#0F172A" }}>{money(line.line_total)}</Typography>
                        </Stack>
                      ))
                    ) : (
                      <Box
                        sx={{
                          p: 2.2,
                          borderRadius: 1,
                          border: "1px dashed rgba(148,163,184,0.65)",
                          bgcolor: "rgba(255,255,255,0.82)",
                          color: "#64748B",
                          fontWeight: 850,
                        }}
                      >
                        Sahnede henüz ürün yok.
                      </Box>
                    )}
                  </Stack>
                )}

                {quoteTab === 1 && (
                  <Stack spacing={1.4}>
                    <TextField
                      fullWidth
                      label="Montaj Ücreti"
                      type="number"
                      size="small"
                      value={Number(quote?.installation || 0)}
                      onChange={(event) => updateQuoteFee("installation_fee", event.target.value)}
                    />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <TextField fullWidth label="Montaj Tarihi" type="date" size="small" InputLabelProps={{ shrink: true }} />
                      <TextField fullWidth label="Montaj Ekibi / Sorumlu" size="small" />
                    </Stack>
                    <TextField fullWidth label="Montaj Notu" multiline minRows={3} size="small" placeholder="Ölçü, elektrik/su hazırlığı, özel montaj talepleri..." />
                  </Stack>
                )}

                {quoteTab === 2 && (
                  <Stack spacing={1.4}>
                    <TextField
                      fullWidth
                      label="Nakliye Ücreti"
                      type="number"
                      size="small"
                      value={Number(quote?.shipping || 0)}
                      onChange={(event) => updateQuoteFee("shipping_fee", event.target.value)}
                    />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <TextField fullWidth label="Teslim Alacak Kişi" size="small" />
                      <TextField fullWidth label="Teslim Tarihi" type="date" size="small" InputLabelProps={{ shrink: true }} />
                    </Stack>
                    <TextField fullWidth label="Teslimat Adresi" multiline minRows={2} size="small" />
                    <TextField fullWidth label="Nakliye Notu" multiline minRows={2} size="small" placeholder="Kat bilgisi, asansör, park durumu, teslimat saati..." />
                  </Stack>
                )}

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    display: "none",
                    mt: 2,
                    px: 2,
                    py: 1.35,
                    borderRadius: 2.2,
                    color: "#0F172A",
                    border: "1px solid rgba(20,184,166,0.2)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,253,250,0.96) 46%, rgba(219,234,254,0.82) 100%)",
                    boxShadow: "0 14px 30px rgba(20,184,166,0.1), inset 0 1px 0 rgba(255,255,255,0.92)",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 10, fontWeight: 950, color: "#0F766E", letterSpacing: 0.8, textTransform: "uppercase" }}>
                      Ara Toplam
                    </Typography>
                    <Typography sx={{ mt: 0.15, fontSize: 12, fontWeight: 800, color: "#64748B" }}>
                      Ürünler ve opsiyonlar
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 20, fontWeight: 950, color: "#0F172A" }}>{money(quote?.subtotal)}</Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    display: "none",
                    mt: 1.2,
                    p: 2,
                    borderRadius: 2.4,
                    color: "#0F172A",
                    border: "1px solid rgba(37,99,235,0.22)",
                    background: "linear-gradient(135deg, #FFFFFF 0%, #EEF6FF 42%, #E0F2FE 72%, #DBEAFE 100%)",
                    boxShadow: "0 16px 34px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,0.96)",
                  }}
                >
                  <Typography sx={{ fontSize: 18, fontWeight: 950, color: "#0F172A" }}>Toplam</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 950, color: "#2563EB" }}>{money(quoteTotal)}</Typography>
                </Stack>
                  </Box>
                </Box>

                <Stack spacing={1.4} sx={{ display: "none" }}>
                  {(quote?.lines || []).length ? (
                    quote.lines.map((line, index) => (
                      <Stack
                        key={`${line.catalog_item_id}-${index}`}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid rgba(226,232,240,0.95)",
                          bgcolor: "#FFFFFF",
                          boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 900, color: "#0F172A" }}>{line.name}</Typography>
                          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                            {line.quantity} adet - opsiyon {money(line.modifiers_total)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 950, color: "#0F172A" }}>{money(line.line_total)}</Typography>
                      </Stack>
                    ))
                  ) : (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px dashed rgba(148,163,184,0.65)",
                        bgcolor: "rgba(255,255,255,0.72)",
                        color: "#64748B",
                        fontWeight: 800,
                      }}
                    >
                      Sahnede henüz ürün yok.
                    </Box>
                  )}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      px: 2,
                      py: 1.35,
                      borderRadius: 2.2,
                      color: "#0F172A",
                      border: "1px solid rgba(20,184,166,0.2)",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,253,250,0.96) 46%, rgba(219,234,254,0.82) 100%)",
                      boxShadow:
                        "0 14px 30px rgba(20,184,166,0.1), inset 0 1px 0 rgba(255,255,255,0.92)",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 10, fontWeight: 950, color: "#0F766E", letterSpacing: 0.8, textTransform: "uppercase" }}>
                        Ara Toplam
                      </Typography>
                      <Typography sx={{ mt: 0.15, fontSize: 12, fontWeight: 800, color: "#64748B" }}>
                        Ürünler ve opsiyonlar
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 950, color: "#0F172A" }}>{money(quote?.subtotal)}</Typography>
                  </Stack>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <TextField
                      fullWidth
                      label="Montaj"
                      type="number"
                      size="small"
                      value={Number(quote?.installation || 0)}
                      onChange={(event) => updateQuoteFee("installation_fee", event.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          bgcolor: "#FFFFFF",
                          fontWeight: 900,
                        },
                        "& .MuiInputLabel-root": { fontWeight: 800 },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Nakliye"
                      type="number"
                      size="small"
                      value={Number(quote?.shipping || 0)}
                      onChange={(event) => updateQuoteFee("shipping_fee", event.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          bgcolor: "#FFFFFF",
                          fontWeight: 900,
                        },
                        "& .MuiInputLabel-root": { fontWeight: 800 },
                      }}
                    />
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      mt: 0.4,
                      p: 2,
                      borderRadius: 2.4,
                      color: "#0F172A",
                      border: "1px solid rgba(37,99,235,0.22)",
                      background:
                        "linear-gradient(135deg, #FFFFFF 0%, #EEF6FF 42%, #E0F2FE 72%, #DBEAFE 100%)",
                      boxShadow:
                        "0 16px 34px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,0.96)",
                    }}
                  >
                    <Typography sx={{ fontSize: 18, fontWeight: 950, color: "#0F172A" }}>
                      Toplam
                    </Typography>
                    <Typography sx={{ fontSize: 24, fontWeight: 950, color: "#2563EB" }}>
                      {money(quoteTotal)}
                    </Typography>
                  </Stack>
                </Stack>
              </DialogContent>
            </Dialog>
          </Box>
      </ToolbarWrapper>
    </AppBarWrapper>
  );
};

export default AppBar;
