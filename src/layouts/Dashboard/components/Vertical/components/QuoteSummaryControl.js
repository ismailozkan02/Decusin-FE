import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DesignServicesRoundedIcon from "@mui/icons-material/DesignServicesRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

const money = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const QuoteSummaryControl = ({ compact = false }) => {
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
  const [loading, setLoading] = useState(
    () => window.localStorage.getItem("decusinQuoteLoading") === "true",
  );
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const productCount = (quote?.lines || []).reduce(
    (sum, line) => sum + Number(line.quantity || 0),
    0,
  );
  const subtotal = Number(quote?.subtotal || 0);
  const installation = Number(quote?.installation || 0);
  const shipping = Number(quote?.shipping || 0);
  const operationsTotal = installation + shipping;

  useEffect(() => {
    const updateQuoteTotal = (event) => {
      setQuoteTotal(Number(event.detail?.total || 0));
      setQuote(event.detail?.quote || {});
      setLoading(false);
      window.localStorage.setItem("decusinQuoteLoading", "false");
    };
    const updateQuoteLoading = (event) => {
      const nextLoading = Boolean(event.detail?.loading);
      setLoading(nextLoading);
      window.localStorage.setItem(
        "decusinQuoteLoading",
        String(nextLoading),
      );
      if (nextLoading) setOpen(false);
    };

    window.addEventListener("decusin:quote-total", updateQuoteTotal);
    window.addEventListener("decusin:quote-loading", updateQuoteLoading);
    return () => {
      window.removeEventListener("decusin:quote-total", updateQuoteTotal);
      window.removeEventListener("decusin:quote-loading", updateQuoteLoading);
    };
  }, []);

  const updateQuoteFee = (field, value) => {
    window.dispatchEvent(
      new CustomEvent("decusin:update-quote-fees", {
        detail: { [field]: Math.max(Number(value) || 0, 0) },
      }),
    );
  };

  return (
    <>
      <Box
        onClick={() => {
          if (!loading) setOpen(true);
        }}
        sx={{
          width: compact ? 42 : "100%",
          maxWidth: compact ? 42 : 214,
          mx: compact ? 0 : "auto",
          minHeight: compact ? 42 : 174,
          px: compact ? 0 : 1.35,
          py: compact ? 0 : 1.35,
          borderRadius: 1,
          cursor: loading ? "wait" : "pointer",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          alignItems: compact ? "center" : "stretch",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(14,165,233,0.24)",
          background:
            "linear-gradient(155deg, #092238 0%, #123D52 52%, #1C5B68 100%)",
          boxShadow:
            "0 18px 38px rgba(2,6,23,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: "0 0 auto 0",
            height: 4,
            background:
              "linear-gradient(90deg, #38BDF8 0%, #F8D36D 48%, #2DD4BF 100%)",
          },
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow:
              "0 22px 44px rgba(2,6,23,0.24), inset 0 1px 0 rgba(255,255,255,0.16)",
          },
        }}
      >
        {loading && !compact ? (
          <Stack alignItems="center" justifyContent="center" spacing={1.1}>
            <CircularProgress size={28} thickness={4.5} />
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 950,
                color: "#FFFFFF",
                letterSpacing: 0.8,
                textTransform: "uppercase",
              }}
            >
              Teklif hazirlaniyor
            </Typography>
          </Stack>
        ) : compact ? (
          <Typography sx={{ fontSize: 18, fontWeight: 950, color: "#2563EB" }}>
            ₺
          </Typography>
        ) : (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 950,
                    color: "#7DD3FC",
                    lineHeight: 1,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  Teklif Ozeti
                </Typography>
                <Typography
                  sx={{
                    mt: 0.55,
                    fontSize: 11.5,
                    fontWeight: 850,
                    color: "rgba(226,242,255,0.72)",
                    lineHeight: 1,
                  }}
                >
                  {productCount} urun
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 0.85,
                  py: 0.45,
                  borderRadius: 0.75,
                  color: "#07111F",
                  bgcolor: "#F8D36D",
                  border: "1px solid rgba(248,211,109,0.28)",
                  fontSize: 11,
                  fontWeight: 950,
                }}
              >
                Detay
              </Box>
            </Stack>

            <Typography
              sx={{
                mt: 1.25,
                fontSize: 24,
                fontWeight: 950,
                color: "#FFFFFF",
                lineHeight: 1.1,
                textAlign: "center",
              }}
            >
              {money(quoteTotal)}
            </Typography>

            <Stack spacing={0.65} sx={{ mt: 1.35 }}>
              {[
                ["Ara Toplam", subtotal],
                ["Montaj", installation],
                ["Nakliye", shipping],
              ].map(([label, value]) => (
                <Stack
                  key={label}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 1,
                    py: 0.65,
                    borderRadius: 0.75,
                    bgcolor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 11, fontWeight: 800, color: "rgba(226,242,255,0.72)" }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 950, color: "#FFFFFF" }}
                  >
                    {money(value)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            width: 1060,
            maxWidth: "calc(100vw - 28px)",
            height: { md: 650 },
            maxHeight: "calc(100vh - 36px)",
            borderRadius: 1,
            overflow: "hidden !important",
            border: "1px solid rgba(191,219,254,0.6)",
            boxShadow:
              "0 38px 110px rgba(2,6,23,0.38), 0 0 0 1px rgba(255,255,255,0.7) inset",
            bgcolor: "#F8FAFC",
          },
        }}
        BackdropProps={{
          sx: {
            backdropFilter: "blur(8px)",
            bgcolor: "rgba(15,23,42,0.58)",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            bgcolor: "#F8FAFC",
            height: "100%",
            overflow: "hidden",
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              bgcolor: "#FFFFFF",
              fontWeight: 760,
              boxShadow: "0 10px 22px rgba(15,23,42,0.045)",
              transition: "border-color 160ms ease, box-shadow 160ms ease",
              "& fieldset": { borderColor: "rgba(148,163,184,0.32)" },
              "&:hover fieldset": { borderColor: "rgba(14,165,233,0.56)" },
              "&.Mui-focused": {
                boxShadow:
                  "0 12px 28px rgba(14,165,233,0.12), 0 0 0 3px rgba(14,165,233,0.1)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(14,165,233,0.72)",
              },
            },
            "& .MuiInputBase-input": {
              fontSize: 14,
              color: "#0F172A",
            },
            "& .MuiInputLabel-root": { fontWeight: 760, color: "#64748B" },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
              height: { xs: "auto", md: 650 },
              minHeight: { xs: "auto", md: 650 },
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: { xs: 2.4, md: 3.2 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
                borderRight: {
                  xs: "none",
                  md: "1px solid rgba(14,165,233,0.14)",
                },
                borderBottom: {
                  xs: "1px solid rgba(14,165,233,0.14)",
                  md: "none",
                },
                background:
                  "radial-gradient(circle at 22% 8%, rgba(14,165,233,0.22), transparent 34%), linear-gradient(155deg, #07111F 0%, #0B1B2D 48%, #123A4A 100%)",
                color: "#FFFFFF",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: "0 0 auto 0",
                  height: 5,
                  background:
                    "linear-gradient(90deg, #38BDF8 0%, #F8D36D 42%, #2DD4BF 100%)",
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 1,
                      display: "grid",
                      placeItems: "center",
                      color: "#07111F",
                      bgcolor: "#F8D36D",
                      boxShadow: "0 10px 24px rgba(248,211,109,0.24)",
                    }}
                  >
                    <ReceiptLongRoundedIcon fontSize="small" />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 950,
                      color: "#7DD3FC",
                      letterSpacing: 1.1,
                      textTransform: "uppercase",
                    }}
                  >
                    Teklif Merkezi
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 2.2,
                    fontSize: { xs: 29, md: 34 },
                    fontWeight: 950,
                    color: "#FFFFFF",
                    lineHeight: 1.02,
                  }}
                >
                  Fiyat ve operasyon kontrolu
                </Typography>
                <Typography
                  sx={{
                    mt: 1.25,
                    fontSize: 13,
                    fontWeight: 760,
                    color: "rgba(226,242,255,0.78)",
                    lineHeight: 1.5,
                    textAlign: "justify",
                    textAlignLast: "left",
                  }}
                >
                  Urun, montaj ve nakliye tek merkezde toplanir. Musteriye
                  net toplam, ekibe hazir operasyon bilgisi sunulur.
                </Typography>

                <Box
                  sx={{
                    mt: "auto",
                    mb: "auto",
                    p: 2.2,
                    borderRadius: 1,
                    background:
                      "linear-gradient(140deg, rgba(255,255,255,0.96) 0%, rgba(236,253,245,0.92) 100%)",
                    color: "#062319",
                    border: "1px solid rgba(255,255,255,0.72)",
                    boxShadow: "0 26px 50px rgba(2,6,23,0.28)",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 950,
                        color: "#0F766E",
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Genel Toplam
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.6}>
                      <VerifiedRoundedIcon
                        sx={{ fontSize: 17, color: "#0F766E" }}
                      />
                      <Typography
                        sx={{ fontSize: 11.5, fontWeight: 950, color: "#0F766E" }}
                      >
                        Hazir
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: { xs: 34, md: 38 },
                      fontWeight: 950,
                      color: "#061623",
                      lineHeight: 1,
                    }}
                  >
                    {money(quoteTotal)}
                  </Typography>
                  <Divider sx={{ my: 1.8, borderColor: "rgba(15,118,110,0.16)" }} />
                  <Stack spacing={1}>
                    {[
                      ["Ara toplam", subtotal],
                      ["Operasyon", operationsTotal],
                    ].map(([label, value]) => (
                      <Stack
                        key={label}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          sx={{ fontSize: 12.5, fontWeight: 820, color: "#475569" }}
                        >
                          {label}
                        </Typography>
                        <Typography
                          sx={{ fontSize: 13.5, fontWeight: 950, color: "#0F172A" }}
                        >
                          {money(value)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Box>

              <Stack
                spacing={1.1}
                sx={{ mt: 3, position: "relative", zIndex: 1 }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.1}>
                    <Inventory2RoundedIcon sx={{ color: "#7DD3FC" }} />
                    <Box>
                      <Typography
                        sx={{ fontSize: 16, fontWeight: 950, color: "#FFFFFF" }}
                      >
                        {productCount} adet urun
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                p: { xs: 2, md: 2.6 },
                bgcolor: "#F8FAFC",
                background:
                  "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 68%, #F0FDFA 100%)",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 1.8 }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 950,
                      color: "#0284C7",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    Teklif
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: { xs: 19, md: 23 },
                      fontWeight: 950,
                      color: "#0F172A",
                      lineHeight: 1.12,
                    }}
                  >
                    Detaylar
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setOpen(false)}
                  aria-label="Kapat"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    color: "#0F172A",
                    bgcolor: "#FFFFFF",
                    border: "1px solid rgba(203,213,225,0.72)",
                    boxShadow: "0 10px 22px rgba(15,23,42,0.07)",
                    "&:hover": { bgcolor: "#F8FAFC" },
                  }}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Stack>

              <Tabs
                value={tab}
                onChange={(_, value) => setTab(value)}
                variant="fullWidth"
                sx={{
                  mb: 1.7,
                  minHeight: 44,
                  p: 0.45,
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.96)",
                  border: "1px solid rgba(203,213,225,0.82)",
                  boxShadow: "0 8px 18px rgba(15,23,42,0.045)",
                  "& .MuiTab-root": {
                    minHeight: 35,
                    borderRadius: 0.8,
                    textTransform: "none",
                    fontWeight: 880,
                    fontSize: 13,
                    color: "#64748B",
                    letterSpacing: 0,
                  },
                  "& .Mui-selected": {
                    color: "#0F172A !important",
                    bgcolor: "#E0F2FE",
                    boxShadow: "inset 0 0 0 1px rgba(14,165,233,0.18)",
                  },
                  "& .MuiTabs-indicator": { display: "none" },
                }}
              >
                <Tab icon={<Inventory2RoundedIcon />} iconPosition="start" label="Urunler" />
                <Tab icon={<DesignServicesRoundedIcon />} iconPosition="start" label="Montaj" />
                <Tab icon={<LocalShippingRoundedIcon />} iconPosition="start" label="Nakliye" />
              </Tabs>

              {tab === 0 && (
                <Box
                  sx={{
                    height: { md: 524 },
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    overflow: "hidden",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                    spacing={1.2}
                    sx={{
                      mb: 1,
                      p: 1.15,
                      borderRadius: 1,
                      bgcolor: "#FFFFFF",
                      border: "1px solid rgba(226,232,240,0.88)",
                      boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.1}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 1,
                          display: "grid",
                          placeItems: "center",
                          color: "#0F766E",
                          bgcolor: "#CCFBF1",
                        }}
                      >
                        <Inventory2RoundedIcon sx={{ fontSize: 19 }} />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 950,
                            color: "#0F172A",
                            lineHeight: 1.15,
                          }}
                        >
                          Urunler
                        </Typography>
                        <Typography
                          sx={{ mt: 0.35, fontSize: 11.5, fontWeight: 800, color: "#64748B" }}
                        >
                          {productCount} adet
                        </Typography>
                      </Box>
                    </Stack>
                    <Box
                      sx={{
                        px: 1.35,
                        py: 0.75,
                        borderRadius: 1,
                        bgcolor: "#F8FAFC",
                        border: "1px solid rgba(203,213,225,0.72)",
                        textAlign: { xs: "left", sm: "right" },
                      }}
                    >
                      <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: "#64748B" }}>
                        Urun toplami
                      </Typography>
                      <Typography sx={{ mt: 0.2, fontSize: 15, fontWeight: 950, color: "#0F172A" }}>
                        {money(subtotal)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    spacing={0.9}
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      pr: 0.5,
                      "&::-webkit-scrollbar": { width: 8 },
                      "&::-webkit-scrollbar-thumb": {
                        bgcolor: "rgba(14,165,233,0.38)",
                        borderRadius: 99,
                      },
                    }}
                  >
                  {(quote?.lines || []).length ? (
                    quote.lines.map((line, index) => (
                      <Stack
                        key={`${line.catalog_item_id}-${index}`}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{
                          px: 1.35,
                          py: 1.05,
                          borderRadius: 1,
                          border: "1px solid rgba(203,213,225,0.72)",
                          bgcolor: "#FFFFFF",
                          boxShadow: "0 10px 22px rgba(15,23,42,0.05)",
                          transition:
                            "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            borderColor: "rgba(14,165,233,0.46)",
                            boxShadow: "0 16px 30px rgba(14,165,233,0.1)",
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              flex: "0 0 auto",
                              borderRadius: 1,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: "#F0FDFA",
                              color: "#0F766E",
                              border: "1px solid rgba(45,212,191,0.28)",
                              fontSize: 14,
                              fontWeight: 950,
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography
                            sx={{
                              minWidth: 0,
                              fontSize: 14.5,
                              fontWeight: 950,
                              color: "#0F172A",
                              lineHeight: 1.2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {line.name}
                          </Typography>
                        </Stack>
                        <Box sx={{ textAlign: "right", flex: "0 0 auto" }}>
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 950,
                              color: "#0F172A",
                              lineHeight: 1.1,
                            }}
                          >
                            {money(line.line_total)}
                          </Typography>
                        </Box>
                      </Stack>
                    ))
                  ) : (
                    <Box
                      sx={{
                        minHeight: 216,
                        p: 3,
                        borderRadius: 1,
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid rgba(186,230,253,0.72)",
                        background:
                          "linear-gradient(145deg, #FFFFFF 0%, #F0FDFA 54%, #E0F2FE 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
                        textAlign: "center",
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            width: 58,
                            height: 58,
                            mx: "auto",
                            mb: 1.45,
                            borderRadius: 1,
                            display: "grid",
                            placeItems: "center",
                            color: "#0369A1",
                            bgcolor: "#FFFFFF",
                            border: "1px solid rgba(14,165,233,0.22)",
                            boxShadow: "0 16px 32px rgba(14,165,233,0.12)",
                          }}
                        >
                          <Inventory2RoundedIcon sx={{ fontSize: 30 }} />
                        </Box>
                        <Typography
                          sx={{ fontSize: 17, fontWeight: 950, color: "#0F172A" }}
                        >
                          Urun yok
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  </Stack>
                </Box>
              )}

              {tab === 1 && (
                <Stack spacing={1.2} sx={{ height: { md: 524 }, overflow: "hidden" }}>
                  <Box
                    sx={{
                      p: 1.45,
                      borderRadius: 1,
                      color: "#0F172A",
                      background:
                        "linear-gradient(135deg, #ECFDF5 0%, #E0F2FE 100%)",
                      border: "1px solid rgba(45,212,191,0.32)",
                      boxShadow: "0 14px 26px rgba(15,118,110,0.08)",
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1.15}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1,
                            display: "grid",
                            placeItems: "center",
                            color: "#0F766E",
                            bgcolor: "#FFFFFF",
                            border: "1px solid rgba(15,118,110,0.16)",
                          }}
                        >
                          <DesignServicesRoundedIcon />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 11, fontWeight: 900, color: "#0F766E" }}>
                            Montaj plani
                          </Typography>
                          <Typography sx={{ mt: 0.25, fontSize: 16, fontWeight: 950, color: "#0F172A", lineHeight: 1.15 }}>
                            Tarih ve ekip bilgisi
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 1,
                      bgcolor: "#FFFFFF",
                      border: "1px solid rgba(226,232,240,0.88)",
                      boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gridTemplateRows: "auto auto minmax(0, 1fr)",
                        gap: "10px",
                        flex: 1,
                        minHeight: 0,
                        pt: "10px",
                        alignContent: "start",
                      }}
                    >
                      <TextField
                        fullWidth
                        label="Montaj Ucreti"
                        type="number"
                        size="small"
                        sx={{ gridColumn: { xs: "1 / -1", sm: "1 / 2" } }}
                        value={Number(quote?.installation || 0)}
                        onChange={(event) =>
                          updateQuoteFee("installation_fee", event.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <DesignServicesRoundedIcon sx={{ mr: 1, color: "#0F766E" }} />
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Montaj Tarihi"
                        type="date"
                        size="small"
                        sx={{ gridColumn: { xs: "1 / -1", sm: "2 / 3" } }}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <CalendarMonthRoundedIcon sx={{ mr: 1, color: "#0284C7" }} />
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Montaj Ekibi / Sorumlu"
                        size="small"
                        sx={{ gridColumn: "1 / -1" }}
                        InputProps={{
                          startAdornment: (
                            <PersonRoundedIcon sx={{ mr: 1, color: "#0284C7" }} />
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Montaj Notu"
                        multiline
                        minRows={12}
                        size="small"
                        placeholder="Olcu, elektrik/su hazirligi, ozel montaj talepleri..."
                        sx={{
                          gridColumn: "1 / -1",
                          minHeight: 0,
                          "& .MuiInputBase-root": {
                            height: "100%",
                            alignItems: "flex-start",
                          },
                          "& textarea": { height: "100% !important" },
                        }}
                        InputProps={{
                          startAdornment: (
                            <NotesRoundedIcon sx={{ mr: 1, mt: 1, color: "#0284C7" }} />
                          ),
                        }}
                      />
                    </Box>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: "auto", pt: "10px" }}>
                      <Button
                        variant="contained"
                        startIcon={<VerifiedRoundedIcon />}
                        sx={{
                          borderRadius: 1,
                          px: 2,
                          py: 0.9,
                          fontWeight: 950,
                          textTransform: "none",
                          bgcolor: "#0F766E",
                          boxShadow: "0 14px 26px rgba(15,118,110,0.22)",
                          "&:hover": { bgcolor: "#115E59" },
                        }}
                      >
                        Hazirla
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              )}

              {tab === 2 && (
                <Stack spacing={1.2} sx={{ height: { md: 524 }, overflow: "hidden" }}>
                  <Box
                    sx={{
                      p: 1.45,
                      borderRadius: 1,
                      color: "#0F172A",
                      background:
                        "linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 100%)",
                      border: "1px solid rgba(125,211,252,0.36)",
                      boxShadow: "0 14px 26px rgba(3,105,161,0.08)",
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1.15}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1,
                            display: "grid",
                            placeItems: "center",
                            color: "#0369A1",
                            bgcolor: "#FFFFFF",
                            border: "1px solid rgba(3,105,161,0.16)",
                          }}
                        >
                          <LocalShippingRoundedIcon />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 11, fontWeight: 900, color: "#0369A1" }}>
                            Nakliye plani
                          </Typography>
                          <Typography sx={{ mt: 0.25, fontSize: 16, fontWeight: 950, color: "#0F172A", lineHeight: 1.15 }}>
                            Adres ve teslim zamani
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 1,
                      bgcolor: "#FFFFFF",
                      border: "1px solid rgba(226,232,240,0.88)",
                      boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gridTemplateRows: "auto auto minmax(0, 1fr) minmax(0, 1fr)",
                        gap: "10px",
                        flex: 1,
                        minHeight: 0,
                        pt: "10px",
                        alignContent: "start",
                      }}
                    >
                      <TextField
                        fullWidth
                        label="Nakliye Ucreti"
                        type="number"
                        size="small"
                        sx={{ gridColumn: { xs: "1 / -1", sm: "1 / 2" } }}
                        value={Number(quote?.shipping || 0)}
                        onChange={(event) =>
                          updateQuoteFee("shipping_fee", event.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <LocalShippingRoundedIcon sx={{ mr: 1, color: "#0369A1" }} />
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Teslim Alacak Kisi"
                        size="small"
                        sx={{ gridColumn: "1 / -1" }}
                        InputProps={{
                          startAdornment: (
                            <PersonRoundedIcon sx={{ mr: 1, color: "#0284C7" }} />
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Teslim Tarihi"
                        type="date"
                        size="small"
                        sx={{ gridColumn: { xs: "1 / -1", sm: "2 / 3" }, gridRow: { sm: 1 } }}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <CalendarMonthRoundedIcon sx={{ mr: 1, color: "#0284C7" }} />
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Teslimat Adresi"
                        multiline
                        minRows={6}
                        size="small"
                        sx={{
                          gridColumn: "1 / -1",
                          minHeight: 0,
                          "& .MuiInputBase-root": {
                            height: "100%",
                            alignItems: "flex-start",
                          },
                          "& textarea": { height: "100% !important" },
                        }}
                        InputProps={{
                          startAdornment: (
                            <LocationOnRoundedIcon sx={{ mr: 1, mt: 1, color: "#0284C7" }} />
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Nakliye Notu"
                        multiline
                        minRows={7}
                        size="small"
                        placeholder="Kat bilgisi, asansor, park durumu, teslimat saati..."
                        sx={{
                          gridColumn: "1 / -1",
                          minHeight: 0,
                          "& .MuiInputBase-root": {
                            height: "100%",
                            alignItems: "flex-start",
                          },
                          "& textarea": { height: "100% !important" },
                        }}
                        InputProps={{
                          startAdornment: (
                            <NotesRoundedIcon sx={{ mr: 1, mt: 1, color: "#0284C7" }} />
                          ),
                        }}
                      />
                    </Box>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: "auto", pt: "10px" }}>
                      <Button
                        variant="contained"
                        startIcon={<LocalShippingRoundedIcon />}
                        sx={{
                          borderRadius: 1,
                          px: 2,
                          py: 0.9,
                          fontWeight: 950,
                          textTransform: "none",
                          bgcolor: "#0369A1",
                          boxShadow: "0 14px 26px rgba(3,105,161,0.22)",
                          "&:hover": { bgcolor: "#075985" },
                        }}
                      >
                        Planla
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuoteSummaryControl;
