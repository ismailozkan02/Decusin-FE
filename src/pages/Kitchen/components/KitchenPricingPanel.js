import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { money } from "../kitchenUtils";

const KitchenPricingPanel = ({ selectedProduct, selectedLineQuote, onSaveProject }) => (
  <>
    <Divider />
    <Typography variant="h6" sx={{ fontWeight: 800 }}>
      Secili Urun Fiyati
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 900 }}>
      {money(selectedProduct?.base_price)}
    </Typography>
    <Box>
      <Typography variant="body2" color="text.secondary">
        Katalog fiyati: {money(selectedProduct?.base_price)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Malzeme dahil satir toplami: {money(selectedLineQuote?.line_total)}
      </Typography>
    </Box>
    <Stack>
      <Button
        variant="contained"
        startIcon={<SaveOutlinedIcon />}
        onClick={onSaveProject}
        sx={{ textTransform: "none", fontWeight: 800 }}
      >
        Projeyi kaydet
      </Button>
    </Stack>
  </>
);

export default KitchenPricingPanel;
