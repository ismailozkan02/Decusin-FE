import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
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
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { categoryLabel, materialModifierLabel, money } from "../kitchenUtils";

const materialGroups = [
  { key: "door", title: "Kapak Malzemeleri" },
  { key: "glass", title: "Cam Cesitleri" },
  { key: "countertop", title: "Tezgah Malzemeleri" },
];

const slugify = (value) =>
  value
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const KitchenCatalogManager = ({
  catalogItems,
  catalogGroups,
  materials,
  installationFee,
  selectedProduct,
  selectedMaterial,
  onSelectProduct,
  onCloseProduct,
  onUpdateProduct,
  onAddProduct,
  onAddCatalogGroup,
  onChangeInstallationFee,
  onSelectMaterial,
  onCloseMaterial,
  onUpdateMaterial,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [expandedMaterial, setExpandedMaterial] = useState(false);
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [materialCategoryGroups, setMaterialCategoryGroups] =
    useState(materialGroups);
  const [categoryForm, setCategoryForm] = useState({
    target: "product",
    title: "",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "base_cabinet",
    base_price: 0,
    min_width: 40,
    max_width: 120,
    min_height: 40,
    max_height: 120,
    model_url: "",
    file_name: "",
  });
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

  const getProductCategoryLabel = (value) =>
    catalogGroups.find((group) => group.key === value)?.title ||
    categoryLabel(value);

  const previewByCategory = {
    base_cabinet: "/images/kitchen/base-cabinet-premium.svg",
    wall_cabinet: "/images/kitchen/wall-cabinet-glass-premium.svg",
    countertop: "/images/kitchen/countertop-long-slab-premium.svg",
    appliance: "/images/kitchen/sink-steel-premium.svg",
    shelf: "/images/kitchen/open-shelf-premium.svg",
    room: "/images/kitchen/kitchen-layout-linear-premium.svg",
  };

  const handleNewModelFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["gltf", "glb"].includes(extension)) return;

    setNewProduct((current) => ({
      ...current,
      model_url: URL.createObjectURL(file),
      file_name: file.name,
      name: current.name || file.name.replace(/\.(gltf|glb)$/i, ""),
    }));
  };

  const addManualProduct = () => {
    if (!newProduct.name || !newProduct.model_url) return;

    const minWidth = Math.max(Number(newProduct.min_width) || 1, 1);
    const maxWidth = Math.max(
      Number(newProduct.max_width) || minWidth,
      minWidth,
    );
    const minHeight = Math.max(Number(newProduct.min_height) || 1, 1);
    const maxHeight = Math.max(
      Number(newProduct.max_height) || minHeight,
      minHeight,
    );
    const product = {
      id: `manual-${Date.now()}`,
      sku: `MAN-${Date.now().toString().slice(-6)}`,
      name: newProduct.name,
      category: newProduct.category,
      dimensions: {
        width: Math.round((minWidth + maxWidth) / 2),
        height: Math.round((minHeight + maxHeight) / 2),
        depth: 56,
        unit: "cm",
      },
      constraints: {
        min_width: minWidth,
        max_width: maxWidth,
        min_height: minHeight,
        max_height: maxHeight,
      },
      image_url:
        previewByCategory[newProduct.category] ||
        "/images/kitchen/base-cabinet-premium.svg",
      model_url: newProduct.model_url,
      original_file_name: newProduct.file_name,
      base_price: Math.max(Number(newProduct.base_price) || 0, 0),
      is_manual: true,
    };

    onAddProduct(product);
    setExpanded(product.category);
    setProductDrawerOpen(false);
    setNewProduct({
      name: "",
      category: product.category,
      base_price: 0,
      min_width: 40,
      max_width: 120,
      min_height: 40,
      max_height: 120,
      model_url: "",
      file_name: "",
    });
  };

  const addCategory = () => {
    const title = categoryForm.title.trim();
    if (!title) return;

    const baseKey = slugify(title) || `kategori_${Date.now()}`;
    if (categoryForm.target === "product") {
      const key = catalogGroups.some((group) => group.key === baseKey)
        ? `${baseKey}_${Date.now().toString().slice(-4)}`
        : baseKey;
      const nextGroup = { key, title };
      onAddCatalogGroup(nextGroup);
      setExpanded(key);
      setNewProduct((current) => ({ ...current, category: key }));
    } else {
      const key = materialCategoryGroups.some((group) => group.key === baseKey)
        ? `${baseKey}_${Date.now().toString().slice(-4)}`
        : baseKey;
      const nextGroup = { key, title };
      setMaterialCategoryGroups((current) => [...current, nextGroup]);
      setExpandedMaterial(key);
    }

    setCategoryForm({ target: "product", title: "" });
    setCategoryDrawerOpen(false);
  };

  return (
    <>
      <Grid container spacing={1} sx={{ m: 0, width: "100%" }}>
        <Grid item xs={12} md={8} sx={{ pl: "0 !important" }}>
          <Stack spacing={1.4}>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #D7E3F1",
                borderRadius: 1.5,
                p: 1.5,
                bgcolor: "#FFFFFF",
                boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Ürünler
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kategorilere gore urun ve 3D model yonetimi.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<CategoryOutlinedIcon />}
                    onClick={() => setCategoryDrawerOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Kategori Ekle
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<UploadFileIcon />}
                    onClick={() => setProductDrawerOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Urun Ekle
                  </Button>
                </Stack>
              </Stack>
            </Paper>
            {catalogGroups.map((group) => {
              const groupItems = catalogItems.filter(
                (item) => item.category === group.key,
              );
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
                      <Typography sx={{ fontWeight: 900 }}>
                        {group.title}
                      </Typography>
                      <Chip size="small" label={`${groupItems.length} urun`} />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1}>
                      {groupItems.map((product) => (
                        <Grid
                          item
                          xs={6}
                          sm={4}
                          md={3}
                          lg={2.4}
                          key={product.id}
                        >
                          <Paper
                            elevation={0}
                            onClick={() => onSelectProduct(product)}
                            sx={{
                              border:
                                selectedProduct?.id === product.id
                                  ? "2px solid #1976D2"
                                  : "1px solid #E5E7EB",
                              borderRadius: 1,
                              p: 0.8,
                              cursor: "pointer",
                              bgcolor:
                                selectedProduct?.id === product.id
                                  ? "#EEF6FF"
                                  : "#FFFFFF",
                            }}
                          >
                            <Stack spacing={0.7}>
                              <Box
                                component="img"
                                src={
                                  product.image_url ||
                                  "/images/kitchen/base-cabinet.svg"
                                }
                                alt={product.name}
                                sx={{
                                  width: "100%",
                                  height: 86,
                                  objectFit: "contain",
                                  borderRadius: 1,
                                  border: "1px solid #E2E8F0",
                                  bgcolor: "#F1F7FE",
                                  p: 0.6,
                                }}
                              />
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                spacing={0.7}
                              >
                                <Box>
                                  <Typography
                                    sx={{ fontWeight: 900, fontSize: 12 }}
                                    noWrap
                                  >
                                    {product.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {product.sku} -{" "}
                                    {getProductCategoryLabel(product.category)}
                                  </Typography>
                                </Box>
                                <TuneIcon color="primary" fontSize="small" />
                              </Stack>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Genislik
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 800 }}
                                >
                                  {product.constraints?.min_width || 0} -{" "}
                                  {product.constraints?.max_width ||
                                    product.dimensions?.width}{" "}
                                  cm
                                </Typography>
                              </Stack>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Yukseklik
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 800 }}
                                >
                                  {product.constraints?.min_height || 0} -{" "}
                                  {product.constraints?.max_height ||
                                    product.dimensions?.height}{" "}
                                  cm
                                </Typography>
                              </Stack>
                              <Chip
                                label={money(product.base_price)}
                                size="small"
                                sx={{ alignSelf: "center" }}
                              />
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
                onChange={(event) =>
                  onChangeInstallationFee(Number(event.target.value) || 0)
                }
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
                {materialCategoryGroups.map((group) => {
                  const groupItems = materials.filter(
                    (material) => material.type === group.key,
                  );
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
                          <Typography sx={{ fontWeight: 900 }}>
                            {group.title}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${groupItems.length} malzeme`}
                          />
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
                                  selectedMaterial?.id === material.id
                                    ? "#EEF6FF"
                                    : "#FFFFFF",
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={1.2}
                                alignItems="center"
                              >
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
                                  <Typography
                                    sx={{ fontWeight: 800, fontSize: 13 }}
                                  >
                                    {material.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {material.code}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Chip
                                label={materialModifierLabel(material)}
                                size="small"
                              />
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
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
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
                onChange={(event) =>
                  updateSelectedMaterial("name", event.target.value)
                }
              />
              <TextField
                select
                label="Kategori"
                size="small"
                value={selectedMaterial.type}
                onChange={(event) =>
                  updateSelectedMaterial("type", event.target.value)
                }
              >
                {materialCategoryGroups.map((group) => (
                  <MenuItem key={group.key} value={group.key}>
                    {group.title}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Renk kodu"
                size="small"
                value={selectedMaterial.color_hex || ""}
                onChange={(event) =>
                  updateSelectedMaterial("color_hex", event.target.value)
                }
              />
              <TextField
                label="Onizleme model dosyasi"
                size="small"
                value={selectedMaterial.preview_model_url || ""}
                onChange={(event) =>
                  updateSelectedMaterial(
                    "preview_model_url",
                    event.target.value,
                  )
                }
                helperText="Malzemeyi denemek icin kullanilacak demo GLTF yolu."
              />
              <TextField
                label="Fiyat etkisi"
                type="number"
                size="small"
                value={selectedMaterial.price_modifier || 0}
                onChange={(event) =>
                  updateSelectedMaterial("price_modifier", event.target.value)
                }
              />
              <TextField
                select
                label="Fiyat tipi"
                size="small"
                value={selectedMaterial.modifier_type}
                onChange={(event) =>
                  updateSelectedMaterial("modifier_type", event.target.value)
                }
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
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
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
        <ClickAwayListener
          mouseEvent="onMouseDown"
          touchEvent="onTouchStart"
          onClickAway={() => setCategoryDrawerOpen(false)}
        >
          <Stack spacing={2}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Kategori Ekle
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Urun veya malzeme kategorisi olustur.
                </Typography>
              </Box>
              <IconButton onClick={() => setCategoryDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <TextField
              select
              label="Kategori tipi"
              size="small"
              value={categoryForm.target}
              onChange={(event) =>
                setCategoryForm((current) => ({
                  ...current,
                  target: event.target.value,
                }))
              }
            >
              <MenuItem value="product">Urun kategorisi</MenuItem>
              <MenuItem value="material">Malzeme kategorisi</MenuItem>
            </TextField>
            <TextField
              label="Kategori adi"
              size="small"
              value={categoryForm.title}
              onChange={(event) =>
                setCategoryForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Orn: Ozel ust dolaplar"
            />
            <Button
              variant="contained"
              startIcon={<CategoryOutlinedIcon />}
              onClick={addCategory}
              disabled={!categoryForm.title.trim()}
              sx={{ textTransform: "none", fontWeight: 900 }}
            >
              Kategoriyi Ekle
            </Button>
          </Stack>
        </ClickAwayListener>
      </Drawer>

      <Drawer
        anchor="right"
        open={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
        variant="persistent"
        PaperProps={{
          sx: {
            width: { xs: 330, sm: 430 },
            p: 2,
            top: 0,
            height: "100%",
            borderLeft: "1px solid #E2E8F0",
            boxShadow: "-12px 0 30px rgba(15,23,42,0.12)",
            zIndex: 1300,
          },
        }}
      >
        <ClickAwayListener
          mouseEvent="onMouseDown"
          touchEvent="onTouchStart"
          onClickAway={() => setProductDrawerOpen(false)}
        >
          <Stack spacing={2}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Urun Ekle
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  GLTF/GLB dosyasi ve olcu sinirlari.
                </Typography>
              </Box>
              <IconButton onClick={() => setProductDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              sx={{ textTransform: "none", fontWeight: 900 }}
            >
              GLTF / GLB Sec
              <input
                hidden
                type="file"
                accept=".gltf,.glb,model/gltf+json,model/gltf-binary"
                onChange={handleNewModelFile}
              />
            </Button>
            {newProduct.file_name && (
              <Chip
                label={newProduct.file_name}
                color="primary"
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
              />
            )}
            <TextField
              label="Urun adi"
              size="small"
              value={newProduct.name}
              onChange={(event) =>
                setNewProduct((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
            <TextField
              select
              label="Kategori"
              size="small"
              value={newProduct.category}
              onChange={(event) =>
                setNewProduct((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            >
              {catalogGroups.map((group) => (
                <MenuItem key={group.key} value={group.key}>
                  {group.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fiyat"
              type="number"
              size="small"
              value={newProduct.base_price}
              onChange={(event) =>
                setNewProduct((current) => ({
                  ...current,
                  base_price: event.target.value,
                }))
              }
            />
            <Grid container spacing={1}>
              {[
                ["min_width", "Min genislik"],
                ["max_width", "Max genislik"],
                ["min_height", "Min yukseklik"],
                ["max_height", "Max yukseklik"],
              ].map(([field, label]) => (
                <Grid item xs={6} key={field}>
                  <TextField
                    fullWidth
                    label={label}
                    type="number"
                    size="small"
                    value={newProduct[field]}
                    onChange={(event) =>
                      setNewProduct((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                  />
                </Grid>
              ))}
            </Grid>
            <Button
              variant="contained"
              onClick={addManualProduct}
              disabled={!newProduct.name || !newProduct.model_url}
              sx={{ textTransform: "none", fontWeight: 900 }}
            >
              Urunu Kataloga Ekle
            </Button>
          </Stack>
        </ClickAwayListener>
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
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Urun Yonetimi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedProduct.sku} -{" "}
                    {getProductCategoryLabel(selectedProduct.category)}
                  </Typography>
                </Box>
                <IconButton onClick={onCloseProduct}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              <Box
                component="img"
                src={
                  selectedProduct.image_url ||
                  "/images/kitchen/base-cabinet.svg"
                }
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
              <TextField
                label="Urun adi"
                size="small"
                value={selectedProduct.name}
                onChange={(event) =>
                  updateSelectedProductField("name", event.target.value)
                }
              />
              <TextField
                label="Urun fiyati"
                type="number"
                size="small"
                value={selectedProduct.base_price || 0}
                onChange={(event) =>
                  updateSelectedProductField("base_price", event.target.value)
                }
                helperText="Sahneye eklenen bu urunun ana fiyatini belirler."
              />
              <TextField
                label="Urun resmi"
                size="small"
                value={selectedProduct.image_url || ""}
                onChange={(event) =>
                  updateSelectedProductField("image_url", event.target.value)
                }
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
                onChange={(event) =>
                  updateSelectedProductField("category", event.target.value)
                }
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
                onChange={(event) =>
                  updateSelectedProduct("min_width", event.target.value)
                }
              />
              <TextField
                label="Maksimum genislik"
                type="number"
                size="small"
                value={selectedProduct.constraints?.max_width || 0}
                onChange={(event) =>
                  updateSelectedProduct("max_width", event.target.value)
                }
              />
              <TextField
                label="Minimum yukseklik"
                type="number"
                size="small"
                value={selectedProduct.constraints?.min_height || 0}
                onChange={(event) =>
                  updateSelectedProduct("min_height", event.target.value)
                }
              />
              <TextField
                label="Maksimum yukseklik"
                type="number"
                size="small"
                value={selectedProduct.constraints?.max_height || 0}
                onChange={(event) =>
                  updateSelectedProduct("max_height", event.target.value)
                }
              />
              <Typography variant="caption" color="text.secondary">
                Bu aralik sahnedeki genislik/yukseklik degistirme ve kose
                tutamaclari icin sinir olarak kullanilir.
              </Typography>
            </Stack>
          </ClickAwayListener>
        )}
      </Drawer>
    </>
  );
};

export default KitchenCatalogManager;
