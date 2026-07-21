import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Pagination,
  Paper,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FlareOutlinedIcon from "@mui/icons-material/FlareOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import MovieCreationOutlinedIcon from "@mui/icons-material/MovieCreationOutlined";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import RedoOutlinedIcon from "@mui/icons-material/RedoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import Page from "components/Page";
import { SERVER } from "routes/paths";
import { getData, postData } from "utils/axiosForPhyton";
import AlignHorizontalCenterOutlinedIcon from "@mui/icons-material/AlignHorizontalCenterOutlined";
import KitchenCatalogManager from "./components/KitchenCatalogManager";
import KitchenCustomizer from "./components/KitchenCustomizer";
import KitchenPaletteDrawer from "./components/KitchenPaletteDrawer";
import KitchenScene from "./components/KitchenScene";
import KitchenSceneItemsDrawer from "./components/KitchenSceneItemsDrawer";
import {
  TABS,
  fallbackCatalog,
  catalogGroups as fallbackCatalogGroups,
  fallbackMaterials,
} from "./kitchenData";
import { money } from "./kitchenUtils";

const buildLocalQuote = (
  items,
  catalogMap,
  materialMap,
  installationFee,
  shippingFee,
) => {
  const lines = items.map((item) => {
    const product = catalogMap[item.catalog_item_id] || {};
    const quantity = Number(item.quantity || 1);
    const baseTotal = Number(product.base_price || 0) * quantity;
    const modifierIds = [
      item.options?.door_material_id,
      item.options?.glass_material_id,
      item.options?.countertop_material_id,
    ].filter(Boolean);
    const modifiersTotal = modifierIds.reduce((sum, materialId) => {
      const material = materialMap[materialId];
      if (!material) return sum;

      const modifier = Number(material.price_modifier || 0);
      return (
        sum +
        (material.modifier_type === "percent"
          ? baseTotal * modifier
          : modifier * quantity)
      );
    }, 0);

    return {
      catalog_item_id: item.catalog_item_id,
      name: product.name || "Ürün",
      quantity,
      base_total: baseTotal,
      modifiers_total: modifiersTotal,
      line_total: baseTotal + modifiersTotal,
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
  const installation = Math.max(Number(installationFee || 0), 0);
  const shipping = Math.max(Number(shippingFee || 0), 0);

  return {
    currency: "TRY",
    lines,
    subtotal,
    installation,
    shipping,
    discount: 0,
    total: subtotal + installation + shipping,
  };
};

const consumePendingProject = (initialTab) => {
  if (initialTab !== "designer") return null;

  const rawProject = window.localStorage.getItem("decusinOpenProject");
  if (!rawProject) return null;

  try {
    return JSON.parse(rawProject);
  } catch {
    return null;
  } finally {
    window.localStorage.removeItem("decusinOpenProject");
  }
};

const PROJECT_CACHE_KEY = "decusinKitchenProjects";

const defaultRoomSurfaces = {
  floor: "#DDBF86",
  floorPattern: "oakHerringbone",
  backWall: "#E8E6DE",
  sideWall: "#E1DED5",
  ceiling: "#D4CDC0",
  trim: "#D1D1CA",
  backWallVisible: true,
  leftWallVisible: true,
  rightWallVisible: true,
  ceilingVisible: true,
  sceneMode: "day",
  lampVisible: false,
  lightsOn: false,
  lampType: "spot",
};

const floorPatternOptions = [
  {
    value: "oakHerringbone",
    label: "Açık balıksırtı",
    preview:
      "repeating-linear-gradient(45deg, #E8C888 0 7px, #D9AE65 7px 14px, #F1D99E 14px 21px), repeating-linear-gradient(-45deg, rgba(151,95,36,0.24) 0 5px, transparent 5px 16px)",
  },
  {
    value: "warmPlank",
    label: "Sıcak meşe",
    preview:
      "repeating-linear-gradient(90deg, #B87832 0 14px, #D8A85A 14px 28px, #9C642C 28px 42px)",
  },
  {
    value: "naturalChevron",
    label: "Doğal chevron",
    preview:
      "repeating-linear-gradient(135deg, #D8AB66 0 9px, #F0D39B 9px 18px, #B9843E 18px 27px)",
  },
  {
    value: "paleOak",
    label: "Soluk meşe",
    preview:
      "repeating-linear-gradient(90deg, #F1DCA8 0 16px, #D9BA78 16px 32px, #FFE9B7 32px 48px)",
  },
  {
    value: "classicOak",
    label: "Klasik meşe",
    preview:
      "repeating-linear-gradient(90deg, #C89247 0 16px, #E0B66F 16px 32px, #B97A32 32px 48px)",
  },
  {
    value: "goldenChevron",
    label: "Altın chevron",
    preview:
      "repeating-linear-gradient(135deg, #C98930 0 8px, #EAB961 8px 16px, #A96A24 16px 24px)",
  },
  {
    value: "walnutPlank",
    label: "Ceviz",
    preview:
      "repeating-linear-gradient(90deg, #5B351F 0 16px, #8A542D 16px 32px, #3E2418 32px 48px)",
  },
  {
    value: "darkWalnut",
    label: "Koyu ceviz",
    preview:
      "repeating-linear-gradient(90deg, #2D1A13 0 16px, #5B3524 16px 32px, #1F130E 32px 48px)",
  },
  {
    value: "smokedOak",
    label: "Füme meşe",
    preview:
      "repeating-linear-gradient(90deg, #5C5A50 0 16px, #8B8778 16px 32px, #3D3B35 32px 48px)",
  },
  {
    value: "blackChevron",
    label: "Siyah chevron",
    preview:
      "repeating-linear-gradient(135deg, #161616 0 8px, #3A332B 8px 16px, #0C0C0C 16px 24px)",
  },
  {
    value: "grayAsh",
    label: "Gri dişbudak",
    preview:
      "repeating-linear-gradient(90deg, #A9A99F 0 16px, #D2D0C5 16px 32px, #7B7B73 32px 48px)",
  },
  {
    value: "rusticBrown",
    label: "Rustik kahve",
    preview:
      "repeating-linear-gradient(90deg, #70421F 0 16px, #A66B34 16px 32px, #4A2C18 32px 48px)",
  },
];

const isCountertopMountedProduct = (product) => {
  const name =
    `${product?.name || ""} ${product?.category || ""}`.toLowerCase();
  return [
    "evye",
    "ocak",
    "ankastre",
    "sink",
    "hob",
    "cooktop",
    "built-in",
  ].some((keyword) => name.includes(keyword));
};

const isWallMountedProduct = (
  product,
  dimensions = product?.dimensions || {},
) => {
  const text =
    `${product?.name || ""} ${product?.sku || ""} ${product?.category || ""}`
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const depth = Number(dimensions?.depth || product?.dimensions?.depth || 0);
  const height = Number(dimensions?.height || product?.dimensions?.height || 0);

  return (
    product?.category === "wall_cabinet" ||
    product?.category === "shelf" ||
    text.includes("ust") ||
    text.includes("ust dolap") ||
    text.includes("üst dolap") ||
    text.includes("ãœst dolap") ||
    text.includes("ust-") ||
    text.includes("ust_") ||
    (depth > 0 &&
      depth <= 40 &&
      height >= 40 &&
      product?.category !== "countertop")
  );
};

const getProductPlacement = (
  product,
  dimensions = product?.dimensions || {},
) => (isWallMountedProduct(product, dimensions) ? "wall" : "floor");

const normalizeProductDimensions = (product, dimensions = {}) => {
  const mounted = isCountertopMountedProduct(product);
  const sourceDimensions = {
    ...(product?.dimensions || {}),
    ...(dimensions || {}),
  };
  const wallMounted = isWallMountedProduct(product, sourceDimensions);
  const nextDimensions = {
    width: 60,
    height: product?.category === "countertop" ? 4 : mounted ? 6 : 72,
    depth: wallMounted ? 34 : mounted ? 48 : 56,
    unit: "cm",
    ...sourceDimensions,
  };

  if (mounted && Number(nextDimensions.height || 0) > 20) {
    nextDimensions.height = 6;
  }
  if (
    product?.category === "countertop" &&
    Number(nextDimensions.height || 0) > 12
  ) {
    nextDimensions.height = 4;
  }

  return nextDimensions;
};

const toolbarControlBoxSx = {
  width: 66,
  height: 42,
  p: 0.35,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  borderRadius: 1,
  border: "1px solid rgba(148,163,184,0.36)",
  bgcolor: "#FFFFFF",
  boxShadow: "0 6px 14px rgba(15,23,42,0.08)",
};

const toolbarControlLabelSx = {
  display: "block",
  mb: 0.25,
  fontSize: 9,
  fontWeight: 900,
  color: "#475569",
  lineHeight: "11px",
  textAlign: "center",
};

const toolbarPrimaryButtonSx = (active = false) => ({
  width: active ? 128 : 122,
  minWidth: active ? 128 : 122,
  maxWidth: active ? 128 : 122,
  height: 42,
  px: 0.85,
  borderRadius: 1.15,
  textTransform: "none",
  fontSize: 0,
  fontWeight: 950,
  letterSpacing: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
  position: "relative",
  isolation: "isolate",
  boxShadow: active
    ? "0 14px 28px rgba(15,87,190,0.22), inset 0 1px 0 rgba(255,255,255,0.28)"
    : "0 12px 24px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.92)",
  border: active
    ? "1px solid rgba(147,197,253,0.7)"
    : "1px solid rgba(25,118,210,0.26)",
  bgcolor: active ? "#145FCC" : "#FFFFFF",
  background: active
    ? "linear-gradient(135deg, #0F5ED7 0%, #1D8BFF 52%, #0B4CB5 100%)"
    : "linear-gradient(135deg, #FFFFFF 0%, #F4F9FF 58%, #EAF3FF 100%)",
  color: active ? "#FFFFFF" : "#0F5ED7",
  "&:hover": {
    bgcolor: active ? "#0F5ED7" : "#F8FBFF",
    background: active
      ? "linear-gradient(135deg, #0B4CB5 0%, #1D8BFF 54%, #083E96 100%)"
      : "linear-gradient(135deg, #FFFFFF 0%, #EEF6FF 100%)",
    boxShadow: active
      ? "0 16px 34px rgba(15,87,190,0.28), inset 0 1px 0 rgba(255,255,255,0.26)"
      : "0 14px 28px rgba(25,118,210,0.13), inset 0 1px 0 rgba(255,255,255,0.92)",
  },
  "& .MuiButton-startIcon": {
    width: 24,
    height: 24,
    mr: 0.7,
    ml: -0.25,
    borderRadius: 0.8,
    display: "grid",
    placeItems: "center",
    bgcolor: active ? "rgba(255,255,255,0.18)" : "rgba(25,118,210,0.08)",
    boxShadow: active
      ? "inset 0 0 0 1px rgba(255,255,255,0.24)"
      : "inset 0 0 0 1px rgba(25,118,210,0.12)",
  },
  "& .MuiButton-startIcon > *": {
    fontSize: 17,
  },
  "&::after": {
    content: active ? '"Ürün Ekle"' : '"Ekli Ürünler"',
    fontSize: 11.5,
    fontWeight: 950,
    lineHeight: 1,
  },
});

const ToolbarNumberControl = ({ label, value, onChange }) => (
  <Box sx={toolbarControlBoxSx}>
    <Typography component="label" sx={toolbarControlLabelSx}>
      {label}
    </Typography>
    <Box
      component="input"
      type="number"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{
        width: "100%",
        height: 23,
        border: "1px solid rgba(148,163,184,0.45)",
        borderRadius: 0.8,
        px: 0.4,
        fontSize: 11,
        fontWeight: 900,
        color: "#111827",
        outline: "none",
        textAlign: "center",
        bgcolor: "#F8FAFC",
      }}
    />
  </Box>
);

const ToolbarColorControl = ({ label, value, onChange }) => (
  <Box
    component="label"
    title={label}
    sx={{ ...toolbarControlBoxSx, cursor: "pointer" }}
  >
    <Typography component="span" sx={toolbarControlLabelSx}>
      {label}
    </Typography>
    <Box
      sx={{
        width: "100%",
        height: 23,
        borderRadius: 0.8,
        border: "1px solid rgba(148,163,184,0.48)",
        bgcolor: value,
        boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.76)",
      }}
    />
    <Box
      component="input"
      type="color"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
    />
  </Box>
);

const ToolbarSceneToggleControl = ({
  label,
  active,
  activeTitle,
  inactiveTitle,
  activeIcon,
  inactiveIcon,
  disabled = false,
  onToggle,
}) => (
  <Box
    component="button"
    type="button"
    title={active ? activeTitle : inactiveTitle}
    aria-label={active ? activeTitle : inactiveTitle}
    disabled={disabled}
    onClick={onToggle}
    sx={{
      ...toolbarControlBoxSx,
      width: 56,
      cursor: disabled ? "not-allowed" : "pointer",
      outline: "none",
      appearance: "none",
      font: "inherit",
      textAlign: "initial",
      opacity: disabled ? 0.48 : 1,
    }}
  >
    <Typography component="span" sx={toolbarControlLabelSx}>
      {label}
    </Typography>
    <Box
      sx={{
        width: "100%",
        height: 23,
        borderRadius: 0.8,
        display: "grid",
        placeItems: "center",
        border: active
          ? "1px solid rgba(37,99,235,0.34)"
          : "1px solid rgba(148,163,184,0.42)",
        color: active ? "#F59E0B" : "#334155",
        bgcolor: active ? "#FFFBEB" : "#F8FAFC",
      }}
    >
      {active ? activeIcon : inactiveIcon}
    </Box>
  </Box>
);

const ToolbarFloorPatternControl = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const selectedOption =
    floorPatternOptions.find((option) => option.value === value) ||
    floorPatternOptions[0];
  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        component="button"
        type="button"
        title="Parke seç"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          ...toolbarControlBoxSx,
          width: 76,
          cursor: "pointer",
          outline: "none",
          appearance: "none",
          font: "inherit",
          textAlign: "initial",
        }}
      >
        <Typography component="span" sx={toolbarControlLabelSx}>
          Parke
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: 23,
            borderRadius: 0.8,
            border: "1px solid rgba(120,72,24,0.32)",
            background: selectedOption.preview,
            boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.38)",
          }}
        />
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 0.7,
            p: 1,
            width: 270,
            borderRadius: 1.5,
            border: "1px solid rgba(226,232,240,0.95)",
            boxShadow: "0 18px 42px rgba(15,23,42,0.18)",
          },
        }}
      >
        <Typography
          sx={{ mb: 0.8, fontSize: 12, fontWeight: 900, color: "#334155" }}
        >
          Parke Seç
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0.8,
          }}
        >
          {floorPatternOptions.map((option) => (
            <Box
              key={option.value}
              component="button"
              type="button"
              title={option.label}
              aria-label={option.label}
              onClick={() => {
                onChange(option.value);
                setAnchorEl(null);
              }}
              sx={{
                p: 0.45,
                borderRadius: 1,
                cursor: "pointer",
                border:
                  value === option.value
                    ? "2px solid #1976D2"
                    : "1px solid rgba(148,163,184,0.38)",
                bgcolor: "#FFFFFF",
                outline: "none",
                textAlign: "left",
              }}
            >
              <Box
                sx={{
                  height: 38,
                  borderRadius: 0.8,
                  background: option.preview,
                  boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.34)",
                }}
              />
              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 9.5,
                  fontWeight: 900,
                  color: "#334155",
                  lineHeight: 1.1,
                }}
              >
                {option.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};

const cloneProjectData = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const normalizeProjectSnapshot = (project) => {
  const snapshot = cloneProjectData(project || {});

  return {
    ...snapshot,
    room_dimensions: {
      width: 450,
      height: 250,
      depth: 240,
      unit: "cm",
      ...(snapshot.room_dimensions || {}),
    },
    items: Array.isArray(snapshot.items) ? snapshot.items : [],
    installation_fee: Number(snapshot.installation_fee || 0),
    shipping_fee: Number(snapshot.shipping_fee || 0),
    room_surfaces: {
      ...defaultRoomSurfaces,
      ...(snapshot.room_surfaces || {}),
    },
  };
};

const readProjectCache = () => {
  if (typeof window === "undefined") return [];

  try {
    const cachedProjects = JSON.parse(
      window.localStorage.getItem(PROJECT_CACHE_KEY) || "[]",
    );
    return Array.isArray(cachedProjects)
      ? cachedProjects.map(normalizeProjectSnapshot)
      : [];
  } catch {
    return [];
  }
};

const writeProjectCache = (projects) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    PROJECT_CACHE_KEY,
    JSON.stringify(projects.map(normalizeProjectSnapshot)),
  );
};

const mergeProjectsById = (...projectLists) => {
  const projectMap = new Map();

  projectLists.flat().forEach((project) => {
    if (!project?.id) return;
    projectMap.set(project.id, normalizeProjectSnapshot(project));
  });

  return Array.from(projectMap.values()).sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
  );
};

const mergeCatalogItemsById = (...catalogLists) => {
  const catalogMap = new Map();

  catalogLists.flat().forEach((product) => {
    if (!product?.id) return;
    catalogMap.set(product.id, {
      ...(catalogMap.get(product.id) || {}),
      ...product,
    });
  });

  return Array.from(catalogMap.values());
};

const isSeedCatalogProduct = (product) =>
  /^product-\d{3}-/.test(String(product?.id || ""));

const mergeRuntimeCatalogItems = (serverItems = []) =>
  mergeCatalogItemsById(
    serverItems.filter((product) => !isSeedCatalogProduct(product)),
    fallbackCatalog,
  );

const KitchenStudioPage = ({ initialTab = "designer" }) => {
  const navigate = useNavigate();
  const sceneRef = useRef(null);
  const copiedSceneItemRef = useRef(null);
  const skipSceneHistoryRef = useRef(false);
  const lastSceneItemsSnapshotRef = useRef(null);
  const tab = TABS[initialTab] || 0;
  const [pendingProject] = useState(() => {
    const project = consumePendingProject(initialTab);
    return project ? normalizeProjectSnapshot(project) : null;
  });
  const [catalogItems, setCatalogItems] = useState(fallbackCatalog);
  const [catalogGroups, setCatalogGroups] = useState(fallbackCatalogGroups);
  const [materials, setMaterials] = useState(fallbackMaterials);
  const [projects, setProjects] = useState(() => readProjectCache());
  const [selectedDoorMaterial] = useState("mat-door-lake-white");
  const [selectedGlassMaterial] = useState("mat-glass-smoked");
  const [selectedCounterMaterial] = useState("mat-counter-quartz");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sceneItemsOpen, setSceneItemsOpen] = useState(false);
  const [projectSaveOpen, setProjectSaveOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    customer_name: "",
    notes: "",
  });
  const [projectSearch, setProjectSearch] = useState("");
  const [projectPage, setProjectPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [customerForm, setCustomerForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
  });
  const [sceneItems, setSceneItems] = useState(
    () => pendingProject?.items || [],
  );
  const [selectedCatalogProductId, setSelectedCatalogProductId] =
    useState(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(null);
  const [selectedSceneIndices, setSelectedSceneIndices] = useState([]);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [zoom] = useState(1);
  const [installationFee, setInstallationFee] = useState(() =>
    Number(pendingProject?.installation_fee || 0),
  );
  const [shippingFee, setShippingFee] = useState(() =>
    Number(pendingProject?.shipping_fee || 0),
  );
  const [roomDimensions, setRoomDimensions] = useState({
    width: 450,
    height: 250,
    depth: 240,
    unit: "cm",
    ...(pendingProject?.room_dimensions || {}),
  });
  const [roomSurfaces, setRoomSurfaces] = useState({
    ...defaultRoomSurfaces,
    ...(pendingProject?.room_surfaces || {}),
  });
  const [premiumTools, setPremiumTools] = useState({
    quality: true,
    measurements: true,
    walls: true,
    topView: false,
    cameraTour: false,
    multiSelect: false,
    smartPlacement: true,
  });
  const [cameraPresetSignal, setCameraPresetSignal] = useState(null);

  const materialMap = useMemo(
    () => Object.fromEntries(materials.map((item) => [item.id, item])),
    [materials],
  );

  const catalogMap = useMemo(
    () => Object.fromEntries(catalogItems.map((item) => [item.id, item])),
    [catalogItems],
  );

  const selectedDoor = materialMap[selectedDoorMaterial];
  const selectedGlass = materialMap[selectedGlassMaterial];
  const selectedCounter = materialMap[selectedCounterMaterial];
  const pageTitle =
    {
      designer: "Tasarım Sahnesi",
      catalog: "Ürünler & Malzemeler",
      pricing: "Fiyatlandırma",
      projects: "Projeler",
      customers: "Müşteriler",
    }[initialTab] || "Tasarım Sahnesi";

  const selectedSceneItem =
    selectedSceneIndex === null ? null : sceneItems[selectedSceneIndex] || null;
  const selectedProduct = selectedSceneItem
    ? catalogMap[selectedSceneItem.catalog_item_id] || null
    : null;
  const selectedDimensions = {
    ...normalizeProductDimensions(selectedProduct, selectedProduct?.dimensions),
    ...(selectedSceneItem?.dimensions || {}),
  };
  if (
    selectedProduct &&
    isCountertopMountedProduct(selectedProduct) &&
    Number(selectedDimensions.height || 0) > 20
  ) {
    selectedDimensions.height = 6;
  }
  const selectedOptions = selectedSceneItem?.options || {};
  const selectedElevation = (() => {
    if (!selectedSceneItem || !selectedProduct) return 0;
    if (Number.isFinite(Number(selectedSceneItem.position?.elevation))) {
      return Number(selectedSceneItem.position.elevation);
    }
    if (
      selectedProduct.category === "wall_cabinet" ||
      selectedProduct.category === "shelf"
    ) {
      return 140;
    }
    return 0;
  })();
  const selectedCatalogProduct = selectedCatalogProductId
    ? catalogItems.find((item) => item.id === selectedCatalogProductId) || null
    : null;
  const selectedMaterial = selectedMaterialId
    ? materials.find((item) => item.id === selectedMaterialId) || null
    : null;
  const localQuote = useMemo(
    () =>
      buildLocalQuote(
        sceneItems,
        catalogMap,
        materialMap,
        installationFee,
        shippingFee,
      ),
    [catalogMap, installationFee, materialMap, sceneItems, shippingFee],
  );
  const quote = localQuote;
  const selectedLineQuote =
    selectedSceneIndex === null
      ? null
      : localQuote.lines[selectedSceneIndex] || null;
  const selectedItemCount = premiumTools.multiSelect
    ? selectedSceneIndices.length
    : selectedSceneIndex === null
      ? 0
      : 1;
  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLocaleLowerCase("tr-TR");
    if (!query) return projects;

    return projects.filter((project) =>
      `${project.name || ""} ${project.customer_name || ""}`
        .toLocaleLowerCase("tr-TR")
        .includes(query),
    );
  }, [projectSearch, projects]);
  const projectPageCount = Math.max(Math.ceil(filteredProjects.length / 10), 1);
  const pagedProjects = filteredProjects.slice(
    (projectPage - 1) * 10,
    projectPage * 10,
  );

  const getSceneMetrics = useCallback(
    (dimensions = roomDimensions) => {
      const rect = sceneRef.current?.getBoundingClientRect();
      const roomWidthCm = Math.max(Number(dimensions.width || 450), 1);
      const roomHeightCm = Math.max(Number(dimensions.height || 250), 1);
      const cmToPx = rect
        ? Math.max((rect.width / roomWidthCm) * zoom, 0.6)
        : 1;

      return {
        width: rect?.width || roomWidthCm * cmToPx,
        height: rect?.height || roomHeightCm * cmToPx,
        cmToPx,
      };
    },
    [roomDimensions, zoom],
  );

  const getSceneItemPixelSize = useCallback((item, product, cmToPx) => {
    const dimensions = {
      ...(product?.dimensions || {}),
      ...(item?.dimensions || {}),
    };
    const isWall = product?.category === "wall_cabinet";
    const isCounter = product?.category === "countertop";
    const isShelf = product?.category === "shelf";
    const hasModel = Boolean(product?.model_url);
    const widthCm = Number(dimensions.width || 60);
    const heightCm = Number(
      dimensions.height || (isWall ? 72 : isCounter ? 4 : isShelf ? 3 : 72),
    );

    return {
      width: Math.max(widthCm * cmToPx, hasModel ? 44 : 24),
      height: Math.max(heightCm * cmToPx, hasModel ? 44 : 12),
    };
  }, []);

  const clampScenePosition = useCallback((item, product, x, y) => {
    return {
      x: Number(x) || 0,
      y: Number(y) || 0,
    };
  }, []);

  const resolveInitialSceneItemPosition = useCallback(
    (items, nextItem, product, position) => {
      if (
        product.category === "countertop" ||
        isCountertopMountedProduct(product)
      ) {
        return position;
      }

      const metrics = getSceneMetrics();
      const cmToPx = metrics.cmToPx || 1;
      const dimensions = normalizeProductDimensions(
        product,
        nextItem.dimensions,
      );
      const placement =
        nextItem.placement || getProductPlacement(product, dimensions);
      const roomWidthCm = Math.max(Number(roomDimensions.width || 450), 1);
      const roomDepthCm = Math.max(Number(roomDimensions.depth || 240), 1);
      const roomHeightCm = Math.max(Number(roomDimensions.height || 250), 1);
      const width = Math.max(Number(dimensions.width || 60), 1);
      const height = Math.max(Number(dimensions.height || 72), 1);
      const depth = Math.max(Number(dimensions.depth || 56), 1);
      const candidates =
        placement === "wall"
          ? [
              {
                x: Number(position.x || 0) / cmToPx,
                y: Number(position.y || 0) / cmToPx,
              },
              {
                x: Number(position.x || 0) / cmToPx + width,
                y: Number(position.y || 0) / cmToPx,
              },
              {
                x: Number(position.x || 0) / cmToPx - width,
                y: Number(position.y || 0) / cmToPx,
              },
              {
                x: Number(position.x || 0) / cmToPx,
                y: Number(position.y || 0) / cmToPx + height,
              },
            ]
          : [
              {
                x: Number(position.x || 0) / cmToPx,
                z: Number(position.z || 0),
              },
              {
                x: Number(position.x || 0) / cmToPx + width,
                z: Number(position.z || 0),
              },
              {
                x: Number(position.x || 0) / cmToPx - width,
                z: Number(position.z || 0),
              },
              {
                x: Number(position.x || 0) / cmToPx,
                z: Number(position.z || 0) + depth,
              },
            ];

      const overlapsExisting = (candidate) =>
        items.some((item) => {
          const otherProduct = catalogMap[item.catalog_item_id] || {};
          if (
            otherProduct.category === "countertop" ||
            isCountertopMountedProduct(otherProduct)
          )
            return false;

          const otherDimensions = normalizeProductDimensions(
            otherProduct,
            item.dimensions,
          );
          const otherPlacement =
            item.placement ||
            getProductPlacement(otherProduct, otherDimensions);
          if (otherPlacement !== placement) return false;

          const otherX = Number(item.position?.x || 0) / cmToPx;
          const otherWidth = Math.max(Number(otherDimensions.width || 60), 1);

          if (placement === "wall") {
            const otherY = Number(item.position?.y || 0) / cmToPx;
            const otherHeight = Math.max(
              Number(otherDimensions.height || 72),
              1,
            );
            return (
              Math.min(candidate.x + width, otherX + otherWidth) -
                Math.max(candidate.x, otherX) >
                1 &&
              Math.min(candidate.y + height, otherY + otherHeight) -
                Math.max(candidate.y, otherY) >
                1
            );
          }

          const otherZ = Number(item.position?.z || 0);
          const otherDepth = Math.max(Number(otherDimensions.depth || 56), 1);
          return (
            Math.min(candidate.x + width, otherX + otherWidth) -
              Math.max(candidate.x, otherX) >
              1 &&
            Math.min(candidate.z + depth, otherZ + otherDepth) -
              Math.max(candidate.z, otherZ) >
              1
          );
        });

      const inRoom = (candidate) =>
        placement === "wall"
          ? candidate.x >= 0 &&
            candidate.x + width <= roomWidthCm &&
            candidate.y >= 0 &&
            candidate.y + height <= roomHeightCm
          : candidate.x >= 0 &&
            candidate.x + width <= roomWidthCm &&
            candidate.z >= 0 &&
            candidate.z + depth <= roomDepthCm;

      const freeCandidate = candidates.find(
        (candidate) => inRoom(candidate) && !overlapsExisting(candidate),
      );
      if (!freeCandidate) return position;

      return {
        ...position,
        x: freeCandidate.x * cmToPx,
        ...(placement === "wall"
          ? { y: freeCandidate.y * cmToPx, z: 0 }
          : { z: freeCandidate.z }),
      };
    },
    [
      catalogMap,
      getSceneMetrics,
      roomDimensions.depth,
      roomDimensions.height,
      roomDimensions.width,
    ],
  );

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      getData(SERVER.kitchen.catalogItems),
      getData(SERVER.kitchen.materials),
      getData(SERVER.kitchen.projects),
    ]).then((results) => {
      if (!mounted) return;

      const [catalogResult, materialResult, projectResult] = results;
      if (catalogResult.status === "fulfilled") {
        setCatalogItems(
          mergeRuntimeCatalogItems(catalogResult.value?.data || []),
        );
      }
      if (materialResult.status === "fulfilled") {
        setMaterials(materialResult.value?.data || fallbackMaterials);
      }
      if (projectResult.status === "fulfilled") {
        setProjects((current) => {
          const mergedProjects = mergeProjectsById(
            current,
            projectResult.value?.data || [],
            readProjectCache(),
          );
          writeProjectCache(mergedProjects);
          return mergedProjects;
        });
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    postData(SERVER.kitchen.quote, {
      items: sceneItems,
      include_installation: true,
      installation_fee: installationFee,
      shipping_fee: shippingFee,
    })
      .then(() => undefined)
      .catch(() => undefined);
  }, [installationFee, sceneItems, shippingFee]);

  useEffect(() => {
    const updateQuoteFees = (event) => {
      if (event.detail?.installation_fee !== undefined) {
        setInstallationFee(
          Math.max(Number(event.detail.installation_fee) || 0, 0),
        );
      }
      if (event.detail?.shipping_fee !== undefined) {
        setShippingFee(Math.max(Number(event.detail.shipping_fee) || 0, 0));
      }
    };

    window.addEventListener("decusin:update-quote-fees", updateQuoteFees);
    return () =>
      window.removeEventListener("decusin:update-quote-fees", updateQuoteFees);
  }, []);

  useEffect(() => {
    const total = Number(localQuote?.total || 0);
    window.localStorage.setItem("decusinQuoteTotal", String(total));
    window.localStorage.setItem("decusinQuote", JSON.stringify(localQuote));
    window.dispatchEvent(
      new CustomEvent("decusin:quote-total", {
        detail: { total, quote: localQuote },
      }),
    );
  }, [localQuote]);

  useEffect(() => {
    const currentSnapshot = cloneProjectData(sceneItems);

    if (!lastSceneItemsSnapshotRef.current) {
      lastSceneItemsSnapshotRef.current = currentSnapshot;
      return;
    }

    if (skipSceneHistoryRef.current) {
      skipSceneHistoryRef.current = false;
      lastSceneItemsSnapshotRef.current = currentSnapshot;
      return;
    }

    if (
      JSON.stringify(lastSceneItemsSnapshotRef.current) ===
      JSON.stringify(currentSnapshot)
    ) {
      return;
    }

    const previousSnapshot = lastSceneItemsSnapshotRef.current;
    setUndoStack((current) => [...current, previousSnapshot].slice(-40));
    setRedoStack([]);
    lastSceneItemsSnapshotRef.current = currentSnapshot;
  }, [sceneItems]);

  const buildItemOptions = (product) => {
    const options = {};
    if (["base_cabinet", "wall_cabinet"].includes(product.category)) {
      options.door_material_id = selectedDoorMaterial;
    }
    if (product.category === "wall_cabinet") {
      options.glass_material_id = selectedGlassMaterial;
    }
    if (product.category === "countertop") {
      options.countertop_material_id = selectedCounterMaterial;
    }
    return options;
  };

  const clampProductSize = (product, field, value) => {
    const width = Number(value) || 1;
    const constraintField = field === "width" ? "width" : "height";
    const minValue = Number(
      product?.constraints?.[`min_${constraintField}`] || 1,
    );
    const maxValue = Number(
      product?.constraints?.[`max_${constraintField}`] || 999,
    );
    return Math.min(Math.max(width, minValue), maxValue);
  };

  const getDefaultProductDimensions = (product) => {
    const dimensions = normalizeProductDimensions(product, product.dimensions);
    const mounted = isCountertopMountedProduct(product);

    return {
      ...dimensions,
      width: clampProductSize(product, "width", dimensions.width),
      height: mounted
        ? dimensions.height
        : clampProductSize(product, "height", dimensions.height),
      unit: "cm",
    };
  };

  const addSceneItemAt = (product, x, y) => {
    setSceneItems((current) => {
      const dimensions = getDefaultProductDimensions(product);
      const metrics = getSceneMetrics();
      const wallTopCm = isWallMountedProduct(product, dimensions) ? 28 : null;
      const nextY = wallTopCm === null ? y : wallTopCm * metrics.cmToPx;
      const isCornerProduct =
        `${product.name || ""} ${product.sku || ""}`
          .toLocaleLowerCase("tr-TR")
          .includes("kose") ||
        `${product.name || ""} ${product.sku || ""}`
          .toLocaleLowerCase("tr-TR")
          .includes("köşe");
      const nextItem = {
        catalog_item_id: product.id,
        position: { x: isCornerProduct ? 0 : x, y: nextY, z: 0 },
        placement: getProductPlacement(product, dimensions),
        rotation: { x: 0, y: 0, z: 0 },
        dimensions,
        options: buildItemOptions(product),
        quantity: 1,
      };
      const position = clampScenePosition(nextItem, product, x, nextY);
      const resolvedPosition = premiumTools.smartPlacement
        ? resolveInitialSceneItemPosition(current, nextItem, product, {
            ...nextItem.position,
            ...position,
          })
        : position;
      return [
        ...current,
        {
          ...nextItem,
          position: { ...nextItem.position, ...position, ...resolvedPosition },
        },
      ];
    });
    setSelectedSceneIndex(null);
    setPaletteOpen(false);
  };

  const updateSceneItemPosition = (index, x, y) => {
    setSceneItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (item.locked) return item;

        const product = catalogMap[item.catalog_item_id] || {};
        const position = clampScenePosition(item, product, x, y);
        return { ...item, position: { ...item.position, ...position } };
      }),
    );
  };

  const updateSceneItemPosition3D = (index, nextPosition) => {
    setSceneItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (item.locked) return item;

        return {
          ...item,
          position: {
            ...(item.position || { x: 0, y: 0, z: 0 }),
            ...nextPosition,
          },
        };
      }),
    );
  };

  const updateSceneItemElevation = (index, value) => {
    setSceneItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const product = catalogMap[item.catalog_item_id] || {};
        const dimensions = {
          ...(product.dimensions || { height: 72 }),
          ...(item.dimensions || {}),
        };
        const maxElevation = Math.max(
          Number(roomDimensions.height || 250) -
            Number(dimensions.height || 72),
          0,
        );
        const elevation = Math.min(
          Math.max(Number(value) || 0, 0),
          maxElevation,
        );

        return {
          ...item,
          position: {
            ...(item.position || { x: 0, y: 0, z: 0 }),
            elevation,
          },
        };
      }),
    );
  };

  const selectSceneItem = (index) => {
    setPaletteOpen(false);
    setSceneItemsOpen(false);
    setSelectedSceneIndex(index);
    setSelectedSceneIndices((current) => {
      if (!premiumTools.multiSelect) return [index];
      return current.includes(index)
        ? current.filter((itemIndex) => itemIndex !== index)
        : [...current, index];
    });
    setCustomizerOpen(false);
    setDragState(null);
    setResizeState(null);
  };

  const updateSceneItemDimensions = (index, field, value) => {
    setSceneItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const product = catalogMap[item.catalog_item_id] || {};
        const baseDimensions = product.dimensions || {
          width: 60,
          height: 72,
          depth: 56,
          unit: "cm",
        };

        const nextValue =
          field === "width" || field === "height"
            ? isCountertopMountedProduct(product) && field === "height"
              ? Math.max(Number(value) || 1, 1)
              : clampProductSize(product, field, value)
            : Math.max(Number(value) || 1, 1);

        return {
          ...item,
          dimensions: {
            ...baseDimensions,
            ...(item.dimensions || {}),
            [field]: nextValue,
            unit: "cm",
          },
        };
      }),
    );
  };

  const updateSceneItemOption = (index, field, value) => {
    setSceneItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, options: { ...item.options, [field]: value } }
          : item,
      ),
    );
  };

  const rotateSceneItem = (index, axis, delta) => {
    setSceneItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              rotation: {
                ...(item.rotation || { x: 0, y: 0, z: 0 }),
                [axis]: Number(item.rotation?.[axis] || 0) + delta,
              },
            }
          : item,
      ),
    );
  };

  const resizeSceneItem = (index, nextValues) => {
    setSceneItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const product = catalogMap[item.catalog_item_id] || {};
        const baseDimensions = product.dimensions || {
          width: 60,
          height: 72,
          depth: 56,
          unit: "cm",
        };

        const nextItem = {
          ...item,
          position: {
            ...item.position,
          },
          dimensions: {
            ...baseDimensions,
            ...(item.dimensions || {}),
            width: clampProductSize(product, "width", nextValues.width),
            height: clampProductSize(product, "height", nextValues.height),
            unit: "cm",
          },
        };
        const position = clampScenePosition(
          nextItem,
          product,
          nextValues.x,
          nextValues.y,
        );

        return {
          ...nextItem,
          position: {
            ...nextItem.position,
            ...position,
          },
        };
      }),
    );
  };

  const removeSceneItem = (index) => {
    setSceneItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
    setCustomizerOpen(false);
    setSelectedSceneIndex((current) => {
      if (current === null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
    setSelectedSceneIndices((current) =>
      current
        .filter((itemIndex) => itemIndex !== index)
        .map((itemIndex) => (itemIndex > index ? itemIndex - 1 : itemIndex)),
    );
  };

  const copySceneItem = useCallback(
    (index) => {
      const item = sceneItems[index];
      if (!item) return;

      copiedSceneItemRef.current = {
        ...item,
        position: { ...(item.position || {}) },
        rotation: { ...(item.rotation || {}) },
        dimensions: item.dimensions ? { ...item.dimensions } : null,
        options: { ...(item.options || {}) },
      };
    },
    [sceneItems],
  );

  const pasteSceneItem = useCallback(() => {
    const source =
      copiedSceneItemRef.current ||
      (selectedSceneIndex === null ? null : sceneItems[selectedSceneIndex]);
    if (!source) return;

    setSceneItems((current) => {
      const nextItem = {
        ...source,
        position: {
          ...(source.position || {}),
          x: Number(source.position?.x || 0) + 26,
          y: Number(source.position?.y || 0) + 26,
        },
        rotation: { ...(source.rotation || {}) },
        dimensions: source.dimensions ? { ...source.dimensions } : null,
        options: { ...(source.options || {}) },
      };
      setSelectedSceneIndex(current.length);
      return [...current, nextItem];
    });
    setPaletteOpen(false);
  }, [sceneItems, selectedSceneIndex]);

  const duplicateSceneItem = (index) => {
    copySceneItem(index);
    pasteSceneItem();
  };

  const undoSceneChange = useCallback(() => {
    setUndoStack((current) => {
      if (!current.length) return current;

      const previous = current[current.length - 1];
      skipSceneHistoryRef.current = true;
      setRedoStack((redoCurrent) => [
        cloneProjectData(sceneItems),
        ...redoCurrent,
      ].slice(0, 40));
      setSceneItems(cloneProjectData(previous));
      setSelectedSceneIndex(null);
      setSelectedSceneIndices([]);
      setCustomizerOpen(false);
      return current.slice(0, -1);
    });
  }, [sceneItems]);

  const redoSceneChange = useCallback(() => {
    setRedoStack((current) => {
      if (!current.length) return current;

      const next = current[0];
      skipSceneHistoryRef.current = true;
      setUndoStack((undoCurrent) => [
        ...undoCurrent,
        cloneProjectData(sceneItems),
      ].slice(-40));
      setSceneItems(cloneProjectData(next));
      setSelectedSceneIndex(null);
      setSelectedSceneIndices([]);
      setCustomizerOpen(false);
      return current.slice(1);
    });
  }, [sceneItems]);

  const toggleSelectedItemLock = () => {
    const targetIndices =
      premiumTools.multiSelect && selectedSceneIndices.length
        ? selectedSceneIndices
        : selectedSceneIndex === null
          ? []
          : [selectedSceneIndex];
    if (!targetIndices.length) return;

    setSceneItems((current) => {
      const shouldLock = targetIndices.some((index) => !current[index]?.locked);
      return current.map((item, index) =>
        targetIndices.includes(index) ? { ...item, locked: shouldLock } : item,
      );
    });
  };

  const autoAlignSceneItems = useCallback(() => {
    const metrics = getSceneMetrics();
    const cmToPx = metrics.cmToPx || 1;

    setSceneItems((current) => {
      const nextItems = current.map((item) => ({
        ...item,
        position: { ...(item.position || {}) },
      }));
      const alignGroup = (indices, wallMode) => {
        let cursor = 0;

        indices
          .sort(
            (first, second) =>
              Number(current[first].position?.x || 0) -
              Number(current[second].position?.x || 0),
          )
          .forEach((itemIndex) => {
            const item = nextItems[itemIndex];
            const product = catalogMap[item.catalog_item_id] || {};
            const dimensions = normalizeProductDimensions(
              product,
              item.dimensions,
            );
            const width = Math.max(Number(dimensions.width || 60), 1);

            item.position.x = cursor * cmToPx;
            if (wallMode) {
              item.position.y = Number(item.position.y || 28 * cmToPx);
              item.position.z = 0;
            } else {
              item.position.z = 0;
            }
            cursor += width;
          });
      };
      const floorIndices = [];
      const wallIndices = [];

      nextItems.forEach((item, index) => {
        const product = catalogMap[item.catalog_item_id] || {};
        if (
          product.category === "countertop" ||
          isCountertopMountedProduct(product)
        )
          return;

        const dimensions = normalizeProductDimensions(product, item.dimensions);
        const placement = item.placement || getProductPlacement(product, dimensions);

        if (placement === "wall") wallIndices.push(index);
        else floorIndices.push(index);
      });

      alignGroup(floorIndices, false);
      alignGroup(wallIndices, true);

      return nextItems;
    });
  }, [catalogMap, getSceneMetrics]);

  const alignUpperCabinets = useCallback(() => {
    const metrics = getSceneMetrics();
    const cmToPx = metrics.cmToPx || 1;

    setSceneItems((current) =>
      current.map((item) => {
        const product = catalogMap[item.catalog_item_id] || {};
        const dimensions = normalizeProductDimensions(product, item.dimensions);
        if (!isWallMountedProduct(product, dimensions)) return item;

        return {
          ...item,
          position: {
            ...(item.position || {}),
            y: 28 * cmToPx,
            z: 0,
          },
          placement: "wall",
        };
      }),
    );
  }, [catalogMap, getSceneMetrics]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isTyping =
        ["input", "textarea", "select"].includes(activeTag) ||
        document.activeElement?.isContentEditable;

      if (isTyping || selectedSceneIndex === null) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copySceneItem(selectedSceneIndex);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteSceneItem();
        return;
      }

      const movement = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      }[event.key];
      if (!movement) return;

      event.preventDefault();
      const step = event.shiftKey ? 10 : 4;
      setSceneItems((current) =>
        current.map((item, itemIndex) => {
          if (itemIndex !== selectedSceneIndex) return item;
          if (item.locked) return item;

          const product = catalogMap[item.catalog_item_id] || {};
          const position = clampScenePosition(
            item,
            product,
            Number(item.position?.x || 0) + movement[0] * step,
            Number(item.position?.y || 0) + movement[1] * step,
          );

          return {
            ...item,
            position: {
              ...item.position,
              ...position,
            },
          };
        }),
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    catalogMap,
    clampScenePosition,
    copySceneItem,
    pasteSceneItem,
    selectedSceneIndex,
  ]);

  const scenePointFromEvent = (event) => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const { cmToPx } = getSceneMetrics();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cmToPx,
    };
  };

  const handlePaletteDragStart = (event, product) => {
    event.dataTransfer.setData("application/x-kitchen-product", product.id);
    event.dataTransfer.setData("text/plain", product.id);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleSceneDrop = (event) => {
    event.preventDefault();
    const productId =
      event.dataTransfer.getData("application/x-kitchen-product") ||
      event.dataTransfer.getData("text/plain");
    const product = catalogItems.find((item) => item.id === productId);
    if (!product) return;

    const point = scenePointFromEvent(event);
    const size = getSceneItemPixelSize(
      { dimensions: product.dimensions },
      product,
      point.cmToPx || 1,
    );
    addSceneItemAt(
      product,
      point.x - size.width / 2,
      point.y - size.height / 2,
    );
  };

  const handleSceneWheel = (event) => {
    event.preventDefault();
  };

  const handlePaletteProductClick = (product) => {
    const metrics = getSceneMetrics();
    const productSize = getSceneItemPixelSize(
      { dimensions: product.dimensions },
      product,
      metrics.cmToPx,
    );
    addSceneItemAt(
      product,
      Math.max(
        (metrics.width - productSize.width) / 2 + sceneItems.length * 18,
        0,
      ),
      Math.max(
        (metrics.height - productSize.height) / 2 + sceneItems.length * 12,
        0,
      ),
    );
  };

  const handleSceneMouseMove = (event) => {
    if (resizeState) {
      const point = scenePointFromEvent(event);
      const deltaX = point.x - resizeState.startX;
      const deltaY = point.y - resizeState.startY;
      const cmToPx = Number(resizeState.cmToPx || 1);
      const changesWidth =
        resizeState.corner.includes("left") ||
        resizeState.corner.includes("right");
      const changesHeight =
        resizeState.corner.includes("top") ||
        resizeState.corner.includes("bottom");
      const flipsX = resizeState.corner.includes("left");
      const flipsY = resizeState.corner.includes("top");
      const nextWidth = changesWidth
        ? resizeState.startWidth + (flipsX ? -deltaX : deltaX) / cmToPx
        : resizeState.startWidth;
      const nextHeight = changesHeight
        ? resizeState.startHeight + (flipsY ? -deltaY : deltaY) / cmToPx
        : resizeState.startHeight;
      const nextX = flipsX
        ? resizeState.startItemX + deltaX
        : resizeState.startItemX;
      const nextY = flipsY
        ? resizeState.startItemY + deltaY
        : resizeState.startItemY;

      resizeSceneItem(resizeState.index, {
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight,
      });
      return;
    }

    if (!dragState) return;
    const point = scenePointFromEvent(event);
    updateSceneItemPosition(
      dragState.index,
      point.x - dragState.offsetX,
      point.y - dragState.offsetY,
    );
  };

  const handleSceneMouseUp = () => {
    setDragState(null);
    setResizeState(null);
  };

  const handleSceneBackgroundMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      setSelectedSceneIndex(null);
      setSelectedSceneIndices([]);
      setCustomizerOpen(false);
      setPaletteOpen(false);
    }
  };

  const clearSceneSelection = () => {
    setSelectedSceneIndex(null);
    setSelectedSceneIndices([]);
    setCustomizerOpen(false);
    setPaletteOpen(false);
    setDragState(null);
    setResizeState(null);
  };

  const handleSceneItemMouseDown = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    setPaletteOpen(false);
    setSelectedSceneIndex(index);
    setCustomizerOpen(false);
    const point = scenePointFromEvent(event);
    const item = sceneItems[index];
    if (item?.locked) {
      setDragState(null);
      return;
    }
    setDragState({
      index,
      offsetX: point.x - Number(item.position?.x || 0),
      offsetY: point.y - Number(item.position?.y || 0),
    });
  };

  const handleResizeMouseDown = (
    event,
    index,
    corner,
    width,
    height,
    cmToPx,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const point = scenePointFromEvent(event);
    const item = sceneItems[index];

    setSelectedSceneIndex(index);
    setCustomizerOpen(false);
    setDragState(null);
    setResizeState({
      index,
      corner,
      startX: point.x,
      startY: point.y,
      startItemX: Number(item.position?.x || 0),
      startItemY: Number(item.position?.y || 0),
      startWidth: width,
      startHeight: height,
      cmToPx,
    });
  };

  useEffect(() => {
    if (!dragState && !resizeState) return undefined;

    window.addEventListener("mousemove", handleSceneMouseMove);
    window.addEventListener("mouseup", handleSceneMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleSceneMouseMove);
      window.removeEventListener("mouseup", handleSceneMouseUp);
    };
  });

  const updateRoomDimension = (field, value) => {
    const nextDimensions = {
      ...roomDimensions,
      [field]: Math.max(Number(value) || 1, 1),
    };
    const metrics = getSceneMetrics(nextDimensions);

    setRoomDimensions(nextDimensions);
    setSceneItems((current) =>
      current.map((item) => {
        const product = catalogMap[item.catalog_item_id] || {};
        const position = clampScenePosition(
          item,
          product,
          item.position?.x,
          item.position?.y,
          metrics,
        );
        return { ...item, position: { ...item.position, ...position } };
      }),
    );
  };

  const saveProject = () => {
    const payload = normalizeProjectSnapshot({
      id: `project-${Date.now()}`,
      name: projectForm.name || "Yeni mutfak projesi",
      customer_name: projectForm.customer_name || "Musteri",
      template_id: "",
      room_dimensions: cloneProjectData(roomDimensions),
      room_surfaces: cloneProjectData(roomSurfaces),
      items: cloneProjectData(sceneItems),
      installation_fee: installationFee,
      shipping_fee: shippingFee,
      quote: cloneProjectData(quote),
      notes: projectForm.notes || "FE uzerinden kaydedilen proje.",
      created_at: new Date().toISOString(),
    });

    setProjects((current) => {
      const mergedProjects = mergeProjectsById([payload], current);
      writeProjectCache(mergedProjects);
      return mergedProjects;
    });
    setProjectSaveOpen(false);
    setProjectForm({ name: "", customer_name: "", notes: "" });

    postData(SERVER.kitchen.projects, payload)
      .then((project) => {
        if (!project?.id) return;
        const savedProject = normalizeProjectSnapshot({
          ...payload,
          ...project,
          room_dimensions: project.room_dimensions || payload.room_dimensions,
          items:
            Array.isArray(project.items) && project.items.length
              ? project.items
              : payload.items,
          quote: project.quote || payload.quote,
        });
        setProjects((current) => {
          const mergedProjects = current.map((item) =>
            item.id === payload.id ? savedProject : item,
          );
          writeProjectCache(mergedProjects);
          return mergedProjects;
        });
      })
      .catch(() => undefined);
  };

  const startNewProject = useCallback(() => {
    setSceneItems([]);
    setSelectedSceneIndex(null);
    setCustomizerOpen(false);
    setPaletteOpen(false);
    setSceneItemsOpen(false);
    setProjectSaveOpen(false);
    setProjectForm({ name: "", customer_name: "", notes: "" });
    setInstallationFee(0);
    setShippingFee(0);
    setDragState(null);
    setResizeState(null);
    setRoomDimensions({ width: 450, height: 250, depth: 240, unit: "cm" });
    setRoomSurfaces(defaultRoomSurfaces);
  }, []);

  const clearSceneItems = useCallback(() => {
    setSceneItems([]);
    setSelectedSceneIndex(null);
    setCustomizerOpen(false);
    setSceneItemsOpen(false);
    setDragState(null);
    setResizeState(null);
  }, []);

  const exportScenePdf = useCallback(() => {
    const stage = sceneRef.current;
    if (!stage || typeof window === "undefined") return;

    const canvas = stage.querySelector("canvas");
    if (!canvas) return;

    let sceneImage;

    try {
      sceneImage = canvas.toDataURL("image/png");
    } catch {
      return;
    }

    const printWindow = window.open("", "_blank", "width=1280,height=820");

    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Decusin tasarim PDF</title>
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            * { box-sizing: border-box; }
            html, body {
              width: 100%;
              min-height: 100%;
              margin: 0;
              background: #ffffff;
            }
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
              overflow: hidden;
            }
            .decusin-pdf-stage {
              width: 100%;
              height: calc(100vh - 20mm);
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffffff;
            }
            .decusin-pdf-image {
              display: block;
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="decusin-pdf-stage">
            <img class="decusin-pdf-image" src="${sceneImage}" alt="Decusin 3D mutfak sahnesi" />
          </div>
          <script>
            window.onload = function () {
              setTimeout(function () {
                window.focus();
                window.print();
              }, 350);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  const toggleSceneFullscreen = useCallback(() => {
    const stage = sceneRef.current;
    if (!stage || typeof document === "undefined") return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }

    stage.requestFullscreen?.();
  }, []);

  const inspectProject = (project) => {
    const snapshot = normalizeProjectSnapshot(project);

    setSceneItems(cloneProjectData(snapshot.items));
    setRoomDimensions(snapshot.room_dimensions);
    setRoomSurfaces(snapshot.room_surfaces);
    setInstallationFee(snapshot.installation_fee);
    setShippingFee(snapshot.shipping_fee);
    setSelectedSceneIndex(null);
    setCustomizerOpen(false);
    setPaletteOpen(false);
    setSceneItemsOpen(false);
    setProjectSaveOpen(false);
    setDragState(null);
    setResizeState(null);

    if (initialTab !== "designer") {
      window.localStorage.setItem(
        "decusinOpenProject",
        JSON.stringify(snapshot),
      );
      navigate("/kitchen-designer");
    }
  };

  const addCustomer = () => {
    const firstName = customerForm.first_name.trim();
    const lastName = customerForm.last_name.trim();
    if (!firstName && !lastName) return;

    setCustomers((current) => [
      {
        id: `customer-${Date.now()}`,
        ...customerForm,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString(),
      },
      ...current,
    ]);
    setCustomerForm({ first_name: "", last_name: "", address: "", phone: "" });
  };

  const addCatalogItem = (product) => {
    setCatalogItems((current) => [product, ...current]);
    setSelectedCatalogProductId(product.id);
    setSelectedMaterialId(null);
  };

  const addCatalogGroup = (group) => {
    setCatalogGroups((current) => {
      if (group.parentKey) {
        return current.map((item) => {
          if (item.key !== group.parentKey) return item;
          if (item.subcategories?.some((sub) => sub.key === group.key))
            return item;

          return {
            ...item,
            subcategories: [
              ...(item.subcategories || []),
              { key: group.key, title: group.title },
            ],
          };
        });
      }

      if (current.some((item) => item.key === group.key)) return current;
      return [...current, { ...group, subcategories: group.subcategories || [] }];
    });
  };

  const updateCatalogItem = (productId, updater) => {
    setCatalogItems((current) =>
      current.map((product) =>
        product.id === productId ? updater(product) : product,
      ),
    );
  };

  const updateMaterial = (materialId, updater) => {
    setMaterials((current) =>
      current.map((material) =>
        material.id === materialId ? updater(material) : material,
      ),
    );
  };

  const renderDesigner = () => (
    <>
      <KitchenPaletteDrawer
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        catalogGroups={catalogGroups}
        catalogItems={catalogItems}
        onPaletteDragStart={handlePaletteDragStart}
        onPaletteProductClick={handlePaletteProductClick}
        selectedDoor={selectedDoor}
        selectedCounter={selectedCounter}
      />
      <KitchenSceneItemsDrawer
        open={sceneItemsOpen}
        onClose={() => setSceneItemsOpen(false)}
        sceneItems={sceneItems}
        catalogMap={catalogMap}
        selectedSceneIndex={selectedSceneIndex}
        onSelectItem={(index) => {
          setPaletteOpen(false);
          setSceneItemsOpen(false);
          setSelectedSceneIndex(index);
          setSelectedSceneIndices([index]);
          setCustomizerOpen(false);
        }}
        onDeleteItem={removeSceneItem}
        quote={quote}
      />
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 1.5,
          p: 1,
          mb: 1,
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%)",
          boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          alignItems={{ xs: "stretch", lg: "center" }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ display: "none", minWidth: 0 }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                bgcolor: "#0F766E",
                color: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              <ViewInArOutlinedIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 900 }} noWrap>
                {pageTitle}
              </Typography>
              <Typography color="text.secondary" noWrap>
                3D mutfak tasarımı, ürün katalogu, malzeme seçimi ve canlı
                fiyatlandırma.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", xl: "row" }}
            alignItems={{ xs: "stretch", xl: "center" }}
            justifyContent="space-between"
            spacing={1.2}
            sx={{ width: "100%" }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-start"
              spacing={0.75}
              sx={{ flexWrap: "wrap", minWidth: 0 }}
            >
            <Button
              variant="contained"
              startIcon={<Inventory2OutlinedIcon />}
              onClick={() => {
                setSelectedSceneIndex(null);
                setSceneItemsOpen(false);
                setPaletteOpen(true);
              }}
              sx={toolbarPrimaryButtonSx(true)}
            >
              Sahneye Ürün Ekle
            </Button>
            <Button
              variant="outlined"
              startIcon={<LayersOutlinedIcon />}
              onClick={() => {
                setPaletteOpen(false);
                setSceneItemsOpen(true);
              }}
              sx={toolbarPrimaryButtonSx(false)}
            >
              Ekli Ürünler
            </Button>
            <ToolbarSceneToggleControl
              label="Mod"
              active={roomSurfaces.sceneMode === "night"}
              activeTitle="Gece modunda"
              inactiveTitle="Gunduz modunda"
              activeIcon={<NightsStayOutlinedIcon sx={{ fontSize: 17 }} />}
              inactiveIcon={<LightModeOutlinedIcon sx={{ fontSize: 17 }} />}
              onToggle={() =>
                setRoomSurfaces((current) => ({
                  ...current,
                  sceneMode: current.sceneMode === "night" ? "day" : "night",
                }))
              }
            />
            <ToolbarSceneToggleControl
              label="Lamba"
              active={roomSurfaces.lampVisible === true}
              activeTitle="Lamba gorunur"
              inactiveTitle="Lamba gizli"
              activeIcon={<LightbulbOutlinedIcon sx={{ fontSize: 17 }} />}
              inactiveIcon={<LightbulbOutlinedIcon sx={{ fontSize: 17 }} />}
              onToggle={() =>
                setRoomSurfaces((current) => {
                  const nextVisible = current.lampVisible !== true;

                  return {
                    ...current,
                    lampVisible: nextVisible,
                    lightsOn: nextVisible ? current.lightsOn === true : false,
                  };
                })
              }
            />
            <ToolbarSceneToggleControl
              label="Isik"
              active={
                roomSurfaces.lampVisible === true &&
                roomSurfaces.lightsOn === true
              }
              activeTitle="Aydinlatma acik"
              inactiveTitle="Aydinlatma kapali"
              activeIcon={<FlareOutlinedIcon sx={{ fontSize: 17 }} />}
              inactiveIcon={<FlareOutlinedIcon sx={{ fontSize: 17 }} />}
              onToggle={() =>
                setRoomSurfaces((current) => ({
                  ...current,
                  lampVisible: true,
                  lightsOn: current.lightsOn !== true,
                }))
              }
            />
            <ToolbarSceneToggleControl
              label="Tur"
              active={premiumTools.cameraTour}
              activeTitle="Kamera animasyonu acik"
              inactiveTitle="Kamera animasyonu baslat"
              activeIcon={<MovieCreationOutlinedIcon sx={{ fontSize: 17 }} />}
              inactiveIcon={<MovieCreationOutlinedIcon sx={{ fontSize: 17 }} />}
              onToggle={() =>
                setPremiumTools((current) => ({
                  ...current,
                  cameraTour: !current.cameraTour,
                }))
              }
            />
            <ToolbarSceneToggleControl
              label="Ölçü"
              active={premiumTools.measurements}
              activeTitle="Ölçüler görünür"
              inactiveTitle="Ölçüler gizli"
              activeIcon={<StraightenOutlinedIcon sx={{ fontSize: 17 }} />}
              inactiveIcon={<StraightenOutlinedIcon sx={{ fontSize: 17 }} />}
              onToggle={() =>
                setPremiumTools((current) => ({
                  ...current,
                  measurements: !current.measurements,
                }))
              }
            />
            <ToolbarSceneToggleControl
              label="Hizala"
              active={false}
              activeTitle="Ürünleri hizala"
              inactiveTitle="Ürünleri hizala"
              activeIcon={
                <AlignHorizontalCenterOutlinedIcon sx={{ fontSize: 17 }} />
              }
              inactiveIcon={
                <AlignHorizontalCenterOutlinedIcon sx={{ fontSize: 17 }} />
              }
              onToggle={autoAlignSceneItems}
            />
            <ToolbarSceneToggleControl
              label="Üst Hiz"
              active={false}
              activeTitle="Üst dolapları hizala"
              inactiveTitle="Üst dolapları hizala"
              activeIcon={
                <AlignHorizontalCenterOutlinedIcon sx={{ fontSize: 17 }} />
              }
              inactiveIcon={
                <AlignHorizontalCenterOutlinedIcon sx={{ fontSize: 17 }} />
              }
              onToggle={alignUpperCabinets}
            />
            <ToolbarSceneToggleControl
              label="Kilit"
              active={
                selectedSceneIndex !== null &&
                sceneItems[selectedSceneIndex]?.locked
              }
              activeTitle="Secili urun kilitli"
              inactiveTitle="Secili urunu kilitle"
              disabled={selectedItemCount === 0}
              activeIcon={<LockOutlinedIcon sx={{ fontSize: 17 }} />}
              inactiveIcon={<LockOpenOutlinedIcon sx={{ fontSize: 17 }} />}
              onToggle={toggleSelectedItemLock}
            />
            <ToolbarSceneToggleControl
              label="Geri"
              active={false}
              activeTitle="Geri al"
              inactiveTitle="Geri al"
              disabled={!undoStack.length}
              activeIcon={<UndoOutlinedIcon sx={{ fontSize: 17 }} />}
              inactiveIcon={<UndoOutlinedIcon sx={{ fontSize: 17 }} />}
              onToggle={undoSceneChange}
            />
            <ToolbarSceneToggleControl
              label="Ileri"
              active={false}
              activeTitle="Ileri al"
              inactiveTitle="Ileri al"
              disabled={!redoStack.length}
              activeIcon={<RedoOutlinedIcon sx={{ fontSize: 17 }} />}
              inactiveIcon={<RedoOutlinedIcon sx={{ fontSize: 17 }} />}
              onToggle={redoSceneChange}
            />
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={{ xs: "flex-start", xl: "flex-end" }}
              spacing={0.55}
              sx={{ flexWrap: "wrap", minWidth: 0 }}
            >
            <ToolbarNumberControl
              label="Genislik"
              value={roomDimensions.width}
              onChange={(value) => updateRoomDimension("width", value)}
            />
            <ToolbarNumberControl
              label="Yukseklik"
              value={roomDimensions.height}
              onChange={(value) => updateRoomDimension("height", value)}
            />
            <ToolbarFloorPatternControl
              value={roomSurfaces.floorPattern}
              onChange={(floorPattern) =>
                setRoomSurfaces((current) => ({
                  ...current,
                  floorPattern,
                }))
              }
            />
            {[
              ["backWall", "Arka"],
              ["sideWall", "Yan"],
              ["ceiling", "Tavan"],
            ].map(([field, label]) => (
              <ToolbarColorControl
                key={field}
                label={label}
                value={roomSurfaces[field]}
                onChange={(value) =>
                  setRoomSurfaces((current) => ({
                    ...current,
                    [field]: value,
                  }))
                }
              />
            ))}
            <Paper
              elevation={0}
              sx={{
                display: "none",
                px: 1.2,
                py: 0.8,
                border: "1px solid #D7E3F1",
                borderRadius: 1.5,
                bgcolor: "rgba(255,255,255,0.92)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  sx={{ fontWeight: 900, whiteSpace: "nowrap", p: 2 }}
                >
                  Mutfak Ölçüleri
                </Typography>
                <TextField
                  label="Genislik"
                  type="number"
                  size="small"
                  value={roomDimensions.width}
                  onChange={(event) =>
                    updateRoomDimension("width", event.target.value)
                  }
                  sx={{ width: 106 }}
                />
                <TextField
                  label="Yukseklik"
                  type="number"
                  size="small"
                  value={roomDimensions.height}
                  onChange={(event) =>
                    updateRoomDimension("height", event.target.value)
                  }
                  sx={{ width: 106 }}
                />
                <Typography variant="caption" color="text.secondary">
                  cm
                </Typography>
              </Stack>
            </Paper>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <KitchenScene
            sceneRef={sceneRef}
            sceneItems={sceneItems}
            catalogMap={catalogMap}
            materialMap={materialMap}
            selectedDoor={selectedDoor}
            selectedGlass={selectedGlass}
            selectedCounter={selectedCounter}
            selectedSceneIndex={selectedSceneIndex}
            selectedSceneIndices={selectedSceneIndices}
            roomDimensions={roomDimensions}
            roomSurfaces={roomSurfaces}
            premiumTools={premiumTools}
            cameraPresetSignal={cameraPresetSignal}
            dragState={dragState}
            zoom={zoom}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleSceneDrop}
            onWheel={handleSceneWheel}
            onMouseMove={handleSceneMouseMove}
            onMouseUp={handleSceneMouseUp}
            onBackgroundMouseDown={handleSceneBackgroundMouseDown}
            onClearSelection={clearSceneSelection}
            onSceneItemMouseDown={handleSceneItemMouseDown}
            onSelectItem={selectSceneItem}
            onMoveItem3D={updateSceneItemPosition3D}
            onResizeMouseDown={handleResizeMouseDown}
            onCopyItem={duplicateSceneItem}
            onDeleteItem={removeSceneItem}
            onOpenCustomizer={(index) => {
              if (typeof index === "number") {
                setSelectedSceneIndex(index);
              }
              setCustomizerOpen(true);
            }}
            onRotateItem={rotateSceneItem}
            onNewProject={startNewProject}
            onSaveProject={() => setProjectSaveOpen(true)}
            onClearItems={clearSceneItems}
            onChangeRoomDimension={updateRoomDimension}
            onChangeRoomSurface={(field, value) =>
              setRoomSurfaces((current) => ({
                ...current,
                [field]: value,
              }))
            }
            onExportPdf={exportScenePdf}
            onToggleFullscreen={toggleSceneFullscreen}
            onSelectCameraView={(preset) => {
              setPremiumTools((current) => ({
                ...current,
                topView: preset === "ust",
              }));
              setCameraPresetSignal({ preset, tick: Date.now() });
            }}
            onToggleSceneWalls={() => {
              const allVisible =
                premiumTools.walls &&
                roomSurfaces.backWallVisible !== false &&
                roomSurfaces.leftWallVisible !== false &&
                roomSurfaces.rightWallVisible !== false &&
                roomSurfaces.ceilingVisible !== false;

              setPremiumTools((current) => ({
                ...current,
                walls: !allVisible,
              }));
              setRoomSurfaces((current) => ({
                ...current,
                backWallVisible: !allVisible,
                leftWallVisible: !allVisible,
                rightWallVisible: !allVisible,
                ceilingVisible: !allVisible,
              }));
            }}
            onToggleRoomSurface={(field) => {
              if (!premiumTools.walls) {
                setPremiumTools((current) => ({
                  ...current,
                  walls: true,
                }));
                setRoomSurfaces((current) => ({
                  ...current,
                  backWallVisible: false,
                  leftWallVisible: false,
                  rightWallVisible: false,
                  ceilingVisible: false,
                  [field]: true,
                }));
                return;
              }

              setRoomSurfaces((current) => ({
                ...current,
                [field]: current[field] === false,
              }));
            }}
          />
        </Grid>
      </Grid>
      <KitchenCustomizer
        open={customizerOpen && Boolean(selectedSceneItem)}
        onClose={() => setCustomizerOpen(false)}
        selectedSceneIndex={selectedSceneIndex}
        selectedSceneItem={selectedSceneItem}
        selectedProduct={selectedProduct}
        selectedDimensions={selectedDimensions}
        selectedOptions={selectedOptions}
        selectedElevation={selectedElevation}
        materials={materials}
        selectedDoorMaterial={selectedDoorMaterial}
        selectedGlassMaterial={selectedGlassMaterial}
        selectedCounterMaterial={selectedCounterMaterial}
        onChangeDimension={updateSceneItemDimensions}
        onChangeElevation={updateSceneItemElevation}
        onChangeOption={updateSceneItemOption}
        onRotateItem={rotateSceneItem}
        onRemoveItem={removeSceneItem}
        quote={quote}
        selectedLineQuote={selectedLineQuote}
      />
      <Dialog
        open={projectSaveOpen}
        onClose={() => setProjectSaveOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          Musteriye Ozel Proje Kaydet
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Proje adi"
              size="small"
              value={projectForm.name}
              onChange={(event) =>
                setProjectForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Orn: Yilmaz ailesi mutfak tasarimi"
            />
            <TextField
              label="Musteri adi"
              size="small"
              value={projectForm.customer_name}
              onChange={(event) =>
                setProjectForm((current) => ({
                  ...current,
                  customer_name: event.target.value,
                }))
              }
              placeholder="Musteri / firma adi"
            />
            <TextField
              label="Not"
              size="small"
              multiline
              minRows={3}
              value={projectForm.notes}
              onChange={(event) =>
                setProjectForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
            <Paper
              elevation={0}
              sx={{ border: "1px solid #E2E8F0", borderRadius: 1.5, p: 1.5 }}
            >
              <Typography sx={{ fontWeight: 900 }}>
                {sceneItems.length} ürün kaydedilecek
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam teklif: {money(quote.total)}
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setProjectSaveOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Vazgeç
          </Button>
          <Button
            variant="contained"
            onClick={saveProject}
            sx={{ textTransform: "none", fontWeight: 900 }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  const renderCatalog = () => (
    <KitchenCatalogManager
      catalogItems={catalogItems}
      catalogGroups={catalogGroups}
      materials={materials}
      selectedProduct={selectedCatalogProduct}
      selectedMaterial={selectedMaterial}
      onSelectProduct={(product) => {
        setSelectedMaterialId(null);
        setSelectedCatalogProductId(product.id);
      }}
      onCloseProduct={() => setSelectedCatalogProductId(null)}
      onUpdateProduct={updateCatalogItem}
      onAddProduct={addCatalogItem}
      onAddCatalogGroup={addCatalogGroup}
      onSelectMaterial={(material) => {
        setSelectedCatalogProductId(null);
        setSelectedMaterialId(material.id);
      }}
      onCloseMaterial={() => setSelectedMaterialId(null)}
      onUpdateMaterial={updateMaterial}
    />
  );

  const renderPricing = () => (
    <Paper
      elevation={0}
      sx={{ border: "1px solid #E2E8F0", borderRadius: 2, p: 2 }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Fiyat motoru taslagi
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 900 }}>
        {money(quote?.total)}
      </Typography>
      <Typography color="text.secondary">
        {sceneItems.length} sahne itemi icin ara toplam {money(quote?.subtotal)}
        .
      </Typography>
    </Paper>
  );

  const renderProjects = () => (
    <Stack spacing={1.5}>
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 2,
          p: 2,
          bgcolor: "#FFFFFF",
          boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="flex-start"
          spacing={1}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Kayitli projeler
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Musteri veya proje adina gore ara.
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Proje veya musteri ara"
            value={projectSearch}
            onChange={(event) => {
              setProjectSearch(event.target.value);
              setProjectPage(1);
            }}
            sx={{ width: { xs: "100%", md: 360 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 2,
          p: 1.5,
          boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
        }}
      >
        <Stack spacing={1}>
          {pagedProjects.length ? (
            pagedProjects.map((project) => (
              <Stack
                key={project.id}
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                spacing={1.5}
                sx={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 1.5,
                  p: 1.5,
                  bgcolor: "#FFFFFF",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900 }} noWrap>
                    {project.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {project.customer_name || "Musteri yok"} -{" "}
                    {project.items?.length || 0} kalem
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="flex-end"
                  spacing={1}
                >
                  <Chip label={money(project.quote?.total || 0)} />
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() => inspectProject(project)}
                    sx={{ textTransform: "none", fontWeight: 900 }}
                  >
                    Incele
                  </Button>
                </Stack>
              </Stack>
            ))
          ) : (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              Aramaya uygun proje bulunamadi.
            </Typography>
          )}
        </Stack>
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
          <Pagination
            page={projectPage}
            count={projectPageCount}
            onChange={(_, page) => setProjectPage(page)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      </Paper>
    </Stack>
  );

  const renderCustomers = () => (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={4}>
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #E2E8F0",
            borderRadius: 2,
            p: 2,
            background: "linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%)",
            boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#0F766E",
                  color: "#FFFFFF",
                }}
              >
                <PersonAddAltOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Kullanici Ekle
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Musteri bilgilerini kaydet.
                </Typography>
              </Box>
            </Stack>
            {[
              ["first_name", "Ad"],
              ["last_name", "Soyad"],
              ["phone", "Telefon"],
              ["address", "Adres"],
            ].map(([field, label]) => (
              <TextField
                key={field}
                label={label}
                size="small"
                multiline={field === "address"}
                minRows={field === "address" ? 3 : undefined}
                value={customerForm[field]}
                onChange={(event) =>
                  setCustomerForm((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
              />
            ))}
            <Button
              variant="contained"
              startIcon={<PersonAddAltOutlinedIcon />}
              onClick={addCustomer}
              disabled={
                !customerForm.first_name.trim() &&
                !customerForm.last_name.trim()
              }
              sx={{ textTransform: "none", fontWeight: 900 }}
            >
              Musteriyi Kaydet
            </Button>
          </Stack>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #E2E8F0",
            borderRadius: 2,
            p: 2,
            boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
            Musteri Listesi
          </Typography>
          <Stack spacing={1}>
            {customers.length ? (
              customers.map((customer) => (
                <Stack
                  key={customer.id}
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  spacing={1}
                  sx={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 1.5,
                    p: 1.5,
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 900 }}>
                      {customer.first_name} {customer.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {customer.phone || "Telefon yok"}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {customer.address || "Adres yok"}
                  </Typography>
                </Stack>
              ))
            ) : (
              <Typography color="text.secondary">
                Henuz musteri eklenmedi.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Page
      title={pageTitle}
      noHeader
      sx={{
        ...(tab === 0 && {
          minHeight: "100%",
          bgcolor: "#FFFFFF",
        }),
      }}
    >
      <Stack
        spacing={tab === 0 ? 1 : tab === 1 ? 1.5 : 2.5}
        sx={{
          p: { xs: 2, md: 3 },
          ...(tab === 0 && {
            height: "100%",
            overflow: "hidden",
            bgcolor: "#FFFFFF",
          }),
        }}
      >
        {tab !== 0 && (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              p: 2,
              background: "linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%)",
              boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#0F766E",
                    color: "#FFFFFF",
                  }}
                >
                  <ViewInArOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {pageTitle}
                  </Typography>
                  <Typography color="text.secondary">
                    3D mutfak tasarımı, ürün katalogu, malzeme seçimi ve canlı
                    fiyatlandırma.
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        )}

        {tab === 0 && renderDesigner()}
        {tab === 1 && renderCatalog()}
        {tab === 2 && renderPricing()}
        {tab === 3 && renderProjects()}
        {tab === 4 && renderCustomers()}
      </Stack>
    </Page>
  );
};

export default KitchenStudioPage;
