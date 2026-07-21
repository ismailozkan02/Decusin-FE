import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Dialog,
  DialogContent,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  categoryLabel,
  getProductSubcategory,
  getSubcategoryLabel,
  materialModifierLabel,
  money,
} from "../kitchenUtils";

const productPageSize = 8;
const materialPageSize = 10;

const defaultMaterialGroups = [
  {
    key: "door",
    title: "Kapak Malzemeleri",
    subcategories: [
      { key: "door_lacquer", title: "Lake Kapaklar" },
      { key: "door_wood", title: "Ahşap Kapaklar" },
      { key: "door_matte", title: "Mat / Saten Kapaklar" },
    ],
  },
  {
    key: "glass",
    title: "Cam Çeşitleri",
    subcategories: [
      { key: "glass_clear", title: "Şeffaf Cam" },
      { key: "glass_smoked", title: "Füme Cam" },
      { key: "glass_patterned", title: "Fitilli / Desenli Cam" },
    ],
  },
  {
    key: "countertop",
    title: "Tezgah Malzemeleri",
    subcategories: [
      { key: "counter_quartz", title: "Kuvars" },
      { key: "counter_wood", title: "Ahşap" },
      { key: "counter_stone", title: "Taş / Granit" },
    ],
  },
];

const previewByCategory = {
  base_cabinet: "/images/kitchen/base-cabinet-premium.svg",
  wall_cabinet: "/images/kitchen/wall-cabinet-glass-premium.svg",
  countertop: "/images/kitchen/countertop-long-slab-premium.svg",
  appliance: "/images/kitchen/sink-steel-premium.svg",
  shelf: "/images/kitchen/open-shelf-premium.svg",
  room: "/images/kitchen/kitchen-layout-linear-premium.svg",
};

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

const getMaterialSubcategory = (material) => {
  if (material?.subcategory) return material.subcategory;
  const text = `${material?.name || ""} ${material?.code || ""}`.toLocaleLowerCase(
    "tr-TR",
  );

  if (material?.type === "door") {
    if (text.includes("ahsap") || text.includes("meşe") || text.includes("wood"))
      return "door_wood";
    if (text.includes("antrasit") || text.includes("lacivert") || text.includes("saten"))
      return "door_matte";
    return "door_lacquer";
  }

  if (material?.type === "glass") {
    if (text.includes("füme") || text.includes("fume") || text.includes("smoke"))
      return "glass_smoked";
    if (text.includes("fitil") || text.includes("desen")) return "glass_patterned";
    return "glass_clear";
  }

  if (material?.type === "countertop") {
    if (text.includes("ahsap") || text.includes("wood")) return "counter_wood";
    if (text.includes("granit") || text.includes("stone") || text.includes("siyah"))
      return "counter_stone";
    return "counter_quartz";
  }

  return "standard";
};

const cardSx = {
  border: "1px solid rgba(148,163,184,0.26)",
  borderRadius: 1,
  background: "#FFFFFF",
  boxShadow: "0 16px 34px rgba(15,23,42,0.06)",
};

const KitchenCatalogManager = ({
  catalogItems,
  catalogGroups,
  materials,
  selectedProduct,
  selectedMaterial,
  onSelectProduct,
  onCloseProduct,
  onUpdateProduct,
  onAddProduct,
  onAddCatalogGroup,
  onSelectMaterial,
  onCloseMaterial,
  onUpdateMaterial,
}) => {
  const firstProductCategory = catalogGroups[0]?.key || "base_cabinet";
  const firstMaterialCategory = defaultMaterialGroups[0]?.key || "door";
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductCategory, setActiveProductCategory] =
    useState(firstProductCategory);
  const [activeProductSubcategories, setActiveProductSubcategories] = useState({});
  const [activeMaterialCategory, setActiveMaterialCategory] =
    useState(firstMaterialCategory);
  const [activeMaterialSubcategories, setActiveMaterialSubcategories] = useState({});
  const [productPage, setProductPage] = useState(1);
  const [materialPage, setMaterialPage] = useState(1);
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [materialGroups, setMaterialGroups] = useState(defaultMaterialGroups);
  const [categoryForm, setCategoryForm] = useState({
    target: "product_category",
    parentKey: firstProductCategory,
    title: "",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: firstProductCategory,
    subcategory: "",
    base_price: 0,
    min_width: 40,
    max_width: 120,
    min_height: 40,
    max_height: 120,
    model_url: "",
    file_name: "",
  });

  const productGroup =
    catalogGroups.find((group) => group.key === activeProductCategory) ||
    catalogGroups[0];
  const productSubcategories = productGroup?.subcategories?.length
    ? productGroup.subcategories
    : [{ key: "standard", title: "Tüm Ürünler" }];
  const activeProductSubcategory =
    activeProductSubcategories[productGroup?.key] || productSubcategories[0]?.key;
  const productGroupItems = catalogItems.filter(
    (product) => product.category === productGroup?.key,
  );
  const filteredProducts =
    productGroup?.subcategories?.length && activeProductSubcategory !== "standard"
      ? productGroupItems.filter(
          (product) => getProductSubcategory(product) === activeProductSubcategory,
        )
      : productGroupItems;
  const pagedProducts = filteredProducts.slice(
    (productPage - 1) * productPageSize,
    productPage * productPageSize,
  );

  const materialGroup =
    materialGroups.find((group) => group.key === activeMaterialCategory) ||
    materialGroups[0];
  const materialSubcategories = materialGroup?.subcategories?.length
    ? materialGroup.subcategories
    : [{ key: "standard", title: "Tüm Malzemeler" }];
  const activeMaterialSubcategory =
    activeMaterialSubcategories[materialGroup?.key] || materialSubcategories[0]?.key;
  const materialGroupItems = materials.filter(
    (material) => material.type === materialGroup?.key,
  );
  const filteredMaterials =
    materialGroup?.subcategories?.length && activeMaterialSubcategory !== "standard"
      ? materialGroupItems.filter(
          (material) =>
            getMaterialSubcategory(material) === activeMaterialSubcategory,
        )
      : materialGroupItems;
  const pagedMaterials = filteredMaterials.slice(
    (materialPage - 1) * materialPageSize,
    materialPage * materialPageSize,
  );

  const getDefaultProductSubcategory = (category) =>
    catalogGroups.find((group) => group.key === category)?.subcategories?.[0]?.key ||
    "";

  const getProductCategoryLabel = (value) =>
    catalogGroups.find((group) => group.key === value)?.title ||
    categoryLabel(value);

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
    if (!newProduct.name.trim()) return;
    const category = newProduct.category || firstProductCategory;
    const subcategory =
      newProduct.subcategory || getDefaultProductSubcategory(category);
    const minWidth = Math.max(Number(newProduct.min_width) || 1, 1);
    const maxWidth = Math.max(Number(newProduct.max_width) || minWidth, minWidth);
    const minHeight = Math.max(Number(newProduct.min_height) || 1, 1);
    const maxHeight = Math.max(Number(newProduct.max_height) || minHeight, minHeight);

    const product = {
      id: `manual-${Date.now()}`,
      sku: `MAN-${Date.now().toString().slice(-6)}`,
      name: newProduct.name.trim(),
      category,
      subcategory,
      dimensions: {
        width: Math.round((minWidth + maxWidth) / 2),
        height: Math.round((minHeight + maxHeight) / 2),
        depth: category === "wall_cabinet" ? 34 : 56,
        unit: "cm",
      },
      constraints: {
        min_width: minWidth,
        max_width: maxWidth,
        min_height: minHeight,
        max_height: maxHeight,
      },
      image_url:
        previewByCategory[category] || "/images/kitchen/base-cabinet-premium.svg",
      model_url: newProduct.model_url || "",
      original_file_name: newProduct.file_name,
      base_price: Math.max(Number(newProduct.base_price) || 0, 0),
      is_manual: true,
    };

    onAddProduct(product);
    setActiveProductCategory(category);
    setActiveProductSubcategories((current) => ({ ...current, [category]: subcategory }));
    setProductPage(1);
    setProductDrawerOpen(false);
  };

  const addCategory = () => {
    const title = categoryForm.title.trim();
    if (!title) return;
    const baseKey = slugify(title) || `kategori_${Date.now()}`;

    if (categoryForm.target === "product_category") {
      const key = catalogGroups.some((group) => group.key === baseKey)
        ? `${baseKey}_${Date.now().toString().slice(-4)}`
        : baseKey;
      onAddCatalogGroup({ key, title, subcategories: [] });
      setActiveProductCategory(key);
      setActiveTab("products");
    }

    if (categoryForm.target === "product_subcategory") {
      const parentKey = categoryForm.parentKey || firstProductCategory;
      const parent = catalogGroups.find((group) => group.key === parentKey);
      const key = parent?.subcategories?.some((item) => item.key === baseKey)
        ? `${baseKey}_${Date.now().toString().slice(-4)}`
        : baseKey;
      onAddCatalogGroup({ key, title, parentKey });
      setActiveProductCategory(parentKey);
      setActiveProductSubcategories((current) => ({ ...current, [parentKey]: key }));
      setActiveTab("products");
    }

    if (categoryForm.target === "material_category") {
      const key = materialGroups.some((group) => group.key === baseKey)
        ? `${baseKey}_${Date.now().toString().slice(-4)}`
        : baseKey;
      setMaterialGroups((current) => [...current, { key, title, subcategories: [] }]);
      setActiveMaterialCategory(key);
      setActiveTab("materials");
    }

    if (categoryForm.target === "material_subcategory") {
      const parentKey = categoryForm.parentKey || firstMaterialCategory;
      const parent = materialGroups.find((group) => group.key === parentKey);
      const key = parent?.subcategories?.some((item) => item.key === baseKey)
        ? `${baseKey}_${Date.now().toString().slice(-4)}`
        : baseKey;
      setMaterialGroups((current) =>
        current.map((group) =>
          group.key === parentKey
            ? {
                ...group,
                subcategories: [...(group.subcategories || []), { key, title }],
              }
            : group,
        ),
      );
      setActiveMaterialCategory(parentKey);
      setActiveMaterialSubcategories((current) => ({ ...current, [parentKey]: key }));
      setActiveTab("materials");
    }

    setCategoryForm({
      target: "product_category",
      parentKey: firstProductCategory,
      title: "",
    });
    setProductPage(1);
    setMaterialPage(1);
    setCategoryDrawerOpen(false);
  };

  const stats = useMemo(
    () => ({
      products: catalogItems.length,
      materials: materials.length,
      categories: catalogGroups.length + materialGroups.length,
      models: catalogItems.filter((item) => item.model_url).length,
    }),
    [catalogGroups.length, catalogItems, materialGroups.length, materials.length],
  );

  return (
    <>
      <Stack spacing={1.5}>
        <Paper
          elevation={0}
          sx={{
            ...cardSx,
            p: 1.5,
            background:
              "linear-gradient(135deg, #FFFFFF 0%, #F3F8FF 52%, #EEF6FF 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Box>
              <Typography variant="overline" sx={{ color: "#2563EB", fontWeight: 950 }}>
                Yönetim Merkezi
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 950 }}>
                Ürün ve Malzeme Yönetimi
              </Typography>
              <Typography color="text.secondary">
                Kategori, alt kategori, ürün ve malzeme varyantlarını profesyonel
                katalog düzeninde yönetin.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<CategoryOutlinedIcon />}
                onClick={() => setCategoryDrawerOpen(true)}
                sx={{ borderRadius: 1, textTransform: "none", fontWeight: 900 }}
              >
                Kategori / Alt Kategori
              </Button>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setProductDrawerOpen(true)}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 900,
                  boxShadow: "0 12px 26px rgba(37,99,235,0.22)",
                }}
              >
                Ürün Ekle
              </Button>
            </Stack>
          </Stack>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {[
              ["Ürün", stats.products],
              ["Malzeme", stats.materials],
              ["Kategori", stats.categories],
              ["3D Model", stats.models],
            ].map(([label, value]) => (
              <Grid item xs={6} md={3} key={label}>
                <Box
                  sx={{
                    border: "1px solid rgba(148,163,184,0.22)",
                    borderRadius: 1,
                    p: 1,
                    bgcolor: "rgba(255,255,255,0.72)",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: 22, fontWeight: 950 }}>
                    {value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ ...cardSx, p: 0.8 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="standard"
            sx={{
              minHeight: 44,
              p: 0.45,
              bgcolor: "#EEF3FA",
              borderRadius: 1,
              "& .MuiTab-root": {
                minHeight: 44,
                flex: 1,
                borderRadius: 1,
                fontWeight: 950,
                textTransform: "none",
                color: "#64748B",
              },
              "& .Mui-selected": {
                bgcolor: "#FFFFFF",
                color: "#0F172A !important",
                boxShadow: "0 10px 22px rgba(15,23,42,0.1)",
              },
              "& .MuiTabs-indicator": { display: "none" },
            }}
          >
            <Tab value="products" label="Ürünler" />
            <Tab value="materials" label="Malzemeler" />
          </Tabs>
        </Paper>

        {activeTab === "products" ? (
          <CatalogWorkbench
            mode="products"
            groups={catalogGroups}
            items={catalogItems}
            activeCategory={activeProductCategory}
            activeSubcategory={activeProductSubcategory}
            page={productPage}
            pageSize={productPageSize}
            pagedItems={pagedProducts}
            filteredCount={filteredProducts.length}
            onCategoryChange={(key) => {
              setActiveProductCategory(key);
              setProductPage(1);
            }}
            onSubcategoryChange={(categoryKey, subcategoryKey) => {
              setActiveProductSubcategories((current) => ({
                ...current,
                [categoryKey]: subcategoryKey,
              }));
              setProductPage(1);
            }}
            onPageChange={(_, value) => setProductPage(value)}
            onSelectItem={onSelectProduct}
            renderCard={(product) => (
              <ProductCard
                product={product}
                catalogGroups={catalogGroups}
                selected={selectedProduct?.id === product.id}
              />
            )}
          />
        ) : (
          <CatalogWorkbench
            mode="materials"
            groups={materialGroups}
            items={materials}
            activeCategory={activeMaterialCategory}
            activeSubcategory={activeMaterialSubcategory}
            page={materialPage}
            pageSize={materialPageSize}
            pagedItems={pagedMaterials}
            filteredCount={filteredMaterials.length}
            getItemCategory={(item) => item.type}
            getItemSubcategory={getMaterialSubcategory}
            onCategoryChange={(key) => {
              setActiveMaterialCategory(key);
              setMaterialPage(1);
            }}
            onSubcategoryChange={(categoryKey, subcategoryKey) => {
              setActiveMaterialSubcategories((current) => ({
                ...current,
                [categoryKey]: subcategoryKey,
              }));
              setMaterialPage(1);
            }}
            onPageChange={(_, value) => setMaterialPage(value)}
            onSelectItem={onSelectMaterial}
            renderCard={(material) => (
              <MaterialCard
                material={material}
                selected={selectedMaterial?.id === material.id}
              />
            )}
          />
        )}
      </Stack>

      <CategoryDrawer
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        form={categoryForm}
        setForm={setCategoryForm}
        productGroups={catalogGroups}
        materialGroups={materialGroups}
        addCategory={addCategory}
      />
      <ProductDrawer
        open={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
        catalogGroups={catalogGroups}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        getDefaultProductSubcategory={getDefaultProductSubcategory}
        handleNewModelFile={handleNewModelFile}
        addManualProduct={addManualProduct}
      />
      <SelectedProductDrawer
        selectedProduct={selectedProduct}
        catalogGroups={catalogGroups}
        onCloseProduct={onCloseProduct}
        onUpdateProduct={onUpdateProduct}
        updateSelectedProduct={updateSelectedProduct}
        updateSelectedProductField={updateSelectedProductField}
        getDefaultProductSubcategory={getDefaultProductSubcategory}
        getProductCategoryLabel={getProductCategoryLabel}
      />
      <SelectedMaterialDrawer
        selectedMaterial={selectedMaterial}
        materialGroups={materialGroups}
        onCloseMaterial={onCloseMaterial}
        updateSelectedMaterial={updateSelectedMaterial}
      />
    </>
  );
};

const CatalogWorkbench = ({
  mode,
  groups,
  items,
  activeCategory,
  activeSubcategory,
  page,
  pageSize,
  pagedItems,
  filteredCount,
  getItemCategory = (item) => item.category,
  getItemSubcategory = getProductSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  onPageChange,
  onSelectItem,
  renderCard,
}) => (
  <Grid container spacing={1.3}>
    <Grid item xs={12} md={3.4}>
      <Paper elevation={0} sx={{ ...cardSx, p: 1, minHeight: 560 }}>
        <Typography sx={{ px: 1, py: 0.8, fontWeight: 950 }}>
          Ana Kategoriler
        </Typography>
        <Stack spacing={0.8}>
          {groups.map((group) => {
            const groupItems = items.filter((item) => getItemCategory(item) === group.key);
            const expanded = activeCategory === group.key;
            const subcategories = group.subcategories?.length
              ? group.subcategories
              : [{ key: "standard", title: "Tüm Liste" }];
            return (
              <Accordion
                key={group.key}
                expanded={expanded}
                onChange={() => onCategoryChange(group.key)}
                disableGutters
                elevation={0}
                sx={{
                  border: "1px solid rgba(148,163,184,0.25)",
                  borderRadius: "6px !important",
                  overflow: "hidden",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: expanded ? "#2563EB" : "#EFF6FF",
                        color: expanded ? "#FFFFFF" : "#2563EB",
                      }}
                    >
                      <CategoryOutlinedIcon sx={{ fontSize: 17 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 950 }} noWrap>
                        {group.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {groupItems.length} {mode === "products" ? "ürün" : "malzeme"}
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0.2 }}>
                  <Stack spacing={0.5}>
                    {subcategories.map((subcategory) => {
                      const count = groupItems.filter(
                        (item) =>
                          !group.subcategories?.length ||
                          getItemSubcategory(item) === subcategory.key,
                      ).length;
                      const active = expanded && activeSubcategory === subcategory.key;
                      return (
                        <Box
                          key={subcategory.key}
                          component="button"
                          type="button"
                          onClick={() => onSubcategoryChange(group.key, subcategory.key)}
                          style={{ border: 0, textAlign: "left" }}
                          sx={{
                            borderRadius: 0.8,
                            px: 1,
                            py: 0.8,
                            cursor: "pointer",
                            bgcolor: active ? "#EFF6FF" : "transparent",
                            color: active ? "#1D4ED8" : "#475569",
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" spacing={1}>
                            <Typography sx={{ fontSize: 13, fontWeight: 900 }} noWrap>
                              {subcategory.title}
                            </Typography>
                            <Typography sx={{ fontSize: 12, fontWeight: 900 }}>
                              {count}
                            </Typography>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      </Paper>
    </Grid>
    <Grid item xs={12} md={8.6}>
      <Paper elevation={0} sx={{ ...cardSx, p: 1.2, minHeight: 560 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 950 }}>
              {mode === "products" ? "Ürün Listesi" : "Malzeme Listesi"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seçili alt kategoriye ait kayıtlar
            </Typography>
          </Box>
          <Chip
            label={`${filteredCount} kayıt`}
            sx={{ borderRadius: 1, fontWeight: 900 }}
          />
        </Stack>
        <Grid container spacing={1}>
          {pagedItems.map((item) => (
            <Grid item xs={12} sm={mode === "products" ? 6 : 4} key={item.id}>
              <Box onClick={() => onSelectItem(item)}>{renderCard(item)}</Box>
            </Grid>
          ))}
        </Grid>
        <Stack alignItems="center" sx={{ pt: 1.4 }}>
          <Pagination
            page={page}
            count={Math.max(Math.ceil(filteredCount / pageSize), 1)}
            onChange={onPageChange}
            color="primary"
            shape="rounded"
          />
        </Stack>
      </Paper>
    </Grid>
  </Grid>
);

const ProductCard = ({ product, catalogGroups, selected }) => (
  <Paper
    elevation={0}
    sx={{
      border: selected ? "2px solid #2563EB" : "1px solid rgba(148,163,184,0.28)",
      borderRadius: 1,
      p: 1,
      cursor: "pointer",
      background: selected
        ? "linear-gradient(145deg, #EFF6FF, #FFFFFF)"
        : "linear-gradient(145deg, #FFFFFF, #F8FBFF)",
      boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
      transition: "transform 140ms ease, box-shadow 140ms ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 16px 32px rgba(15,23,42,0.11)",
      },
    }}
  >
    <Stack direction="row" spacing={1.1}>
      <Box
        component="img"
        src={product.image_url || "/images/kitchen/base-cabinet.svg"}
        alt={product.name}
        sx={{
          width: 112,
          height: 92,
          objectFit: "contain",
          borderRadius: 1,
          border: "1px solid rgba(148,163,184,0.26)",
          background: "linear-gradient(145deg, #F8FBFF, #EAF2FB)",
          p: 0.6,
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Typography sx={{ fontWeight: 950 }} noWrap>
            {product.name}
          </Typography>
          <TuneIcon color="primary" fontSize="small" />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {product.sku} · {getSubcategoryLabel(catalogGroups, product) || product.category}
        </Typography>
        <Stack direction="row" spacing={0.6} sx={{ mt: 1, flexWrap: "wrap" }}>
          <Chip
            size="small"
            label={`${product.dimensions?.width || 0} x ${product.dimensions?.height || 0} cm`}
            sx={{ borderRadius: 0.8, fontWeight: 800 }}
          />
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={money(product.base_price)}
            sx={{ borderRadius: 0.8, fontWeight: 900 }}
          />
        </Stack>
      </Box>
    </Stack>
  </Paper>
);

const MaterialCard = ({ material, selected }) => (
  <Paper
    elevation={0}
    sx={{
      border: selected ? "2px solid #2563EB" : "1px solid rgba(148,163,184,0.28)",
      borderRadius: 1,
      p: 1,
      cursor: "pointer",
      bgcolor: "#FFFFFF",
      boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
    }}
  >
    <Stack direction="row" spacing={1}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 1,
          bgcolor: material.color_hex || "#CBD5E1",
          border: "1px solid rgba(148,163,184,0.45)",
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 950 }} noWrap>
          {material.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {material.code} · {materialModifierLabel(material)}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const DrawerHeader = ({ title, subtitle, onClose }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 950 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
    <IconButton onClick={onClose}>
      <CloseIcon />
    </IconButton>
  </Stack>
);

const CategoryDrawer = ({
  open,
  onClose,
  form,
  setForm,
  productGroups,
  materialGroups,
  addCategory,
}) => {
  const parentGroups = form.target.startsWith("material")
    ? materialGroups
    : productGroups;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          overflow: "hidden",
          background: "linear-gradient(145deg, #FFFFFF 0%, #F6FAFF 100%)",
          border: "1px solid rgba(148,163,184,0.28)",
          boxShadow: "0 30px 80px rgba(15,23,42,0.24)",
        },
      }}
    >
      <DialogContent sx={{ p: 2.4 }}>
        <Stack spacing={2}>
          <DrawerHeader title="Kategori Oluştur" subtitle="Ana kategori veya alt kategori ekleyin." onClose={onClose} />
          <TextField select label="Yapı tipi" size="small" value={form.target} onChange={(event) => setForm((current) => ({ ...current, target: event.target.value, parentKey: parentGroups[0]?.key || "" }))}>
            <MenuItem value="product_category">Ürün ana kategorisi</MenuItem>
            <MenuItem value="product_subcategory">Ürün alt kategorisi</MenuItem>
            <MenuItem value="material_category">Malzeme ana kategorisi</MenuItem>
            <MenuItem value="material_subcategory">Malzeme alt kategorisi</MenuItem>
          </TextField>
          {form.target.endsWith("subcategory") && (
            <TextField select label="Bağlı ana kategori" size="small" value={form.parentKey} onChange={(event) => setForm((current) => ({ ...current, parentKey: event.target.value }))}>
              {parentGroups.map((group) => (
                <MenuItem key={group.key} value={group.key}>
                  {group.title}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField label={form.target.endsWith("subcategory") ? "Alt kategori adı" : "Ana kategori adı"} size="small" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <Button variant="contained" startIcon={<CategoryOutlinedIcon />} onClick={addCategory} disabled={!form.title.trim()} sx={{ borderRadius: 1, textTransform: "none", fontWeight: 900 }}>
            Kaydet
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

const ProductDrawer = ({
  open,
  onClose,
  catalogGroups,
  newProduct,
  setNewProduct,
  getDefaultProductSubcategory,
  handleNewModelFile,
  addManualProduct,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 1,
        overflow: "hidden",
        background: "linear-gradient(145deg, #FFFFFF 0%, #F6FAFF 100%)",
        border: "1px solid rgba(148,163,184,0.28)",
        boxShadow: "0 30px 80px rgba(15,23,42,0.24)",
      },
    }}
  >
    <DialogContent sx={{ p: 2.4 }}>
      <Stack spacing={2}>
        <DrawerHeader title="Ürün Ekle" subtitle="Kategori, ölçü ve model bilgilerini girin." onClose={onClose} />
        <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} sx={{ borderRadius: 1, textTransform: "none", fontWeight: 900 }}>
          GLTF / GLB Dosyası Seç
          <input hidden type="file" accept=".gltf,.glb,model/gltf+json,model/gltf-binary" onChange={handleNewModelFile} />
        </Button>
        {newProduct.file_name && <Chip label={newProduct.file_name} color="primary" variant="outlined" sx={{ alignSelf: "flex-start" }} />}
        <TextField label="Ürün adı" size="small" value={newProduct.name} onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))} />
        <TextField select label="Ana kategori" size="small" value={newProduct.category} onChange={(event) => setNewProduct((current) => ({ ...current, category: event.target.value, subcategory: getDefaultProductSubcategory(event.target.value) }))}>
          {catalogGroups.map((group) => (
            <MenuItem key={group.key} value={group.key}>
              {group.title}
            </MenuItem>
          ))}
        </TextField>
        {catalogGroups.find((group) => group.key === newProduct.category)?.subcategories?.length ? (
          <TextField select label="Alt kategori" size="small" value={newProduct.subcategory || getDefaultProductSubcategory(newProduct.category)} onChange={(event) => setNewProduct((current) => ({ ...current, subcategory: event.target.value }))}>
            {catalogGroups.find((group) => group.key === newProduct.category)?.subcategories?.map((subcategory) => (
              <MenuItem key={subcategory.key} value={subcategory.key}>
                {subcategory.title}
              </MenuItem>
            ))}
          </TextField>
        ) : null}
        <TextField label="Fiyat" type="number" size="small" value={newProduct.base_price} onChange={(event) => setNewProduct((current) => ({ ...current, base_price: event.target.value }))} />
        <Grid container spacing={1}>
          {[
            ["min_width", "Min genişlik"],
            ["max_width", "Max genişlik"],
            ["min_height", "Min yükseklik"],
            ["max_height", "Max yükseklik"],
          ].map(([field, label]) => (
            <Grid item xs={6} key={field}>
              <TextField fullWidth label={label} type="number" size="small" value={newProduct[field]} onChange={(event) => setNewProduct((current) => ({ ...current, [field]: event.target.value }))} />
            </Grid>
          ))}
        </Grid>
        <Button variant="contained" onClick={addManualProduct} disabled={!newProduct.name.trim()} sx={{ borderRadius: 1, textTransform: "none", fontWeight: 900 }}>
          Ürünü Kataloga Ekle
        </Button>
      </Stack>
    </DialogContent>
  </Dialog>
);

const SelectedProductDrawer = ({
  selectedProduct,
  catalogGroups,
  onCloseProduct,
  onUpdateProduct,
  updateSelectedProduct,
  updateSelectedProductField,
  getDefaultProductSubcategory,
  getProductCategoryLabel,
}) => (
  <Drawer anchor="right" open={Boolean(selectedProduct)} onClose={onCloseProduct} variant="persistent" PaperProps={{ sx: { width: { xs: 330, sm: 430 }, p: 2, top: 0, height: "100%", borderLeft: "1px solid #E2E8F0", boxShadow: "-16px 0 42px rgba(15,23,42,0.14)", zIndex: 1300 } }}>
    {selectedProduct && (
      <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={onCloseProduct}>
        <Stack spacing={2}>
          <DrawerHeader title="Ürün Yönetimi" subtitle={`${selectedProduct.sku} · ${getProductCategoryLabel(selectedProduct.category)}`} onClose={onCloseProduct} />
          <Box component="img" src={selectedProduct.image_url || "/images/kitchen/base-cabinet.svg"} alt={selectedProduct.name} sx={{ width: "100%", height: 170, objectFit: "contain", borderRadius: 1, border: "1px solid rgba(148,163,184,0.28)", background: "linear-gradient(145deg, #F8FBFF, #EAF2FB)", p: 1 }} />
          <TextField label="Ürün adı" size="small" value={selectedProduct.name} onChange={(event) => updateSelectedProductField("name", event.target.value)} />
          <TextField label="Ürün fiyatı" type="number" size="small" value={selectedProduct.base_price || 0} onChange={(event) => updateSelectedProductField("base_price", event.target.value)} />
          <TextField label="Ürün resmi" size="small" value={selectedProduct.image_url || ""} onChange={(event) => updateSelectedProductField("image_url", event.target.value)} />
          <TextField label="3D model dosyası" size="small" value={selectedProduct.model_url || ""} onChange={(event) => onUpdateProduct(selectedProduct.id, (product) => ({ ...product, model_url: event.target.value }))} />
          <TextField select label="Ana kategori" size="small" value={selectedProduct.category} onChange={(event) => onUpdateProduct(selectedProduct.id, (product) => ({ ...product, category: event.target.value, subcategory: getDefaultProductSubcategory(event.target.value) }))}>
            {catalogGroups.map((group) => (
              <MenuItem key={group.key} value={group.key}>
                {group.title}
              </MenuItem>
            ))}
          </TextField>
          {catalogGroups.find((group) => group.key === selectedProduct.category)?.subcategories?.length ? (
            <TextField select label="Alt kategori" size="small" value={getProductSubcategory(selectedProduct)} onChange={(event) => updateSelectedProductField("subcategory", event.target.value)}>
              {catalogGroups.find((group) => group.key === selectedProduct.category)?.subcategories?.map((subcategory) => (
                <MenuItem key={subcategory.key} value={subcategory.key}>
                  {subcategory.title}
                </MenuItem>
              ))}
            </TextField>
          ) : null}
          {[
            ["min_width", "Minimum genişlik"],
            ["max_width", "Maksimum genişlik"],
            ["min_height", "Minimum yükseklik"],
            ["max_height", "Maksimum yükseklik"],
          ].map(([field, label]) => (
            <TextField key={field} label={label} type="number" size="small" value={selectedProduct.constraints?.[field] || 0} onChange={(event) => updateSelectedProduct(field, event.target.value)} />
          ))}
        </Stack>
      </ClickAwayListener>
    )}
  </Drawer>
);

const SelectedMaterialDrawer = ({
  selectedMaterial,
  materialGroups,
  onCloseMaterial,
  updateSelectedMaterial,
}) => (
  <Drawer anchor="right" open={Boolean(selectedMaterial)} onClose={onCloseMaterial} variant="persistent" PaperProps={{ sx: { width: { xs: 330, sm: 420 }, p: 2, top: 0, height: "100%", borderLeft: "1px solid #E2E8F0", boxShadow: "-16px 0 42px rgba(15,23,42,0.14)", zIndex: 1300 } }}>
    {selectedMaterial && (
      <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={onCloseMaterial}>
        <Stack spacing={2}>
          <DrawerHeader title="Malzeme Yönetimi" subtitle={selectedMaterial.code} onClose={onCloseMaterial} />
          <TextField label="Malzeme adı" size="small" value={selectedMaterial.name} onChange={(event) => updateSelectedMaterial("name", event.target.value)} />
          <TextField select label="Ana kategori" size="small" value={selectedMaterial.type} onChange={(event) => updateSelectedMaterial("type", event.target.value)}>
            {materialGroups.map((group) => (
              <MenuItem key={group.key} value={group.key}>
                {group.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Renk kodu" size="small" value={selectedMaterial.color_hex || ""} onChange={(event) => updateSelectedMaterial("color_hex", event.target.value)} />
          <TextField label="Önizleme model dosyası" size="small" value={selectedMaterial.preview_model_url || ""} onChange={(event) => updateSelectedMaterial("preview_model_url", event.target.value)} />
          <TextField label="Fiyat etkisi" type="number" size="small" value={selectedMaterial.price_modifier || 0} onChange={(event) => updateSelectedMaterial("price_modifier", event.target.value)} />
          <TextField select label="Fiyat tipi" size="small" value={selectedMaterial.modifier_type} onChange={(event) => updateSelectedMaterial("modifier_type", event.target.value)}>
            <MenuItem value="percent">Yüzde</MenuItem>
            <MenuItem value="fixed">Sabit</MenuItem>
          </TextField>
        </Stack>
      </ClickAwayListener>
    )}
  </Drawer>
);

export default KitchenCatalogManager;
