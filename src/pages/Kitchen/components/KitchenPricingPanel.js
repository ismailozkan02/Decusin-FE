import { Box, Divider, Typography } from "@mui/material";
import { money } from "../kitchenUtils";

const KitchenPricingPanel = ({ selectedProduct, selectedLineQuote }) => (
  <>
    <Divider />
    <Typography variant="h6" sx={{ fontWeight: 800 }}>
      Seçili Ürün Fiyati
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 900 }}>
      {money(selectedProduct?.base_price)}
    </Typography>
    <Box>
      <Typography variant="body2" color="text.secondary">
        Katalog fiyatı: {money(selectedProduct?.base_price)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Malzeme dahil Toplam Fiyat: {money(selectedLineQuote?.line_total)}
      </Typography>
    </Box>
  </>
);

export default KitchenPricingPanel;
