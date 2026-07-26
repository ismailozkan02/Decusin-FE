import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  CircularProgress,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  categoryLabel,
  getProductSubcategory,
  getSubcategoryLabel,
  materialModifierLabel,
  money,
} from "../kitchenUtils";
import PremiumDialog from "./PremiumDialog";

const productPageSize = 8;
const materialPageSize = 10;

const previewByCategory = {
  base_cabinet: "/images/kitchen/products/lightweight/kitchenCabinet.png",
  wall_cabinet: "/images/kitchen/products/lightweight/kitchenCabinetUpper.png",
  countertop: "/images/kitchen/products/lightweight/kitchenBar.png",
  sink: "/images/kitchen/products/lightweight/kitchenSink.png",
  cooktop: "/images/kitchen/products/lightweight/kitchenStoveElectric.png",
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
  const text =
    `${material?.name || ""} ${material?.code || ""}`.toLocaleLowerCase(
      "tr-TR",
    );

  if (material?.type === "door") {
    if (
      text.includes("ahsap") ||
      text.includes("meşe") ||
      text.includes("wood")
    )
      return "door_wood";
    if (
      text.includes("antrasit") ||
      text.includes("lacivert") ||
      text.includes("saten")
    )
      return "door_matte";
    return "door_lacquer";
  }

  if (material?.type === "glass") {
    if (
      text.includes("füme") ||
      text.includes("fume") ||
      text.includes("smoke")
    )
      return "glass_smoked";
    if (text.includes("fitil") || text.includes("desen"))
      return "glass_patterned";
    return "glass_clear";
  }

  if (material?.type === "countertop") {
    if (text.includes("ahsap") || text.includes("wood")) return "counter_wood";
    if (
      text.includes("granit") ||
      text.includes("stone") ||
      text.includes("siyah")
    )
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

const premiumDrawerFieldSx = {
  mt: "10px !important",
  "& .MuiInputLabel-root": {
    px: 0.5,
    bgcolor: "#FFFFFF",
    borderRadius: 0.5,
  },
  "& .MuiInputLabel-shrink": {
    transform: "translate(14px, -9px) scale(0.75)",
  },
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    borderRadius: 1,
  },
};

const KitchenCatalogManager = ({
  catalogItems,
  catalogGroups,
  materialGroups: materialGroupsProp,
  materials,
  catalogStats,
  selectedProduct,
  selectedMaterial,
  onSelectProduct,
  onCloseProduct,
  onUpdateProduct,
  onSaveProduct,
  onDeleteProduct,
  onAddProduct,
  loading = false,
  onLoadCatalogItems,
  onUploadFile,
  onAddCatalogGroup,
  onUpdateCatalogGroup,
  onDeleteCatalogGroup,
  onSelectMaterial,
  onCloseMaterial,
  onUpdateMaterial,
  onAddMaterial,
  onDeleteMaterial,
  onLoadMaterials,
  onEnsureMaterialCatalog,
}) => {
  const firstProductCategory = catalogGroups[0]?.key || "base_cabinet";
  const materialGroups = materialGroupsProp || [];
  const firstMaterialCategory = materialGroups[0]?.key || "door";
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductCategory, setActiveProductCategory] =
    useState(firstProductCategory);
  const [activeProductSubcategories, setActiveProductSubcategories] = useState(
    {},
  );
  const [activeMaterialCategory, setActiveMaterialCategory] = useState(
    firstMaterialCategory,
  );
  const [activeMaterialSubcategories, setActiveMaterialSubcategories] =
    useState({});
  const [productPage, setProductPage] = useState(1);
  const [materialPage, setMaterialPage] = useState(1);
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    target: "product_category",
    parentKey: firstProductCategory,
    title: "",
  });
  const [categoryEdit, setCategoryEdit] = useState(null);
  const [categoryDelete, setCategoryDelete] = useState(null);
  const [productDelete, setProductDelete] = useState(null);
  const [queriedProducts, setQueriedProducts] = useState(null);
  const [queriedMaterials, setQueriedMaterials] = useState(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [productQueryCache, setProductQueryCache] = useState({});
  const [materialQueryCache, setMaterialQueryCache] = useState({});
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: firstProductCategory,
    subcategory: "",
    base_price: 0,
    min_width: 40,
    max_width: 120,
    min_height: 40,
    max_height: 120,
    image_url: "",
    model_url: "",
    file_name: "",
  });
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    code: "",
    type: firstMaterialCategory,
    subcategory: "",
    color_hex: "#E5E7EB",
    texture_url: "",
    preview_model_url: "",
    price_modifier: 0,
    modifier_type: "fixed",
  });

  const effectiveProductCategory = catalogGroups.some(
    (group) => group.key === activeProductCategory,
  )
    ? activeProductCategory
    : firstProductCategory;
  const effectiveMaterialCategory = materialGroups.some(
    (group) => group.key === activeMaterialCategory,
  )
    ? activeMaterialCategory
    : firstMaterialCategory;
  const productGroup =
    catalogGroups.find((group) => group.key === effectiveProductCategory) ||
    catalogGroups[0];
  const productSubcategories = productGroup?.subcategories?.length
    ? productGroup.subcategories
    : [{ key: "standard", title: "Tüm Ürünler" }];
  const activeProductSubcategory =
    activeProductSubcategories[productGroup?.key] ||
    productSubcategories[0]?.key;
  const productGroupItems = catalogItems.filter(
    (product) => product.category === productGroup?.key,
  );
  const filteredProducts =
    productGroup?.subcategories?.length &&
    activeProductSubcategory !== "standard"
      ? productGroupItems.filter(
          (product) =>
            getProductSubcategory(product) === activeProductSubcategory,
        )
      : productGroupItems;
  const sourceVisibleProducts = productsLoading
    ? []
    : queriedProducts || filteredProducts;
  const visibleProducts = selectedProduct
    ? sourceVisibleProducts.map((product) =>
        product.id === selectedProduct.id
          ? { ...product, ...selectedProduct }
          : product,
      )
    : sourceVisibleProducts;
  const pagedProducts = visibleProducts.slice(
    (productPage - 1) * productPageSize,
    productPage * productPageSize,
  );

  const materialGroup =
    materialGroups.find((group) => group.key === effectiveMaterialCategory) ||
    materialGroups[0];
  const materialSubcategories = materialGroup?.subcategories?.length
    ? materialGroup.subcategories
    : [{ key: "standard", title: "Tüm Malzemeler" }];
  const activeMaterialSubcategory =
    activeMaterialSubcategories[materialGroup?.key] ||
    materialSubcategories[0]?.key;
  const materialGroupItems = materials.filter(
    (material) => material.type === materialGroup?.key,
  );
  const filteredMaterials =
    materialGroup?.subcategories?.length &&
    activeMaterialSubcategory !== "standard"
      ? materialGroupItems.filter(
          (material) =>
            getMaterialSubcategory(material) === activeMaterialSubcategory,
        )
      : materialGroupItems;
  const visibleMaterials = materialsLoading ? [] : queriedMaterials || filteredMaterials;
  const pagedMaterials = visibleMaterials.slice(
    (materialPage - 1) * materialPageSize,
    materialPage * materialPageSize,
  );

  const getDefaultProductSubcategory = (category) =>
    catalogGroups.find((group) => group.key === category)?.subcategories?.[0]
      ?.key || "";

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

  const syncProductInQueryState = (product) => {
    if (!product?.id) return;
    const mergeProduct = (item) =>
      item.id === product.id ? { ...item, ...product } : item;

    setQueriedProducts((current) =>
      current ? current.map(mergeProduct) : current,
    );
    setProductQueryCache((current) =>
      Object.fromEntries(
        Object.entries(current).map(([key, products]) => [
          key,
          products.map(mergeProduct),
        ]),
      ),
    );
  };

  const saveSelectedProduct = () => {
    if (!selectedProduct) return;
    syncProductInQueryState(selectedProduct);
    const saveResult = onSaveProduct?.(selectedProduct);
    if (saveResult?.then) {
      saveResult
        .then((savedProduct) => {
          if (savedProduct?.id) syncProductInQueryState(savedProduct);
        })
        .catch(() => undefined);
    }
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

    const localUrl = URL.createObjectURL(file);
    setNewProduct((current) => ({
      ...current,
      model_url: localUrl,
      file_name: file.name,
      name: current.name || file.name.replace(/\.(gltf|glb)$/i, ""),
    }));
    onUploadFile?.("model", file).then((result) => {
      setNewProduct((current) => ({
        ...current,
        model_url: result.url,
        file_name: result.file_name || file.name,
      }));
    });
  };

  const handleNewProductImageFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onUploadFile?.("image", file).then((result) => {
      setNewProduct((current) => ({
        ...current,
        image_url: result.url,
      }));
    });
  };

  const uploadProductAsset = (field, type, file) => {
    if (!file) return;
    onUploadFile?.(type, file).then((result) => {
      onUpdateProduct(selectedProduct.id, (product) => ({
        ...product,
        [field]: result.url,
        ...(field === "model_url"
          ? { original_file_name: result.file_name || file.name }
          : {}),
      }));
    });
  };

  const uploadMaterialAsset = (field, type, file) => {
    if (!file) return;
    onUploadFile?.(type, file).then((result) => {
      updateSelectedMaterial(field, result.url);
    });
  };

  const addManualProduct = () => {
    if (!newProduct.name.trim()) return;
    const category = newProduct.category || firstProductCategory;
    const subcategory =
      newProduct.subcategory || getDefaultProductSubcategory(category);
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
        newProduct.image_url ||
        previewByCategory[category] ||
        previewByCategory.base_cabinet,
      model_url: newProduct.model_url || "",
      original_file_name: newProduct.file_name,
      base_price: Math.max(Number(newProduct.base_price) || 0, 0),
      is_manual: true,
    };

    onAddProduct(product);
    setActiveProductCategory(category);
    setActiveProductSubcategories((current) => ({
      ...current,
      [category]: subcategory,
    }));
    setProductPage(1);
    setProductDrawerOpen(false);
  };

  const addManualMaterial = () => {
    if (!newMaterial.name.trim()) return;
    const material = {
      id: `manual-mat-${Date.now()}`,
      code: newMaterial.code.trim() || `MAT-${Date.now().toString().slice(-6)}`,
      name: newMaterial.name.trim(),
      type: newMaterial.type || firstMaterialCategory,
      subcategory:
        newMaterial.subcategory ||
        materialGroups.find((group) => group.key === newMaterial.type)
          ?.subcategories?.[0]?.key ||
        "",
      color_hex: newMaterial.color_hex,
      texture_url: newMaterial.texture_url,
      preview_model_url: newMaterial.preview_model_url,
      price_modifier: Math.max(Number(newMaterial.price_modifier) || 0, 0),
      modifier_type: newMaterial.modifier_type || "fixed",
      is_active: true,
    };

    onAddMaterial?.(material);
    setActiveMaterialCategory(material.type);
    setActiveMaterialSubcategories((current) => ({
      ...current,
      [material.type]: material.subcategory,
    }));
    setMaterialPage(1);
    setMaterialDrawerOpen(false);
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
      setActiveProductSubcategories((current) => ({
        ...current,
        [parentKey]: key,
      }));
      setActiveTab("products");
    }

    if (categoryForm.target === "material_category") {
      const key = materialGroups.some((group) => group.key === baseKey)
        ? `${baseKey}_${Date.now().toString().slice(-4)}`
        : baseKey;
      onAddCatalogGroup({ scope: "material", key, title, subcategories: [] });
      setActiveMaterialCategory(key);
      setActiveTab("materials");
    }

    if (categoryForm.target === "material_subcategory") {
      const parentKey = categoryForm.parentKey || firstMaterialCategory;
      const parent = materialGroups.find((group) => group.key === parentKey);
      const key = parent?.subcategories?.some((item) => item.key === baseKey)
        ? `${baseKey}_${Date.now().toString().slice(-4)}`
        : baseKey;
      onAddCatalogGroup({ scope: "material", key, title, parentKey });
      setActiveMaterialCategory(parentKey);
      setActiveMaterialSubcategories((current) => ({
        ...current,
        [parentKey]: key,
      }));
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

  const openCategoryEdit = (group, scope) => {
    setCategoryEdit({
      group,
      scope,
      title: group.title || "",
    });
  };

  const saveCategoryEdit = () => {
    const title = categoryEdit?.title?.trim();
    if (!categoryEdit || !title) return;

    onUpdateCatalogGroup?.(categoryEdit.group, { title }, categoryEdit.scope);
    setCategoryEdit(null);
  };

  const openCategoryDelete = (group, scope) => {
    setCategoryDelete({
      group,
      scope,
      title: group.title,
      isSubcategory: Boolean(group.parentKey || group.parent_key),
    });
  };

  const confirmCategoryDelete = () => {
    if (!categoryDelete) return;
    onDeleteCatalogGroup?.(categoryDelete.group, categoryDelete.scope);
    setCategoryDelete(null);
  };

  const requestProductDelete = (product) => {
    setProductDelete(product);
  };

  const confirmProductDelete = () => {
    if (!productDelete) return;
    const deletedProduct = productDelete;
    const activeCategory = deletedProduct.category || activeProductCategory;
    const activeSubcategory =
      getProductSubcategory(deletedProduct) ||
      activeProductSubcategories[activeCategory];
    const activeGroup = catalogGroups.find(
      (group) => group.key === activeCategory,
    );
    const activeSubcategoryMeta = activeGroup?.subcategories?.find(
      (subcategory) => subcategory.key === activeSubcategory,
    );
    const cacheKey = `${activeCategory}:${activeSubcategoryMeta?.id || activeSubcategory}`;

    setQueriedProducts([]);
    setProductQueryCache((current) => {
      const next = { ...current };
      delete next[cacheKey];
      return next;
    });
    const deleteResult = onDeleteProduct?.(deletedProduct);
    if (selectedProduct?.id === productDelete.id) {
      onCloseProduct?.();
    }
    setProductDelete(null);

    if (activeCategory && activeSubcategory) {
      setProductsLoading(true);
      Promise.resolve(deleteResult)
        .then(() =>
          onLoadCatalogItems?.(
            activeCategory,
            activeSubcategory,
            activeSubcategoryMeta?.id,
          ),
        )
        .then((items) => {
          setQueriedProducts(items || []);
          setProductQueryCache((current) => ({
            ...current,
            [cacheKey]: items || [],
          }));
        })
        .catch(() => setQueriedProducts([]))
        .finally(() => setProductsLoading(false));
    }
  };

  const stats = useMemo(
    () => ({
      products: catalogStats?.products ?? catalogItems.length,
      materials: catalogStats?.materials ?? materials.length,
      categories:
        catalogStats?.categories ?? catalogGroups.length + materialGroups.length,
      models:
        catalogStats?.models ??
        catalogItems.filter((item) => item.model_url).length,
    }),
    [
      catalogStats,
      catalogGroups.length,
      catalogItems,
      materialGroups.length,
      materials.length,
    ],
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
              <Typography
                variant="overline"
                sx={{ color: "#2563EB", fontWeight: 950 }}
              >
                Yönetim Merkezi
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 950 }}>
                Ürün ve Malzeme Yönetimi
              </Typography>
              <Typography color="text.secondary">
                Kategori, alt kategori, ürün ve malzeme varyantlarını
                profesyonel katalog düzeninde yönetin.
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
                onClick={() =>
                  activeTab === "products"
                    ? setProductDrawerOpen(true)
                    : setMaterialDrawerOpen(true)
                }
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 900,
                  boxShadow: "0 12px 26px rgba(37,99,235,0.22)",
                }}
              >
                {activeTab === "products" ? "Urun Ekle" : "Malzeme Ekle"}
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
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 900 }}
                  >
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
            onChange={(_, value) => {
              setActiveTab(value);
              if (value === "materials") {
                setMaterialsLoading(true);
                onEnsureMaterialCatalog?.()
                  .catch(() => undefined)
                  .finally(() => setMaterialsLoading(false));
              }
            }}
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

        {loading ? (
          <Paper
            elevation={0}
            sx={{
              ...cardSx,
              minHeight: 640,
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(135deg, #F8FBFF 0%, #EEF6FF 100%)",
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress color="info" />
              <Typography sx={{ fontWeight: 900, color: "#173B63" }}>
                Katalog verileri yükleniyor...
              </Typography>
            </Stack>
          </Paper>
        ) : null}

        {!loading && activeTab === "products" ? (
          <CatalogWorkbench
            mode="products"
            groups={catalogGroups}
            items={catalogItems}
            activeCategory={activeProductCategory}
            activeSubcategory={activeProductSubcategory}
            page={productPage}
            pageSize={productPageSize}
            pagedItems={pagedProducts}
            filteredCount={visibleProducts.length}
            loading={productsLoading}
            onCategoryChange={(key) => {
              const nextGroup = catalogGroups.find((group) => group.key === key);
              const nextSubcategory =
                nextGroup?.subcategories?.[0] || {
                  key: "standard",
                  title: "Tüm Liste",
                };
              const nextSubcategoryKey = nextSubcategory.key;
              const cacheKey = `${key}:${nextSubcategory.id || nextSubcategoryKey}`;

              setActiveProductCategory(key);
              setActiveProductSubcategories((current) => ({
                ...current,
                [key]: nextSubcategoryKey,
              }));
              setProductPage(1);

              if (productQueryCache[cacheKey]) {
                setQueriedProducts(productQueryCache[cacheKey]);
                setProductsLoading(false);
                return;
              }

              setQueriedProducts([]);
              setProductsLoading(true);
              onLoadCatalogItems?.(key, nextSubcategoryKey, nextSubcategory.id)
                .then((items) => {
                  setQueriedProducts(items || []);
                  setProductQueryCache((current) => ({
                    ...current,
                    [cacheKey]: items || [],
                  }));
                })
                .catch(() => setQueriedProducts([]))
                .finally(() => setProductsLoading(false));
            }}
            onSubcategoryChange={(categoryKey, subcategoryKey, subcategory) => {
              setActiveProductSubcategories((current) => ({
                ...current,
                [categoryKey]: subcategoryKey,
              }));
              const cacheKey = `${categoryKey}:${subcategory?.id || subcategoryKey}`;
              if (productQueryCache[cacheKey]) {
                setQueriedProducts(productQueryCache[cacheKey]);
                setProductsLoading(false);
                setProductPage(1);
                return;
              }
              setQueriedProducts([]);
              setProductsLoading(true);
              onLoadCatalogItems?.(categoryKey, subcategoryKey, subcategory?.id)
                .then((items) => {
                  setQueriedProducts(items);
                  setProductQueryCache((current) => ({
                    ...current,
                    [cacheKey]: items,
                  }));
                })
                .catch(() => setQueriedProducts([]))
                .finally(() => setProductsLoading(false));
              setProductPage(1);
            }}
            onPageChange={(_, value) => setProductPage(value)}
            onSelectItem={onSelectProduct}
            onEditGroup={(group) => openCategoryEdit(group, "product")}
            onDeleteGroup={(group) => openCategoryDelete(group, "product")}
            renderCard={(product) => (
              <ProductCard
                product={product}
                catalogGroups={catalogGroups}
                selected={selectedProduct?.id === product.id}
                onDelete={requestProductDelete}
              />
            )}
          />
        ) : null}

        {!loading && activeTab === "materials" ? (
          <CatalogWorkbench
            mode="materials"
            groups={materialGroups}
            items={materials}
            activeCategory={activeMaterialCategory}
            activeSubcategory={activeMaterialSubcategory}
            page={materialPage}
            pageSize={materialPageSize}
            pagedItems={pagedMaterials}
            filteredCount={visibleMaterials.length}
            loading={materialsLoading}
            getItemCategory={(item) => item.type}
            getItemSubcategory={getMaterialSubcategory}
            onCategoryChange={(key) => {
              setActiveMaterialCategory(key);
              setQueriedMaterials(null);
              setMaterialsLoading(false);
              setMaterialPage(1);
            }}
            onSubcategoryChange={(categoryKey, subcategoryKey, subcategory) => {
              setActiveMaterialSubcategories((current) => ({
                ...current,
                [categoryKey]: subcategoryKey,
              }));
              const cacheKey = `${categoryKey}:${subcategory?.id || subcategoryKey}`;
              if (materialQueryCache[cacheKey]) {
                setQueriedMaterials(materialQueryCache[cacheKey]);
                setMaterialsLoading(false);
                setMaterialPage(1);
                return;
              }
              setQueriedMaterials([]);
              setMaterialsLoading(true);
              onLoadMaterials?.(categoryKey, subcategoryKey, subcategory?.id)
                .then((items) => {
                  setQueriedMaterials(items);
                  setMaterialQueryCache((current) => ({
                    ...current,
                    [cacheKey]: items,
                  }));
                })
                .catch(() => setQueriedMaterials([]))
                .finally(() => setMaterialsLoading(false));
              setMaterialPage(1);
            }}
            onPageChange={(_, value) => setMaterialPage(value)}
            onSelectItem={onSelectMaterial}
            onEditGroup={(group) => openCategoryEdit(group, "material")}
            onDeleteGroup={(group) => openCategoryDelete(group, "material")}
            renderCard={(material) => (
              <MaterialCard
                material={material}
                selected={selectedMaterial?.id === material.id}
              />
            )}
          />
        ) : null}
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
        handleNewProductImageFile={handleNewProductImageFile}
        handleNewModelFile={handleNewModelFile}
        addManualProduct={addManualProduct}
      />
      <MaterialDrawer
        open={materialDrawerOpen}
        onClose={() => setMaterialDrawerOpen(false)}
        materialGroups={materialGroups}
        newMaterial={newMaterial}
        setNewMaterial={setNewMaterial}
        addManualMaterial={addManualMaterial}
      />
      <SelectedProductDrawer
        selectedProduct={selectedProduct}
        catalogGroups={catalogGroups}
        onCloseProduct={onCloseProduct}
        onUpdateProduct={onUpdateProduct}
        onSaveProduct={saveSelectedProduct}
        onDeleteProduct={requestProductDelete}
        uploadProductAsset={uploadProductAsset}
        updateSelectedProduct={updateSelectedProduct}
        updateSelectedProductField={updateSelectedProductField}
        getDefaultProductSubcategory={getDefaultProductSubcategory}
        getProductCategoryLabel={getProductCategoryLabel}
      />
      <SelectedMaterialDrawer
        selectedMaterial={selectedMaterial}
        materialGroups={materialGroups}
        onCloseMaterial={onCloseMaterial}
        onDeleteMaterial={onDeleteMaterial}
        uploadMaterialAsset={uploadMaterialAsset}
        updateSelectedMaterial={updateSelectedMaterial}
      />
      <PremiumDialog
        open={Boolean(categoryEdit)}
        onClose={() => setCategoryEdit(null)}
        title={
          categoryEdit?.group?.parentKey || categoryEdit?.group?.parent_key
            ? "Alt Kategori Duzenle"
            : "Kategori Duzenle"
        }
        subtitle="Kategori adini guncelleyin."
        maxWidth="xs"
        actions={
          <Button
            variant="contained"
            color="info"
            onClick={saveCategoryEdit}
            disabled={!categoryEdit?.title?.trim()}
            sx={{
              minWidth: 112,
              height: 42,
              mt: 1,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 900,
            }}
          >
            Guncelle
          </Button>
        }
      >
        <Stack spacing={2} sx={{ mt: "10px" }}>
          <TextField
            label="Kategori adi"
            size="small"
            value={categoryEdit?.title || ""}
            onChange={(event) =>
              setCategoryEdit((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
        </Stack>
      </PremiumDialog>
      <PremiumDialog
        open={Boolean(categoryDelete)}
        onClose={() => setCategoryDelete(null)}
        title={
          categoryDelete?.isSubcategory
            ? "Alt Kategoriyi Sil"
            : "Kategoriyi Sil"
        }
        subtitle="Lutfen silme islemini onaylayin."
        maxWidth="xs"
        actions={
          <Button
            variant="contained"
            color="error"
            onClick={confirmCategoryDelete}
            sx={{
              minWidth: 112,
              height: 42,
              mt: 1,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 900,
            }}
          >
            Sil
          </Button>
        }
      >
        <Stack spacing={1.25} sx={{ mt: "10px" }}>
          <Typography sx={{ color: "#173B63", fontWeight: 800 }}>
            "{categoryDelete?.title}" kalici olarak silinsin mi?
          </Typography>
          <Typography variant="body2" sx={{ color: "#5F7897" }}>
            Bu kategoriye bagli kayitlar da silinir.
          </Typography>
        </Stack>
      </PremiumDialog>
      <PremiumDialog
        open={Boolean(productDelete)}
        onClose={() => setProductDelete(null)}
        title="Ürünü Sil"
        subtitle="Lütfen silme işlemini onaylayın."
        maxWidth="xs"
        actions={
          <Button
            variant="contained"
            color="error"
            onClick={confirmProductDelete}
            sx={{
              minWidth: 112,
              height: 42,
              mt: 1,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 900,
            }}
          >
            Sil
          </Button>
        }
      >
        <Stack spacing={1.25} sx={{ mt: "10px" }}>
          <Typography sx={{ color: "#173B63", fontWeight: 800 }}>
            "{productDelete?.name}" kalıcı olarak silinsin mi?
          </Typography>
          <Typography variant="body2" sx={{ color: "#5F7897" }}>
            Bu işlem geri alınamaz.
          </Typography>
        </Stack>
      </PremiumDialog>
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
  loading,
  getItemCategory = (item) => item.category,
  getItemSubcategory = getProductSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  onPageChange,
  onSelectItem,
  onEditGroup,
  onDeleteGroup,
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
            const groupItems = items.filter(
              (item) => getItemCategory(item) === group.key,
            );
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
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ fontSize: 19 }} />}
                  sx={{
                    minHeight: 56,
                    px: 1,
                    "& .MuiAccordionSummary-content": {
                      my: 0.7,
                      minWidth: 0,
                    },
                    "& .MuiAccordionSummary-expandIconWrapper": {
                      ml: 0.25,
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ width: "100%" }}
                  >
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
                        {groupItems.length}{" "}
                        {mode === "products" ? "ürün" : "malzeme"}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEditGroup?.(group);
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        color: "#38A8FF",
                        bgcolor: "#EDF8FF",
                        border: "1px solid #C7E8FF",
                        borderRadius: 1,
                      }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteGroup?.(group);
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        mr: 1.5,
                        color: "#DC2626",
                        bgcolor: "#FEF2F2",
                        border: "1px solid #FECACA",
                        borderRadius: 1,
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                    </IconButton>
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
                      const active =
                        expanded && activeSubcategory === subcategory.key;
                      return (
                        <Box
                          key={subcategory.key}
                          component="button"
                          type="button"
                          onClick={() =>
                            onSubcategoryChange(
                              group.key,
                              subcategory.key,
                              subcategory,
                            )
                          }
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
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Stack
                              direction="row"
                              spacing={1.1}
                              alignItems="center"
                              sx={{ minWidth: 0 }}
                            >
                              <Stack direction="row" spacing={0.65} alignItems="center">
                                <EditOutlinedIcon
                                  fontSize="small"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onEditGroup?.({
                                      ...subcategory,
                                      parentKey: group.key,
                                    });
                                  }}
                                  sx={{ color: "#38A8FF", flexShrink: 0 }}
                                />
                                <DeleteOutlineIcon
                                  fontSize="small"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onDeleteGroup?.({
                                      ...subcategory,
                                      parentKey: group.key,
                                    });
                                  }}
                                  sx={{ color: "#DC2626", flexShrink: 0 }}
                                />
                              </Stack>
                              <Typography
                                sx={{ fontSize: 13, fontWeight: 900 }}
                                noWrap
                              >
                                {subcategory.title}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <Typography
                                sx={{ fontSize: 12, fontWeight: 900 }}
                              >
                                {count}
                              </Typography>
                            </Stack>
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
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
        {loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1.2}
            sx={{ minHeight: 370 }}
          >
            <CircularProgress color="info" />
            <Typography sx={{ color: "#41698F", fontWeight: 900 }}>
              {mode === "products"
                ? "Ürünler yükleniyor"
                : "Malzemeler yükleniyor"}
            </Typography>
          </Stack>
        ) : (
          <>
            <Grid container spacing={1}>
              {pagedItems.map((item) => (
                <Grid
                  item
                  xs={12}
                  sm={mode === "products" ? 6 : 4}
                  key={item.id}
                >
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
          </>
        )}
      </Paper>
    </Grid>
  </Grid>
);

const ProductCard = ({ product, catalogGroups, selected, onDelete }) => (
  <Paper
    elevation={0}
    sx={{
      position: "relative",
      border: selected
        ? "2px solid #2563EB"
        : "1px solid rgba(148,163,184,0.28)",
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
    <IconButton
      size="small"
      onClick={(event) => {
        event.stopPropagation();
        onDelete?.(product);
      }}
      sx={{
        position: "absolute",
        top: 6,
        right: 6,
        zIndex: 2,
        width: 30,
        height: 30,
        borderRadius: 1,
        color: "#DC2626",
        bgcolor: "#FEF2F2",
        border: "1px solid #FECACA",
        boxShadow: "0 8px 18px rgba(220,38,38,0.12)",
        "&:hover": {
          bgcolor: "#FEE2E2",
          borderColor: "#FCA5A5",
        },
      }}
    >
      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
    </IconButton>
    <Stack direction="row" spacing={1.1}>
      <Box
        component="img"
        src={
          product.image_url ||
          previewByCategory[product.category] ||
          previewByCategory.base_cabinet
        }
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
          <Typography sx={{ pr: 3.8, fontWeight: 950 }} noWrap>
            {product.name}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {product.sku} ·{" "}
          {getSubcategoryLabel(catalogGroups, product) || product.category}
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
      border: selected
        ? "2px solid #2563EB"
        : "1px solid rgba(148,163,184,0.28)",
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
  const getParentGroups = (target) =>
    target.startsWith("material") ? materialGroups : productGroups;
  const parentGroups = getParentGroups(form.target);
  const changeTarget = (target) => {
    const nextParentGroups = getParentGroups(target);
    setForm((current) => ({
      ...current,
      target,
      parentKey: target.endsWith("subcategory")
        ? nextParentGroups[0]?.key || ""
        : "",
    }));
  };

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
          <DrawerHeader
            title="Kategori Oluştur"
            subtitle="Ana kategori veya alt kategori ekleyin."
            onClose={onClose}
          />
          <Grid container spacing={1}>
            {[
              ["product_category", "Urun Ana Kategorisi"],
              ["product_subcategory", "Urun Alt Kategorisi"],
              ["material_category", "Malzeme Ana Kategorisi"],
              ["material_subcategory", "Malzeme Alt Kategorisi"],
            ].map(([target, label]) => (
              <Grid item xs={12} sm={6} key={target}>
                <Button
                  fullWidth
                  variant={form.target === target ? "contained" : "outlined"}
                  onClick={() => changeTarget(target)}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: 900,
                  }}
                >
                  {label}
                </Button>
              </Grid>
            ))}
          </Grid>
          {form.target.endsWith("subcategory") && (
            <TextField
              select
              label="Bağlı ana kategori"
              size="small"
              value={form.parentKey}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  parentKey: event.target.value,
                }))
              }
            >
              {parentGroups.map((group) => (
                <MenuItem key={group.key} value={group.key}>
                  {group.title}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label={
              form.target.endsWith("subcategory")
                ? "Alt kategori adı"
                : "Ana kategori adı"
            }
            size="small"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
          />
          <Button
            variant="contained"
            startIcon={<CategoryOutlinedIcon />}
            onClick={addCategory}
            disabled={!form.title.trim()}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 900 }}
          >
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
  handleNewProductImageFile,
  handleNewModelFile,
  addManualProduct,
}) => (
  <PremiumDialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    title="Ürün Ekle"
    subtitle="Kategori, ölçü, fiyat ve 3D model bilgilerini girin."
    actions={
      <Button
        color="info"
        variant="contained"
        onClick={addManualProduct}
        disabled={!newProduct.name.trim()}
        sx={{
          mt: 1,
          minWidth: 180,
          height: 44,
          borderRadius: 1,
          textTransform: "none",
          fontWeight: 950,
        }}
      >
        Ürünü Kataloga Ekle
      </Button>
    }
  >
    <Stack spacing={2.2}>
      <Grid container spacing={1.4}>
        {[
          {
            title: "Ürün resmi",
            button: "Resim Seç",
            helper: newProduct.image_url || "PNG, JPG veya WebP",
            accept: "image/*",
            onChange: handleNewProductImageFile,
          },
          {
            title: "3D model",
            button: "GLTF / GLB Seç",
            helper: newProduct.file_name || "GLB veya GLTF model dosyası",
            accept: ".gltf,.glb,model/gltf+json,model/gltf-binary",
            onChange: handleNewModelFile,
          },
        ].map((item) => (
          <Grid item xs={12} md={6} key={item.title}>
            <Box
              sx={{
                p: 1.5,
                minHeight: 102,
                borderRadius: 1.3,
                bgcolor: "#FFFFFF",
                border: "1px solid #CFE3F8",
                boxShadow: "0 12px 30px rgba(25,118,210,0.08)",
              }}
            >
              <Stack spacing={1}>
                <Typography sx={{ color: "#173B63", fontWeight: 950 }}>
                  {item.title}
                </Typography>
                <Button
                  component="label"
                  color="info"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: 900,
                  }}
                >
                  {item.button}
                  <input
                    hidden
                    type="file"
                    accept={item.accept}
                    onChange={item.onChange}
                  />
                </Button>
                <Chip
                  label={item.helper}
                  size="small"
                  variant="outlined"
                  sx={{
                    maxWidth: "100%",
                    justifyContent: "flex-start",
                    color: "#41698F",
                    borderColor: "#CFE3F8",
                    bgcolor: "#F7FBFF",
                  }}
                />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          p: 1.5,
          borderRadius: 1.3,
          bgcolor: "#FFFFFF",
          border: "1px solid #D7E7F7",
        }}
      >
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ürün adı"
              size="small"
              value={newProduct.name}
              onChange={(event) =>
                setNewProduct((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Ana kategori"
              size="small"
              value={newProduct.category}
              onChange={(event) =>
                setNewProduct((current) => ({
                  ...current,
                  category: event.target.value,
                  subcategory: getDefaultProductSubcategory(event.target.value),
                }))
              }
            >
              {catalogGroups.map((group) => (
                <MenuItem key={group.key} value={group.key}>
                  {group.title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            {catalogGroups.find((group) => group.key === newProduct.category)
              ?.subcategories?.length ? (
              <TextField
                fullWidth
                select
                label="Alt kategori"
                size="small"
                value={
                  newProduct.subcategory ||
                  getDefaultProductSubcategory(newProduct.category)
                }
                onChange={(event) =>
                  setNewProduct((current) => ({
                    ...current,
                    subcategory: event.target.value,
                  }))
                }
              >
                {catalogGroups
                  .find((group) => group.key === newProduct.category)
                  ?.subcategories?.map((subcategory) => (
                    <MenuItem key={subcategory.key} value={subcategory.key}>
                      {subcategory.title}
                    </MenuItem>
                  ))}
              </TextField>
            ) : null}
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
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
          </Grid>
          {[
            ["min_width", "Min genişlik"],
            ["max_width", "Max genişlik"],
            ["min_height", "Min yükseklik"],
            ["max_height", "Max yükseklik"],
          ].map(([field, label]) => (
            <Grid item xs={12} sm={6} md={3} key={field}>
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
      </Box>
    </Stack>
  </PremiumDialog>
);
const MaterialDrawer = ({
  open,
  onClose,
  materialGroups,
  newMaterial,
  setNewMaterial,
  addManualMaterial,
}) => (
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
        <DrawerHeader
          title="Malzeme Ekle"
          subtitle="Malzeme bilgilerini girin."
          onClose={onClose}
        />
        <TextField
          label="Malzeme adi"
          size="small"
          value={newMaterial.name}
          onChange={(event) =>
            setNewMaterial((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
        />
        <TextField
          label="Kod"
          size="small"
          value={newMaterial.code}
          onChange={(event) =>
            setNewMaterial((current) => ({
              ...current,
              code: event.target.value,
            }))
          }
        />
        <TextField
          select
          label="Ana kategori"
          size="small"
          value={newMaterial.type}
          onChange={(event) =>
            setNewMaterial((current) => ({
              ...current,
              type: event.target.value,
              subcategory:
                materialGroups.find((group) => group.key === event.target.value)
                  ?.subcategories?.[0]?.key || "",
            }))
          }
        >
          {materialGroups.map((group) => (
            <MenuItem key={group.key} value={group.key}>
              {group.title}
            </MenuItem>
          ))}
        </TextField>
        {materialGroups.find((group) => group.key === newMaterial.type)
          ?.subcategories?.length ? (
          <TextField
            select
            label="Alt kategori"
            size="small"
            value={
              newMaterial.subcategory ||
              materialGroups.find((group) => group.key === newMaterial.type)
                ?.subcategories?.[0]?.key ||
              ""
            }
            onChange={(event) =>
              setNewMaterial((current) => ({
                ...current,
                subcategory: event.target.value,
              }))
            }
          >
            {materialGroups
              .find((group) => group.key === newMaterial.type)
              ?.subcategories?.map((subcategory) => (
                <MenuItem key={subcategory.key} value={subcategory.key}>
                  {subcategory.title}
                </MenuItem>
              ))}
          </TextField>
        ) : null}
        <TextField
          label="Renk kodu"
          size="small"
          value={newMaterial.color_hex}
          onChange={(event) =>
            setNewMaterial((current) => ({
              ...current,
              color_hex: event.target.value,
            }))
          }
        />
        <TextField
          label="Fiyat etkisi"
          type="number"
          size="small"
          value={newMaterial.price_modifier}
          onChange={(event) =>
            setNewMaterial((current) => ({
              ...current,
              price_modifier: event.target.value,
            }))
          }
        />
        <TextField
          select
          label="Fiyat tipi"
          size="small"
          value={newMaterial.modifier_type}
          onChange={(event) =>
            setNewMaterial((current) => ({
              ...current,
              modifier_type: event.target.value,
            }))
          }
        >
          <MenuItem value="percent">Yuzde</MenuItem>
          <MenuItem value="fixed">Sabit</MenuItem>
        </TextField>
        <Button
          variant="contained"
          onClick={addManualMaterial}
          disabled={!newMaterial.name.trim()}
          sx={{ borderRadius: 1, textTransform: "none", fontWeight: 900 }}
        >
          Malzemeyi Kaydet
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
  onSaveProduct,
  onDeleteProduct,
  uploadProductAsset,
  updateSelectedProduct,
  updateSelectedProductField,
  getDefaultProductSubcategory,
  getProductCategoryLabel,
}) => (
  <Drawer
    anchor="right"
    open={Boolean(selectedProduct)}
    onClose={onCloseProduct}
    variant="persistent"
    PaperProps={{
      sx: {
        width: { xs: 350, sm: 470 },
        p: 0,
        top: 0,
        height: "100%",
        borderLeft: "1px solid #BFDBFE",
        background:
          "linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 42%, #F8FBFF 100%)",
        boxShadow: "-24px 0 62px rgba(15,23,42,0.20)",
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
        <Stack sx={{ height: "100%" }}>
          <Box
            sx={{
              p: 2,
              pb: 1.5,
              borderBottom: "1px solid #DBEAFE",
              background:
                "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 48%, #E0F2FE 100%)",
            }}
          >
            <DrawerHeader
              title="Ürün Yönetimi"
              subtitle={`${selectedProduct.sku} · ${getProductCategoryLabel(selectedProduct.category)}`}
              onClose={onCloseProduct}
            />
            <Box
              sx={{
                mt: 1.5,
                p: 1,
                borderRadius: 1.5,
                border: "1px solid #BFDBFE",
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(239,246,255,0.96))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <Box
                component="img"
                src={
                  selectedProduct.image_url ||
                  previewByCategory[selectedProduct.category] ||
                  previewByCategory.base_cabinet
                }
                alt={selectedProduct.name}
                sx={{
                  width: "100%",
                  height: 188,
                  objectFit: "contain",
                  borderRadius: 1,
                  background:
                    "radial-gradient(circle at 50% 55%, #DBEAFE 0 18%, transparent 19%), linear-gradient(145deg, #F8FBFF, #EAF2FB)",
                  p: 1,
                }}
              />
            </Box>
          </Box>
          <Stack spacing={1.8} sx={{ p: 2, overflowY: "auto", flex: 1 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  border: "1px solid #DBEAFE",
                  bgcolor: "#FFFFFF",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#64748B", fontWeight: 900 }}
                >
                  Kategori
                </Typography>
                <Typography sx={{ color: "#173B63", fontWeight: 950 }} noWrap>
                  {getProductCategoryLabel(selectedProduct.category)}
                </Typography>
              </Box>
              <Box
                sx={{
                  border: "1px solid #DBEAFE",
                  bgcolor: "#FFFFFF",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#64748B", fontWeight: 900 }}
                >
                  Fiyat
                </Typography>
                <Typography sx={{ color: "#0B7DD8", fontWeight: 950 }} noWrap>
                  {money(selectedProduct.base_price || 0)}
                </Typography>
              </Box>
            </Box>
          <TextField
            label="Ürün adı"
            size="small"
            sx={premiumDrawerFieldSx}
            value={selectedProduct.name}
            onChange={(event) =>
              updateSelectedProductField("name", event.target.value)
            }
          />
          <TextField
            label="Ürün fiyatı"
            type="number"
            size="small"
            sx={premiumDrawerFieldSx}
            value={selectedProduct.base_price || 0}
            onChange={(event) =>
              updateSelectedProductField("base_price", event.target.value)
            }
          />
          <TextField
            label="Ürün resmi"
            size="small"
            sx={premiumDrawerFieldSx}
            value={selectedProduct.image_url || ""}
            onChange={(event) =>
              updateSelectedProductField("image_url", event.target.value)
            }
          />
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 900 }}
          >
            Resim Yukle
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(event) =>
                uploadProductAsset(
                  "image_url",
                  "image",
                  event.target.files?.[0],
                )
              }
            />
          </Button>
          <TextField
            label="3D model dosyası"
            size="small"
            sx={premiumDrawerFieldSx}
            value={selectedProduct.model_url || ""}
            onChange={(event) =>
              onUpdateProduct(selectedProduct.id, (product) => ({
                ...product,
                model_url: event.target.value,
              }))
            }
          />
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 900 }}
          >
            GLB Model Yukle
            <input
              hidden
              type="file"
              accept=".gltf,.glb,model/gltf+json,model/gltf-binary"
              onChange={(event) =>
                uploadProductAsset(
                  "model_url",
                  "model",
                  event.target.files?.[0],
                )
              }
            />
          </Button>
          <TextField
            select
            label="Ana kategori"
            size="small"
            sx={premiumDrawerFieldSx}
            value={selectedProduct.category}
            onChange={(event) =>
              onUpdateProduct(selectedProduct.id, (product) => ({
                ...product,
                category: event.target.value,
                subcategory: getDefaultProductSubcategory(event.target.value),
              }))
            }
          >
            {catalogGroups.map((group) => (
              <MenuItem key={group.key} value={group.key}>
                {group.title}
              </MenuItem>
            ))}
          </TextField>
          {catalogGroups.find((group) => group.key === selectedProduct.category)
            ?.subcategories?.length ? (
            <TextField
              select
              label="Alt kategori"
              size="small"
              sx={premiumDrawerFieldSx}
              value={getProductSubcategory(selectedProduct)}
              onChange={(event) =>
                updateSelectedProductField("subcategory", event.target.value)
              }
            >
              {catalogGroups
                .find((group) => group.key === selectedProduct.category)
                ?.subcategories?.map((subcategory) => (
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
            <TextField
              key={field}
              label={label}
              type="number"
              size="small"
              sx={premiumDrawerFieldSx}
              value={selectedProduct.constraints?.[field] || 0}
              onChange={(event) =>
                updateSelectedProduct(field, event.target.value)
              }
            />
          ))}
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              p: 2,
              borderTop: "1px solid #DBEAFE",
              bgcolor: "rgba(255,255,255,0.92)",
            }}
          >
          <Button
            color="info"
            variant="contained"
            startIcon={<EditOutlinedIcon />}
            onClick={onSaveProduct}
            sx={{
              height: 44,
              flex: 1,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 950,
              boxShadow: "0 14px 26px rgba(2,132,199,0.24)",
            }}
          >
            Güncelle
          </Button>
          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => onDeleteProduct?.(selectedProduct)}
            sx={{
              height: 42,
              flex: 1,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 950,
              bgcolor: "#FFFFFF",
            }}
          >
            Ürünü Sil
          </Button>
          </Stack>
        </Stack>
      </ClickAwayListener>
    )}
  </Drawer>
);

const SelectedMaterialDrawer = ({
  selectedMaterial,
  materialGroups,
  onCloseMaterial,
  onDeleteMaterial,
  uploadMaterialAsset,
  updateSelectedMaterial,
}) => (
  <Drawer
    anchor="right"
    open={Boolean(selectedMaterial)}
    onClose={onCloseMaterial}
    variant="persistent"
    PaperProps={{
      sx: {
        width: { xs: 330, sm: 420 },
        p: 2,
        top: 0,
        height: "100%",
        borderLeft: "1px solid #E2E8F0",
        boxShadow: "-16px 0 42px rgba(15,23,42,0.14)",
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
          <DrawerHeader
            title="Malzeme Yönetimi"
            subtitle={selectedMaterial.code}
            onClose={onCloseMaterial}
          />
          <TextField
            label="Malzeme adı"
            size="small"
            value={selectedMaterial.name}
            onChange={(event) =>
              updateSelectedMaterial("name", event.target.value)
            }
          />
          <TextField
            select
            label="Ana kategori"
            size="small"
            value={selectedMaterial.type}
            onChange={(event) =>
              updateSelectedMaterial("type", event.target.value)
            }
          >
            {materialGroups.map((group) => (
              <MenuItem key={group.key} value={group.key}>
                {group.title}
              </MenuItem>
            ))}
          </TextField>
          {materialGroups.find((group) => group.key === selectedMaterial.type)
            ?.subcategories?.length ? (
            <TextField
              select
              label="Alt kategori"
              size="small"
              value={
                selectedMaterial.subcategory ||
                materialGroups.find(
                  (group) => group.key === selectedMaterial.type,
                )?.subcategories?.[0]?.key ||
                ""
              }
              onChange={(event) =>
                updateSelectedMaterial("subcategory", event.target.value)
              }
            >
              {materialGroups
                .find((group) => group.key === selectedMaterial.type)
                ?.subcategories?.map((subcategory) => (
                  <MenuItem key={subcategory.key} value={subcategory.key}>
                    {subcategory.title}
                  </MenuItem>
                ))}
            </TextField>
          ) : null}
          <TextField
            label="Renk kodu"
            size="small"
            value={selectedMaterial.color_hex || ""}
            onChange={(event) =>
              updateSelectedMaterial("color_hex", event.target.value)
            }
          />
          <TextField
            label="Doku resmi"
            size="small"
            value={selectedMaterial.texture_url || ""}
            onChange={(event) =>
              updateSelectedMaterial("texture_url", event.target.value)
            }
          />
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 900 }}
          >
            Doku Resmi Yukle
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(event) =>
                uploadMaterialAsset(
                  "texture_url",
                  "image",
                  event.target.files?.[0],
                )
              }
            />
          </Button>
          <TextField
            label="Önizleme model dosyası"
            size="small"
            value={selectedMaterial.preview_model_url || ""}
            onChange={(event) =>
              updateSelectedMaterial("preview_model_url", event.target.value)
            }
          />
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 900 }}
          >
            GLB Model Yukle
            <input
              hidden
              type="file"
              accept=".gltf,.glb,model/gltf+json,model/gltf-binary"
              onChange={(event) =>
                uploadMaterialAsset(
                  "preview_model_url",
                  "model",
                  event.target.files?.[0],
                )
              }
            />
          </Button>
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
            <MenuItem value="percent">Yüzde</MenuItem>
            <MenuItem value="fixed">Sabit</MenuItem>
          </TextField>
          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => {
              if (window.confirm("Malzeme kalici olarak silinsin mi?")) {
                onDeleteMaterial?.(selectedMaterial);
              }
            }}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 900 }}
          >
            Malzemeyi Sil
          </Button>
        </Stack>
      </ClickAwayListener>
    )}
  </Drawer>
);

export default KitchenCatalogManager;
