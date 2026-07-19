import { Paper, Tab, Tabs } from "@mui/material";

const KitchenWorkspaceTabs = ({ tab, onChange }) => (
  <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}>
    <Tabs
      value={tab}
      onChange={(_, value) => onChange(value)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ px: 1 }}
    >
      <Tab label="Tasarim sahnesi" />
      <Tab label="Ürünler & malzemeler" />
      <Tab label="Fiyatlandırma" />
      <Tab label="Projeler" />
    </Tabs>
  </Paper>
);

export default KitchenWorkspaceTabs;
