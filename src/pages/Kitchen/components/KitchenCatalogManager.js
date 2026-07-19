import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  ClickAwayListener,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import { catalogGroups } from "../kitchenData";
import { categoryLabel, materialModifierLabel, money } from "../kitchenUtils";

const materialGroups = [
  { key: "door", title: "Kapak Malzemeleri" },
  { key: "glass", title: "Cam Cesitleri" },
  { key: "countertop", title: "Tezgah Malzemeleri" },
];

const KitchenCatalogManager = ({
  catalogItems,
  materials,
  installationFee,
  selectedProduct,
  selectedMaterial,
  onSelectProduct,
  onCloseProduct,
  onUpdateProduct,
  onChangeInstallationFee,
  onSelectMaterial,
  onCloseMaterial,
  onUpdateMaterial,
}) => {
  const [expanded, setExpanded] = useState("base_cabinet");
  const [expandedMaterial, setExpandedMaterial] = useState("door");
  const toggle = (panel) => (_, nextExpanded) => {
    setExpanded(nextExpanded ? panel : false);
  };
  const toggleMaterial = (panel) => (_, nextExpanded) => {
    setExpandedMaterial(nextExpanded ? panel : false);
  };

  const updateSelectedProduct = (field, value) => {
    if (!selectedProduct) return;

    onUpdateProduct(selectedProduct.id, (product) => ({
      ...product,
      constraints: {
        ...(product.constraints || {}),
        [field]: Math.max(Number(value) || 0, 0),
      },
    }));
  };

  const updateSelectedProductField = (field, value) => {
    if (!selectedProduct) return;

    onUpdateProduct(selectedProduct.id, (product) => ({
      ...product,
      [field]: field === "base_price" ? Math.max(Number(value) || 0, 0) : value,
    }));
  };

  const updateSelectedMaterial = (field, value) => {
    if (!selectedMaterial) return;

    onUpdateMaterial(selectedMaterial.id, (material) => ({
      ...material,
      [field]: field === "price_modifier" ? Number(value) || 0 : value,
    }));
  };

  return (
    <>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Stack spacing={1.4}>
            {catalogGroups.map((group) => {
              const groupItems = catalogItems.filter((item) => item.category === group.key);
              if (!groupItems.length) return null;

              return (
                <Accordion
                  key={group.key}
                  expanded={expanded === group.key}
                  onChange={toggle(group.key)}
                  disableGutters
                  elevation={0}
                  sx={{ border: "1px solid #E2E8F0", borderRadius: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography sx={{ fontWeight: 900 }}>{group.title}</Typography>
                      <Chip size="small" label={`${groupItems.length} urun`} />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1.4}>
                      {groupItems.map((product) => (
                        <Grid item xs={12} sm={6} lg={4} key={product.id}>
                          <Paper
                            elevation={0}
                            onClick={() => onSelectProduct(product)}
                            sx={{
                              border:
                                selectedProduct?.id === product.id
                                  ? "2px solid #1976D2"
                                  : "1px solid #E5E7EB",
                              borderRadius: 1,
                              p: 1.5,
                              cursor: "pointer",
                              bgcolor: selectedProduct?.id === product.id ? "#EEF6FF" : "#FFFFFF",
                            }}
                          >
                            <Stack spacing={1.2}>
                              <Box
                                component="img"
                                src={product.image_url || "/images/kitchen/base-cabinet.svg"}
                                alt={product.name}
                                sx={{
                                  width: "100%",
                                  height: 118,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                  border: "1px solid #E2E8F0",
                                  bgcolor: "#F8FAFC",
                                }}
                              />
                              <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Box>
                                  <Typography sx={{ fontWeight: 900 }}>{product.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {product.sku} - {categoryLabel(product.category)}
                                  </Typography>
                                </Box>
                                <TuneIcon color="primary" fontSize="small" />
                              </Stack>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="caption" color="text.secondary">
                                  Genislik
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                  {product.constraints?.min_width || 0} -{" "}
                                  {product.constraints?.max_width || product.dimensions?.width} cm
                                </Typography>
                              </Stack>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="caption" color="text.secondary">
                                  Yukseklik
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                  {product.constraints?.min_height || 0} -{" "}
                                  {product.constraints?.max_height || product.dimensions?.height} cm
                                </Typography>
                              </Stack>
                              <Chip label={money(product.base_price)} size="small" sx={{ alignSelf: "flex-start" }} />
                              {product.model_url && (
                                <Chip
                                  label="3D model bagli"
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                  sx={{ alignSelf: "flex-start" }}
                                />
                              )}
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={1.5}>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: 1.5,
                p: 2,
                boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                Montaj
              </Typography>
              <TextField
                fullWidth
                label="Montaj fiyati"
                type="number"
                size="small"
                value={installationFee || 0}
                onChange={(event) => onChangeInstallationFee(Number(event.target.value) || 0)}
                helperText="Bu tutar toplam fiyata sabit montaj bedeli olarak eklenir."
              />
            </Paper>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: 1.5,
                p: 2,
                boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                Malzemeler
              </Typography>
              <Stack spacing={1.2}>
                {materialGroups.map((group) => {
                  const groupItems = materials.filter((material) => material.type === group.key);
                  if (!groupItems.length) return null;

                  return (
                    <Accordion
                      key={group.key}
                      expanded={expandedMaterial === group.key}
                      onChange={toggleMaterial(group.key)}
                      disableGutters
                      elevation={0}
                      sx={{ border: "1px solid #E2E8F0", borderRadius: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography sx={{ fontWeight: 900 }}>{group.title}</Typography>
                          <Chip size="small" label={`${groupItems.length} malzeme`} />
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          {groupItems.map((material) => (
                            <Stack
                              key={material.id}
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              onClick={() => onSelectMaterial(material)}
                              sx={{
                                border:
                                  selectedMaterial?.id === material.id
                                    ? "2px solid #1976D2"
                                    : "1px solid #E5E7EB",
                                borderRadius: 1,
                                p: 1.2,
                                cursor: "pointer",
                                bgcolor:
                                  selectedMaterial?.id === material.id ? "#EEF6FF" : "#FFFFFF",
                              }}
                            >
                              <Stack direction="row" spacing={1.2} alignItems="center">
                                <Box
                                  sx={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 0.75,
                                    bgcolor: material.color_hex || "#CBD5E1",
                                    border: "1px solid #CBD5E1",
                                  }}
                                />
                                <Box>
                                  <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
                                    {material.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {material.code}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Chip label={materialModifierLabel(material)} size="small" />
                            </Stack>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={Boolean(selectedMaterial)}
        onClose={onCloseMaterial}
        variant="persistent"
        PaperProps={{
          sx: {
            width: { xs: 320, sm: 390 },
            p: 2,
            top: 0,
            height: "100%",
            borderLeft: "1px solid #E2E8F0",
            boxShadow: "-12px 0 30px rgba(15,23,42,0.12)",
            zIndex: 1300,
          },
        }}
      >
        {selectedMaterial && (
          <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={onCloseMaterial}
          >
            <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Malzeme Yonetimi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedMaterial.code}
                </Typography>
              </Box>
              <IconButton onClick={onCloseMaterial}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <TextField
              label="Malzeme adi"
              size="small"
              value={selectedMaterial.name}
              onChange={(event) => updateSelectedMaterial("name", event.target.value)}
            />
            <TextField
              select
              label="Kategori"
              size="small"
              value={selectedMaterial.type}
              onChange={(event) => updateSelectedMaterial("type", event.target.value)}
            >
              {materialGroups.map((group) => (
                <MenuItem key={group.key} value={group.key}>
                  {group.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Renk kodu"
              size="small"
              value={selectedMaterial.color_hex || ""}
              onChange={(event) => updateSelectedMaterial("color_hex", event.target.value)}
            />
            <TextField
              label="Onizleme model dosyasi"
              size="small"
              value={selectedMaterial.preview_model_url || ""}
              onChange={(event) => updateSelectedMaterial("preview_model_url", event.target.value)}
              helperText="Malzemeyi denemek icin kullanilacak demo GLTF yolu."
            />
            <TextField
              label="Fiyat etkisi"
              type="number"
              size="small"
              value={selectedMaterial.price_modifier || 0}
              onChange={(event) => updateSelectedMaterial("price_modifier", event.target.value)}
            />
            <TextField
              select
              label="Fiyat tipi"
              size="small"
              value={selectedMaterial.modifier_type}
              onChange={(event) => updateSelectedMaterial("modifier_type", event.target.value)}
            >
              <MenuItem value="percent">Yuzde</MenuItem>
              <MenuItem value="fixed">Sabit</MenuItem>
            </TextField>
            </Stack>
          </ClickAwayListener>
        )}
      </Drawer>

      <Drawer
        anchor="right"
        open={Boolean(selectedProduct)}
        onClose={onCloseProduct}
        variant="persistent"
        PaperProps={{
          sx: {
            width: { xs: 320, sm: 390 },
            p: 2,
            top: 0,
            height: "100%",
            borderLeft: "1px solid #E2E8F0",
            boxShadow: "-12px 0 30px rgba(15,23,42,0.12)",
            zIndex: 1300,
          },
        }}
      >
        {selectedProduct && (
          <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={onCloseProduct}
          >
            <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Urun Yonetimi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedProduct.sku} - {categoryLabel(selectedProduct.category)}
                </Typography>
              </Box>
              <IconButton onClick={onCloseProduct}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Box
              component="img"
              src={selectedProduct.image_url || "/images/kitchen/base-cabinet.svg"}
              alt={selectedProduct.name}
              sx={{
                width: "100%",
                height: 160,
                objectFit: "cover",
                borderRadius: 1,
                border: "1px solid #E2E8F0",
                bgcolor: "#F8FAFC",
              }}
            />
            <TextField label="Urun adi" size="small" value={selectedProduct.name} disabled />
            <TextField
              label="Urun fiyati"
              type="number"
              size="small"
              value={selectedProduct.base_price || 0}
              onChange={(event) => updateSelectedProductField("base_price", event.target.value)}
              helperText="Sahneye eklenen bu urunun ana fiyatini belirler."
            />
            <TextField
              label="Urun resmi"
              size="small"
              value={selectedProduct.image_url || ""}
              onChange={(event) => updateSelectedProductField("image_url", event.target.value)}
              helperText="public klasorune gore yol: /images/kitchen/base-cabinet.svg"
            />
            <TextField
              label="3D model dosyasi"
              size="small"
              value={selectedProduct.model_url || ""}
              onChange={(event) =>
                onUpdateProduct(selectedProduct.id, (product) => ({
                  ...product,
                  model_url: event.target.value,
                }))
              }
              helperText="public klasorune gore yol: /models/kitchen/base-cabinet-demo.gltf"
            />
            <TextField
              select
              label="Kategori"
              size="small"
              value={selectedProduct.category}
              disabled
            >
              {catalogGroups.map((group) => (
                <MenuItem key={group.key} value={group.key}>
                  {group.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Minimum genislik"
              type="number"
              size="small"
              value={selectedProduct.constraints?.min_width || 0}
              onChange={(event) => updateSelectedProduct("min_width", event.target.value)}
            />
            <TextField
              label="Maksimum genislik"
              type="number"
              size="small"
              value={selectedProduct.constraints?.max_width || 0}
              onChange={(event) => updateSelectedProduct("max_width", event.target.value)}
            />
            <TextField
              label="Minimum yukseklik"
              type="number"
              size="small"
              value={selectedProduct.constraints?.min_height || 0}
              onChange={(event) => updateSelectedProduct("min_height", event.target.value)}
            />
            <TextField
              label="Maksimum yukseklik"
              type="number"
              size="small"
              value={selectedProduct.constraints?.max_height || 0}
              onChange={(event) => updateSelectedProduct("max_height", event.target.value)}
            />
            <Typography variant="caption" color="text.secondary">
              Bu aralik sahnedeki genislik/yukseklik degistirme ve kose tutamaclari icin sinir olarak kullanilir.
            </Typography>
            </Stack>
          </ClickAwayListener>
        )}
      </Drawer>
    </>
  );
};

export default KitchenCatalogManager;
