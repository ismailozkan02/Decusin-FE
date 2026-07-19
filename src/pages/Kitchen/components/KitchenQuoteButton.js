import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import { money } from "../kitchenUtils";

const KitchenQuoteButton = ({ quote, open, onOpen, onClose }) => (
  <>
    <Button
      variant="contained"
      startIcon={<RequestQuoteOutlinedIcon />}
      onClick={onOpen}
      sx={{
        position: "absolute",
        top: 14,
        right: 14,
        zIndex: 12,
        textTransform: "none",
        fontWeight: 900,
        boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
      }}
    >
      {money(quote?.total)}
    </Button>

    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>Fiyat Detayi</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.4}>
          {(quote?.lines || []).length ? (
            quote.lines.map((line) => (
              <Stack
                key={`${line.catalog_item_id}-${line.name}`}
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
            <Typography color="text.secondary">Henuz fiyat kalemi yok.</Typography>
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
              {money(quote?.total)}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  </>
);

export default KitchenQuoteButton;
