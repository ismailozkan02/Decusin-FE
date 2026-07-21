import { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

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
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const productCount = (quote?.lines || []).reduce(
    (sum, line) => sum + Number(line.quantity || 0),
    0,
  );
  const subtotal = Number(quote?.subtotal || 0);
  const installation = Number(quote?.installation || 0);
  const shipping = Number(quote?.shipping || 0);

  useEffect(() => {
    const updateQuoteTotal = (event) => {
      setQuoteTotal(Number(event.detail?.total || 0));
      setQuote(event.detail?.quote || {});
    };

    window.addEventListener("decusin:quote-total", updateQuoteTotal);
    return () =>
      window.removeEventListener("decusin:quote-total", updateQuoteTotal);
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
        onClick={() => setOpen(true)}
        sx={{
          width: compact ? 42 : "100%",
          minHeight: compact ? 42 : 174,
          px: compact ? 0 : 1.45,
          py: compact ? 0 : 1.55,
          borderRadius: 1,
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          alignItems: compact ? "center" : "stretch",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(37,99,235,0.22)",
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 42%, #EAF2FF 100%)",
          boxShadow:
            "0 14px 30px rgba(37,99,235,0.13), inset 0 1px 0 rgba(255,255,255,0.96)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: "0 auto 0 0",
            width: 4,
            bgcolor: "#2563EB",
          },
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow:
              "0 18px 38px rgba(37,99,235,0.18), inset 0 1px 0 rgba(255,255,255,0.98)",
          },
        }}
      >
        {compact ? (
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
                    color: "#2563EB",
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
                    color: "#64748B",
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
                  color: "#1D4ED8",
                  bgcolor: "rgba(37,99,235,0.08)",
                  border: "1px solid rgba(37,99,235,0.14)",
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
                color: "#0F172A",
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
                    bgcolor: "rgba(255,255,255,0.66)",
                    border: "1px solid rgba(203,213,225,0.48)",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 950, color: "#0F172A" }}
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
        maxWidth="md"
        PaperProps={{
          sx: {
            width: 920,
            maxWidth: "calc(100vw - 32px)",
            borderRadius: 0.5,
            overflow: "hidden",
            border: "1px solid rgba(203,213,225,0.72)",
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
              "& fieldset": { borderColor: "rgba(148,163,184,0.48)" },
              "&:hover fieldset": { borderColor: "rgba(37,99,235,0.44)" },
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
                borderRight: {
                  xs: "none",
                  md: "1px solid rgba(226,232,240,0.86)",
                },
                borderBottom: {
                  xs: "1px solid rgba(226,232,240,0.86)",
                  md: "none",
                },
                background:
                  "linear-gradient(160deg, #FFFFFF 0%, #F9FBFF 48%, #EDF6FF 100%)",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 950,
                    color: "#2563EB",
                    letterSpacing: 1.1,
                    textTransform: "uppercase",
                  }}
                >
                  Teklif Merkezi
                </Typography>
                <Typography
                  sx={{
                    mt: 0.8,
                    fontSize: 26,
                    fontWeight: 950,
                    color: "#0F172A",
                    lineHeight: 1.04,
                  }}
                >
                  Fiyat ve Operasyon
                </Typography>
                <Typography
                  sx={{
                    mt: 1.1,
                    fontSize: 12.5,
                    fontWeight: 720,
                    color: "#64748B",
                    lineHeight: 1.5,
                  }}
                >
                  Urun, montaj ve nakliye kalemlerini tek teklif ekraninda
                  yonetin.
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
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 950,
                      color: "#0F766E",
                      letterSpacing: 0.9,
                      textTransform: "uppercase",
                    }}
                  >
                    Ara Toplam
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: 22,
                      fontWeight: 950,
                      color: "#0F172A",
                    }}
                  >
                    {money(quote?.subtotal)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.8,
                    borderRadius: 1,
                    background:
                      "linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 45%, #E7F0FF 100%)",
                    border: "1px solid rgba(37,99,235,0.22)",
                    boxShadow: "0 12px 28px rgba(37,99,235,0.1)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 950,
                      color: "#2563EB",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    Genel Toplam
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: 30,
                      fontWeight: 950,
                      color: "#1D4ED8",
                      lineHeight: 1,
                    }}
                  >
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
                value={tab}
                onChange={(_, value) => setTab(value)}
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
                <Tab label="Urunler" />
                <Tab label="Montaj" />
                <Tab label="Nakliye" />
              </Tabs>

              {tab === 0 && (
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
                          <Typography sx={{ fontWeight: 950, color: "#0F172A" }}>
                            {line.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748B", fontWeight: 800 }}
                          >
                            {line.quantity} adet - opsiyon{" "}
                            {money(line.modifiers_total)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 950, color: "#0F172A" }}>
                          {money(line.line_total)}
                        </Typography>
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
                      Sahnede henuz urun yok.
                    </Box>
                  )}
                </Stack>
              )}

              {tab === 1 && (
                <Stack spacing={1.4}>
                  <TextField
                    fullWidth
                    label="Montaj Ucreti"
                    type="number"
                    size="small"
                    value={Number(quote?.installation || 0)}
                    onChange={(event) =>
                      updateQuoteFee("installation_fee", event.target.value)
                    }
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <TextField
                      fullWidth
                      label="Montaj Tarihi"
                      type="date"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth
                      label="Montaj Ekibi / Sorumlu"
                      size="small"
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    label="Montaj Notu"
                    multiline
                    minRows={3}
                    size="small"
                    placeholder="Olcu, elektrik/su hazirligi, ozel montaj talepleri..."
                  />
                </Stack>
              )}

              {tab === 2 && (
                <Stack spacing={1.4}>
                  <TextField
                    fullWidth
                    label="Nakliye Ucreti"
                    type="number"
                    size="small"
                    value={Number(quote?.shipping || 0)}
                    onChange={(event) =>
                      updateQuoteFee("shipping_fee", event.target.value)
                    }
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <TextField
                      fullWidth
                      label="Teslim Alacak Kisi"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Teslim Tarihi"
                      type="date"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    label="Teslimat Adresi"
                    multiline
                    minRows={2}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Nakliye Notu"
                    multiline
                    minRows={2}
                    size="small"
                    placeholder="Kat bilgisi, asansor, park durumu, teslimat saati..."
                  />
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
