import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

const PremiumDialog = ({
  open,
  title,
  subtitle,
  actions,
  children,
  onClose,
  closeDisabled = false,
  maxWidth = "sm",
}) => (
  <Dialog
    open={open}
    onClose={closeDisabled ? undefined : onClose}
    fullWidth
    maxWidth={maxWidth}
    PaperProps={{
      sx: {
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid rgba(187,214,246,0.9)",
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 58%, #F2F8FF 100%)",
        boxShadow:
          "0 28px 80px rgba(15,48,86,0.28), 0 0 0 1px rgba(255,255,255,0.8)",
      },
    }}
    BackdropProps={{
      sx: {
        bgcolor: "rgba(15,23,42,0.52)",
        backdropFilter: "blur(2px)",
      },
    }}
  >
    <DialogTitle
      sx={{
        p: 0,
        borderBottom: "1px solid #DCEBFA",
        background:
          "linear-gradient(135deg, #FFFFFF 0%, #F4F9FF 62%, #EAF3FF 100%)",
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
        sx={{ px: 2.5, py: 2.2 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{ color: "#173B63", fontWeight: 950, lineHeight: 1.15 }}
          >
            {title}
          </Typography>
          {!!subtitle && (
            <Typography variant="body2" sx={{ color: "#5F7897", mt: 0.45 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          aria-label="Kapat"
          onClick={onClose}
          disabled={closeDisabled}
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1,
            color: "#DC2626",
            bgcolor: "#FEF2F2",
            border: "1px solid #FECACA",
            boxShadow: "0 8px 18px rgba(220,38,38,0.12)",
            "&:hover": {
              bgcolor: "#FEE2E2",
              borderColor: "#FCA5A5",
              boxShadow: "0 10px 22px rgba(220,38,38,0.18)",
            },
            "&.Mui-disabled": {
              color: "#FCA5A5",
              bgcolor: "#FFF5F5",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </DialogTitle>
    <DialogContent sx={{ px: 2.5, py: 2.5 }}>{children}</DialogContent>
    {!!actions && (
      <DialogActions
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: 1,
          py: 1,
          borderTop: "1px solid rgba(220,235,250,0.75)",
          bgcolor: "#FFFFFF",
        }}
      >
        {actions}
      </DialogActions>
    )}
  </Dialog>
);

export default PremiumDialog;
