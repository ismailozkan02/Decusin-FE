import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
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
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import Page from "components/Page";
import { SERVER } from "routes/paths";
import axiosInstance, {
  deleteData,
  getData,
  postData,
  putData,
} from "utils/axiosForPhyton";
import AlignHorizontalCenterOutlinedIcon from "@mui/icons-material/AlignHorizontalCenterOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KitchenCatalogManager from "./components/KitchenCatalogManager";
import KitchenCustomizer from "./components/KitchenCustomizer";
import KitchenPaletteDrawer from "./components/KitchenPaletteDrawer";
import PremiumDialog from "./components/PremiumDialog";
import KitchenScene from "./components/KitchenScene";
import KitchenSceneItemsDrawer from "./components/KitchenSceneItemsDrawer";
import {
  TABS,
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

const emptyCustomerForm = {
  first_name: "",
  last_name: "",
  address: "",
  phone: "",
};

const getPayloadList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normalizeCustomer = (customer = {}) => ({
  id: customer.id || customer._id || `customer-${Date.now()}`,
  first_name: customer.first_name || customer.firstName || "",
  last_name: customer.last_name || customer.lastName || "",
  phone: customer.phone || "",
  address: customer.address || "",
  created_at: customer.created_at || customer.createdAt || "",
  ...customer,
});

const buildCustomerPayload = (form) => ({
  first_name: form.first_name.trim(),
  last_name: form.last_name.trim(),
  phone: form.phone.trim(),
  address: form.address.trim(),
});

const getCustomerDisplayName = (customer = {}) =>
  `${customer.first_name || ""} ${customer.last_name || ""}`.trim();

const normalizeSearchText = (value = "") =>
  value.trim().toLocaleLowerCase("tr-TR");

const buildCustomerFromName = (name) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] || name.trim(),
    last_name: parts.slice(1).join(" "),
    phone: "",
    address: "",
  };
};

const formatProjectDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getProjectTotal = (project) =>
  Number(project?.quote?.total || project?.total || 0);

const defaultRoomSurfaces = {
  floor: "#DDBF86",
  floorPattern: "rusticBrown",
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
    value: "mosaicOak",
    label: "Kare meşe parke",
    preview:
      "linear-gradient(90deg, #9D693E 0 16px, #D39A58 16px 32px, #7D5636 32px 48px, #E0AF68 48px 64px)",
  },
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
  {
    value: "whiteOak",
    label: "Beyaz meşe",
    preview:
      "repeating-linear-gradient(90deg, #F8EED1 0 15px, #E4CF9B 15px 30px, #FFF6DC 30px 45px)",
  },
  {
    value: "sandOak",
    label: "Kum meşe",
    preview:
      "repeating-linear-gradient(90deg, #D7B878 0 14px, #EBCF91 14px 28px, #B99758 28px 42px)",
  },
  {
    value: "honeyHerringbone",
    label: "Bal balıksırtı",
    preview:
      "repeating-linear-gradient(45deg, #C98431 0 8px, #F0BE62 8px 16px, #A86522 16px 24px)",
  },
  {
    value: "amberChevron",
    label: "Amber chevron",
    preview:
      "repeating-linear-gradient(135deg, #B8752D 0 8px, #E3A94D 8px 16px, #80511F 16px 24px)",
  },
  {
    value: "espresso",
    label: "Espresso",
    preview:
      "repeating-linear-gradient(90deg, #21140E 0 16px, #4A2A19 16px 32px, #120B08 32px 48px)",
  },
  {
    value: "charcoalOak",
    label: "Antrasit meşe",
    preview:
      "repeating-linear-gradient(90deg, #303236 0 16px, #565A5D 16px 32px, #1C1E21 32px 48px)",
  },
  {
    value: "silverAsh",
    label: "Gümüş dişbudak",
    preview:
      "repeating-linear-gradient(90deg, #C9CBC6 0 16px, #ECEAE2 16px 32px, #9C9F99 32px 48px)",
  },
  {
    value: "smokeChevron",
    label: "Duman chevron",
    preview:
      "repeating-linear-gradient(135deg, #74736A 0 8px, #A9A79B 8px 16px, #4F504B 16px 24px)",
  },
  {
    value: "copperPlank",
    label: "Bakır",
    preview:
      "repeating-linear-gradient(90deg, #8E4C20 0 14px, #C77933 14px 28px, #633115 28px 42px)",
  },
  {
    value: "mapleLight",
    label: "Akçaağaç",
    preview:
      "repeating-linear-gradient(90deg, #F3DDA9 0 16px, #FFECC3 16px 32px, #DDBD7D 32px 48px)",
  },
  {
    value: "graphitePlank",
    label: "Grafit",
    preview:
      "repeating-linear-gradient(90deg, #20242A 0 16px, #3E4650 16px 32px, #11151A 32px 48px)",
  },
];

const floorPatternLabels = {
  mosaicOak: "Kare meşe parke",
  oakHerringbone: "Açık balıksırtı",
  warmPlank: "Sıcak meşe",
  naturalChevron: "Doğal chevron",
  paleOak: "Soluk meşe",
  classicOak: "Klasik meşe",
  goldenChevron: "Altın chevron",
  walnutPlank: "Ceviz",
  darkWalnut: "Koyu ceviz",
  smokedOak: "Füme meşe",
  blackChevron: "Siyah chevron",
  grayAsh: "Gri dişbudak",
  rusticBrown: "Rustik Parke",
};

const getFloorPatternLabel = (option) => {
  const labels = {
    mosaicOak: "Kare meşe",
    oakHerringbone: "Açık balık",
    warmPlank: "Sıcak meşe",
    naturalChevron: "Doğal",
    paleOak: "Soluk meşe",
    classicOak: "Klasik meşe",
    goldenChevron: "Altın",
    walnutPlank: "Ceviz",
    darkWalnut: "Koyu ceviz",
    smokedOak: "Füme meşe",
    blackChevron: "Siyah",
    grayAsh: "Gri",
    rusticBrown: "Rustik",
    whiteOak: "Beyaz",
    sandOak: "Kum meşe",
    honeyHerringbone: "Bal",
    amberChevron: "Amber",
    espresso: "Espresso",
    charcoalOak: "Antrasit",
    silverAsh: "Gümüş",
    smokeChevron: "Duman",
    copperPlank: "Bakır",
    mapleLight: "Akçaağ.",
    graphitePlank: "Grafit",
  };

  return labels[option?.value] || floorPatternLabels[option?.value] || "Parke";
};

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
  if (
    product?.category === "countertop" ||
    isCountertopMountedProduct(product)
  ) {
    return false;
  }

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
  iconColor,
  activeIconColor,
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
        color: active ? activeIconColor || "#1976D2" : iconColor || "#64748B",
        bgcolor: active ? "#EFF6FF" : "#F8FAFC",
        boxShadow: active ? "inset 0 0 0 1px rgba(25,118,210,0.1)" : "none",
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
    floorPatternOptions.find((option) => option.value === "rusticBrown") ||
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
        <Typography
          sx={{
            display: "none",
            mb: 0.8,
            fontSize: 12,
            fontWeight: 900,
            color: "#334155",
          }}
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
          {floorPatternOptions.map((option) => {
            const optionLabel = getFloorPatternLabel(option);

            return (
              <Box
                key={option.value}
                component="button"
                type="button"
                title={optionLabel}
                aria-label={optionLabel}
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
                    fontSize: 9,
                    fontWeight: 900,
                    color: "#334155",
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  {optionLabel}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Popover>
    </>
  );
};

const showLegacyScenePrecisionControls = () => false;

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

const extractApiList = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.payload?.data)) return result.payload.data;
  if (Array.isArray(result?.payload)) return result.payload;
  return [];
};

const buildCatalogItemPayload = (product) => ({
  sku: product.sku,
  name: product.name,
  category: product.category,
  subcategory: product.subcategory || "",
  dimensions: product.dimensions || { width: 60, height: 72, depth: 56, unit: "cm" },
  constraints: product.constraints || null,
  base_price: Number(product.base_price || 0),
  image_url: product.image_url || "",
  model_url: product.model_url || "",
  thumbnail_url: product.thumbnail_url || "",
  original_file_name: product.original_file_name || "",
  configurable_options: product.configurable_options || {},
  is_active: product.is_active !== false,
  is_manual: Boolean(product.is_manual),
});

const KitchenStudioPage = ({ initialTab = "designer" }) => {
  const navigate = useNavigate();
  const sceneRef = useRef(null);
  const copiedSceneItemRef = useRef(null);
  const skipSceneHistoryRef = useRef(false);
  const lastSceneItemsSnapshotRef = useRef(null);
  const loadedKitchenDataRef = useRef({
    catalog: false,
    customers: false,
    materials: false,
    projects: false,
  });
  const tab = TABS[initialTab] || 0;
  const [pendingProject] = useState(() => {
    const project = consumePendingProject(initialTab);
    return project ? normalizeProjectSnapshot(project) : null;
  });
  const [activeProject, setActiveProject] = useState(pendingProject);
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogGroups, setCatalogGroups] = useState([]);
  const [materialGroups, setMaterialGroups] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [catalogStats, setCatalogStats] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(() =>
    ["designer", "catalog"].includes(initialTab),
  );
  const [projects, setProjects] = useState(() => readProjectCache());
  const [projectsLoading, setProjectsLoading] = useState(
    () => initialTab === "projects" && readProjectCache().length === 0,
  );
  const [selectedDoorMaterial] = useState("mat-door-lake-white");
  const [selectedGlassMaterial] = useState("mat-glass-smoked");
  const [selectedCounterMaterial] = useState("mat-counter-quartz");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sceneItemsOpen, setSceneItemsOpen] = useState(false);
  const [projectSaveOpen, setProjectSaveOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    customer_id: null,
    customer_name: "",
    notes: "",
  });
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(
    initialTab === "customers",
  );
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
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
    autoHideWalls: true,
    clearanceMeasurements: false,
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
    const shouldLoadCatalog = ["designer", "catalog"].includes(initialTab);
    if (
      !shouldLoadCatalog ||
      (loadedKitchenDataRef.current.catalog &&
        catalogItems.length &&
        catalogGroups.length)
    ) {
      return undefined;
    }

    let mounted = true;
    loadedKitchenDataRef.current.catalog = true;
    setCatalogLoading(true);

    Promise.allSettled([
      getData(SERVER.kitchen.catalogItems),
      getData(SERVER.kitchen.catalogCategories, { scope: "product" }),
      getData(SERVER.kitchen.catalogStats),
    ]).then((results) => {
      if (!mounted) return;

      const [
        catalogResult,
        productCategoryResult,
        statsResult,
      ] = results;
      if (catalogResult.status === "fulfilled") {
        const serverCatalogItems = extractApiList(catalogResult.value);
        setCatalogItems(serverCatalogItems);
        if (catalogResult.value?.stats) {
          setCatalogStats(catalogResult.value.stats);
        }
      }
      if (productCategoryResult.status === "fulfilled") {
        const productGroups = extractApiList(productCategoryResult.value);
        setCatalogGroups(productGroups);
      }
      if (statsResult.status === "fulfilled") {
        setCatalogStats(statsResult.value?.payload || statsResult.value || null);
      }
      setCatalogLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [initialTab, catalogItems.length, catalogGroups.length]);

  const ensureMaterialCatalog = useCallback(() => {
    if (loadedKitchenDataRef.current.materials) {
      return Promise.resolve();
    }

    loadedKitchenDataRef.current.materials = true;
    setMaterialsLoading(true);
    return Promise.allSettled([
      getData(SERVER.kitchen.materials),
      getData(SERVER.kitchen.catalogCategories, { scope: "material" }),
    ]).then((results) => {
      const [materialResult, materialCategoryResult] = results;
      if (materialResult.status === "fulfilled") {
        setMaterials(extractApiList(materialResult.value));
      }
      if (materialCategoryResult.status === "fulfilled") {
        setMaterialGroups(extractApiList(materialCategoryResult.value));
      }
    }).finally(() => setMaterialsLoading(false));
  }, []);

  useEffect(() => {
    if (!customizerOpen || !selectedSceneItem) return undefined;
    ensureMaterialCatalog();
    return undefined;
  }, [customizerOpen, ensureMaterialCatalog, selectedSceneItem]);

  useEffect(() => {
    if (initialTab !== "projects" || loadedKitchenDataRef.current.projects) {
      return undefined;
    }

    let mounted = true;
    loadedKitchenDataRef.current.projects = true;

    getData(SERVER.kitchen.projects)
      .then((result) => {
        if (!mounted) return;
        setProjects((current) => {
          const mergedProjects = mergeProjectsById(
            current,
            extractApiList(result),
            readProjectCache(),
          );
          writeProjectCache(mergedProjects);
          return mergedProjects;
        });
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setProjectsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [initialTab]);

  useEffect(() => {
    const shouldLoadCustomers = initialTab === "customers" || projectSaveOpen;
    if (
      !shouldLoadCustomers ||
      (initialTab !== "customers" && loadedKitchenDataRef.current.customers)
    ) {
      return undefined;
    }

    let mounted = true;
    loadedKitchenDataRef.current.customers = true;

    getData(SERVER.kitchen.customers)
      .then((result) => {
        if (!mounted) return;
        setCustomers(getPayloadList(result).map(normalizeCustomer));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted && initialTab === "customers") setCustomersLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [initialTab, projectSaveOpen]);

  useEffect(() => {
    if (initialTab !== "designer") return;

    postData(SERVER.kitchen.quote, {
      items: sceneItems,
      include_installation: true,
      installation_fee: installationFee,
      shipping_fee: shippingFee,
    })
      .then(() => undefined)
      .catch(() => undefined);
  }, [initialTab, installationFee, sceneItems, shippingFee]);

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
    const options = { ...(product.default_options || {}) };
    const subcategory = String(product?.subcategory || "");
    if (["base_cabinet", "wall_cabinet"].includes(product.category)) {
      if (!options.door_material_id) {
        options.door_material_id = subcategory.includes("handleless")
          ? "mat-door-anthracite"
          : subcategory.includes("drawer")
            ? "mat-door-wood-oak"
            : selectedDoorMaterial;
      }
    }
    if (product.category === "wall_cabinet") {
      options.glass_material_id ||= subcategory.includes("glass")
        ? "mat-glass-clear"
        : selectedGlassMaterial;
    }
    if (product.category === "countertop") {
      options.countertop_material_id ||= selectedCounterMaterial;
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
    let nextIndex = 0;
    setSceneItems((current) => {
      nextIndex = current.length;
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
    setSelectedSceneIndex(nextIndex);
    setSelectedSceneIndices([nextIndex]);
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
      setRedoStack((redoCurrent) =>
        [cloneProjectData(sceneItems), ...redoCurrent].slice(0, 40),
      );
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
      setUndoStack((undoCurrent) =>
        [...undoCurrent, cloneProjectData(sceneItems)].slice(-40),
      );
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
        const placement =
          item.placement || getProductPlacement(product, dimensions);

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

  const alignLowerCabinets = useCallback(() => {
    setSceneItems((current) =>
      current.map((item) => {
        const product = catalogMap[item.catalog_item_id] || {};
        const dimensions = normalizeProductDimensions(product, item.dimensions);
        if (
          isWallMountedProduct(product, dimensions) ||
          product.category === "countertop" ||
          isCountertopMountedProduct(product)
        )
          return item;

        return {
          ...item,
          position: {
            ...(item.position || {}),
            z: 0,
            elevation: 0,
          },
          placement: "floor",
        };
      }),
    );
  }, [catalogMap]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isTyping =
        ["input", "textarea", "select"].includes(activeTag) ||
        document.activeElement?.isContentEditable;

      if (isTyping) return;

      const isUndoShortcut =
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === "z";
      const isRedoShortcut =
        (event.ctrlKey || event.metaKey) &&
        (event.key.toLowerCase() === "y" ||
          (event.shiftKey && event.key.toLowerCase() === "z"));

      if (isUndoShortcut) {
        event.preventDefault();
        undoSceneChange();
        return;
      }

      if (isRedoShortcut) {
        event.preventDefault();
        redoSceneChange();
        return;
      }

      if (selectedSceneIndex === null) return;

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
    redoSceneChange,
    selectedSceneIndex,
    undoSceneChange,
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

  const ensureProjectCustomer = () => {
    const customerName = projectForm.customer_name.trim();
    if (!customerName) return Promise.resolve(null);

    const selectedCustomer = customers.find(
      (customer) => customer.id === projectForm.customer_id,
    );
    if (selectedCustomer) return Promise.resolve(selectedCustomer);

    const matchedCustomer = customers.find(
      (customer) =>
        normalizeSearchText(getCustomerDisplayName(customer)) ===
        normalizeSearchText(customerName),
    );
    if (matchedCustomer) return Promise.resolve(matchedCustomer);

    return postData(SERVER.kitchen.customers, buildCustomerFromName(customerName)).then(
      (result) => {
        const savedCustomer = normalizeCustomer(result?.data || result);
        setCustomers((current) => [savedCustomer, ...current]);
        return savedCustomer;
      },
    );
  };

  const saveProject = () => {
    if (projectSaving) return;

    setProjectSaving(true);
    ensureProjectCustomer()
      .then((projectCustomer) => {
        const isUpdate = Boolean(activeProject?.id);
        const payload = normalizeProjectSnapshot({
          id: activeProject?.id || `project-${Date.now()}`,
          name: projectForm.name || "Yeni mutfak projesi",
          customer_id: projectCustomer?.id || projectForm.customer_id || null,
          customer_name:
            getCustomerDisplayName(projectCustomer) ||
            projectForm.customer_name ||
            "Musteri",
          template_id: "",
          room_dimensions: cloneProjectData(roomDimensions),
          room_surfaces: cloneProjectData(roomSurfaces),
          items: cloneProjectData(sceneItems),
          installation_fee: installationFee,
          shipping_fee: shippingFee,
          quote: cloneProjectData(quote),
          notes: projectForm.notes || "FE uzerinden kaydedilen proje.",
          created_at: activeProject?.created_at || new Date().toISOString(),
        });

        setProjects((current) => {
          const mergedProjects = isUpdate
            ? current.map((item) => (item.id === payload.id ? payload : item))
            : mergeProjectsById([payload], current);
          writeProjectCache(mergedProjects);
          return mergedProjects;
        });
        setActiveProject(payload);
        setProjectSaveOpen(false);
        setProjectForm({ name: "", customer_id: null, customer_name: "", notes: "" });

        const request = isUpdate
          ? putData(SERVER.kitchen.project(payload.id), payload)
          : postData(SERVER.kitchen.projects, payload);

        return request.then((project) => {
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
          setActiveProject(savedProject);
          setProjects((current) => {
            const mergedProjects = current.some((item) => item.id === payload.id)
              ? current.map((item) =>
                  item.id === payload.id ? savedProject : item,
                )
              : mergeProjectsById([savedProject], current);
            writeProjectCache(mergedProjects);
            return mergedProjects;
          });
        });
      })
      .catch(() => undefined)
      .finally(() => setProjectSaving(false));
  };

  const startNewProject = useCallback(() => {
    setSceneItems([]);
    setSelectedSceneIndex(null);
    setCustomizerOpen(false);
    setPaletteOpen(false);
    setSceneItemsOpen(false);
    setProjectSaveOpen(false);
    setActiveProject(null);
    setProjectForm({ name: "", customer_id: null, customer_name: "", notes: "" });
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

    setActiveProject(snapshot);
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

  const removeProject = (project) => {
    if (activeProject?.id === project.id) {
      setActiveProject(null);
    }

    setProjects((current) => {
      const nextProjects = current.filter((item) => item.id !== project.id);
      writeProjectCache(nextProjects);
      return nextProjects;
    });

    deleteData(SERVER.kitchen.project(project.id)).catch(() => undefined);
  };

  const requestProjectDelete = (project) => {
    setDeleteConfirmation({
      type: "project",
      item: project,
      title: "Projeyi Sil",
      message: `"${project.name || "Secili proje"}" kalici olarak silinsin mi?`,
      detail: "Bu islem geri alinamaz.",
    });
  };

  const openProjectSaveDialog = () => {
    setProjectForm({
      name: activeProject?.name || "",
      customer_id: activeProject?.customer_id || null,
      customer_name: activeProject?.customer_name || "",
      notes: activeProject?.notes || "",
    });
    setProjectSaveOpen(true);
  };

  const openCreateCustomerDialog = () => {
    setEditingCustomer(null);
    setCustomerForm(emptyCustomerForm);
    setCustomerDialogOpen(true);
  };

  const openEditCustomerDialog = (customer) => {
    const normalizedCustomer = normalizeCustomer(customer);
    setEditingCustomer(normalizedCustomer);
    setCustomerForm({
      first_name: normalizedCustomer.first_name,
      last_name: normalizedCustomer.last_name,
      phone: normalizedCustomer.phone,
      address: normalizedCustomer.address,
    });
    setCustomerDialogOpen(true);
  };

  const closeCustomerDialog = () => {
    if (customerSaving) return;
    setCustomerDialogOpen(false);
    setEditingCustomer(null);
    setCustomerForm(emptyCustomerForm);
  };

  const saveCustomer = () => {
    const payload = buildCustomerPayload(customerForm);
    if (!payload.first_name && !payload.last_name) return;

    setCustomerSaving(true);
    const request = editingCustomer
      ? putData(SERVER.kitchen.customer(editingCustomer.id), payload)
      : postData(SERVER.kitchen.customers, payload);

    request
      .then((result) => {
        const savedCustomer = normalizeCustomer(
          result?.data ||
            result || {
              ...editingCustomer,
              ...payload,
              id: editingCustomer?.id || `customer-${Date.now()}`,
            },
        );

        setCustomers((current) => {
          if (editingCustomer) {
            return current.map((customer) =>
              customer.id === editingCustomer.id ? savedCustomer : customer,
            );
          }

          return [savedCustomer, ...current];
        });
        if (editingCustomer) {
          const savedCustomerName = getCustomerDisplayName(savedCustomer);
          setProjects((current) => {
            const nextProjects = current.map((project) =>
              project.customer_id === savedCustomer.id
                ? { ...project, customer_name: savedCustomerName }
                : project,
            );
            writeProjectCache(nextProjects);
            return nextProjects;
          });
          setActiveProject((current) =>
            current?.customer_id === savedCustomer.id
              ? { ...current, customer_name: savedCustomerName }
              : current,
          );
        }
        setCustomerDialogOpen(false);
        setEditingCustomer(null);
        setCustomerForm(emptyCustomerForm);
      })
      .catch(() => undefined)
      .finally(() => setCustomerSaving(false));
  };

  const removeCustomer = (customer) => {
    setCustomers((current) => current.filter((item) => item.id !== customer.id));
    setProjects((current) => {
      const nextProjects = current.filter(
        (project) => project.customer_id !== customer.id,
      );
      writeProjectCache(nextProjects);
      return nextProjects;
    });
    if (activeProject?.customer_id === customer.id) {
      setActiveProject(null);
    }
    deleteData(SERVER.kitchen.customer(customer.id)).catch(() => undefined);
  };

  const requestCustomerDelete = (customer) => {
    const customerName = getCustomerDisplayName(customer) || "Secili musteri";
    setDeleteConfirmation({
      type: "customer",
      item: customer,
      title: "Musteriyi Sil",
      message: `"${customerName}" kalici olarak silinsin mi?`,
      detail: "Bu musteriye ait projeler de kalici olarak silinecek.",
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation(null);
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === "project") {
      removeProject(deleteConfirmation.item);
    }

    if (deleteConfirmation.type === "customer") {
      removeCustomer(deleteConfirmation.item);
    }

    setDeleteConfirmation(null);
  };

  const buildMaterialPayload = (material) => ({
    code: material.code,
    name: material.name,
    type: material.type,
    subcategory: material.subcategory || "",
    color_hex: material.color_hex || "",
    texture_url: material.texture_url || "",
    preview_model_url: material.preview_model_url || "",
    price_modifier: Number(material.price_modifier || 0),
    modifier_type: material.modifier_type || "fixed",
    is_active: material.is_active !== false,
  });

  const uploadKitchenFile = (type, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosInstance()
      .post(SERVER.kitchen.upload(type), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(({ data }) => {
        if (!data.success) throw new Error(data.error?.message || "Upload failed");
        const apiBaseUrl = axiosInstance().defaults.baseURL || "";
        const uploadOrigin = apiBaseUrl.replace(/\/api\/?$/, "");
        return {
          ...data.payload,
          url:
            data.payload?.url?.startsWith("http")
              ? data.payload.url
              : `${uploadOrigin}${data.payload?.url || ""}`,
        };
      });
  };

  const addCatalogItem = (product) => {
    setCatalogItems((current) => [product, ...current]);
    setSelectedCatalogProductId(product.id);
    setSelectedMaterialId(null);
    postData(SERVER.kitchen.catalogItems, buildCatalogItemPayload(product))
      .then((savedProduct) => {
        if (!savedProduct?.id) return;
        setCatalogItems((current) =>
          current.map((item) => (item.id === product.id ? savedProduct : item)),
        );
        setSelectedCatalogProductId(savedProduct.id);
      })
      .catch(() => undefined);
  };

  const selectCatalogProduct = (product) => {
    setSelectedMaterialId(null);
    setSelectedCatalogProductId(product.id);
    getData(SERVER.kitchen.catalogItem(product.id))
      .then((result) => {
        const productDetail = result?.data || result;
        if (!productDetail?.id) return;
        setCatalogItems((current) =>
          current.map((item) =>
            item.id === productDetail.id ? { ...item, ...productDetail } : item,
          ),
        );
        setSelectedCatalogProductId(productDetail.id);
      })
      .catch(() => undefined);
  };

  const addMaterial = (material) => {
    setMaterials((current) => [material, ...current]);
    setSelectedMaterialId(material.id);
    setSelectedCatalogProductId(null);
    postData(SERVER.kitchen.materials, buildMaterialPayload(material))
      .then((savedMaterial) => {
        if (!savedMaterial?.id) return;
        setMaterials((current) =>
          current.map((item) => (item.id === material.id ? savedMaterial : item)),
        );
        setSelectedMaterialId(savedMaterial.id);
      })
      .catch(() => undefined);
  };

  const selectMaterial = (material) => {
    setSelectedCatalogProductId(null);
    setSelectedMaterialId(material.id);
    getData(SERVER.kitchen.material(material.id))
      .then((result) => {
        const materialDetail = result?.data || result;
        if (!materialDetail?.id) return;
        setMaterials((current) =>
          current.map((item) =>
            item.id === materialDetail.id
              ? { ...item, ...materialDetail }
              : item,
          ),
        );
        setSelectedMaterialId(materialDetail.id);
      })
      .catch(() => undefined);
  };

  const loadCatalogItemsBySubcategory = (category, subcategory, subcategoryId) =>
    getData(SERVER.kitchen.catalogItems, {
      category,
      subcategory: subcategory === "standard" ? undefined : subcategory,
      subcategory_id: subcategoryId,
    }).then((result) => {
      const items = extractApiList(result);
      setCatalogItems((current) => {
        const itemMap = new Map(current.map((item) => [item.id, item]));
        items.forEach((item) => {
          if (!item?.id) return;
          itemMap.set(item.id, {
            ...(itemMap.get(item.id) || {}),
            ...item,
          });
        });
        return Array.from(itemMap.values());
      });
      return items;
    });

  const loadMaterialsBySubcategory = (type, subcategory, subcategoryId) =>
    getData(SERVER.kitchen.materials, {
      type,
      subcategory: subcategory === "standard" ? undefined : subcategory,
      subcategory_id: subcategoryId,
    }).then(extractApiList);

  const addCatalogGroup = (group) => {
    const scope = group.scope || "product";
    const targetSetter = scope === "material" ? setMaterialGroups : setCatalogGroups;

    targetSetter((current) => {
      if (group.parentKey) {
        return current.map((item) => {
          if (item.key !== group.parentKey) return item;
          if (item.subcategories?.some((sub) => sub.key === group.key))
            return item;

          return {
            ...item,
            subcategories: [
              ...(item.subcategories || []),
              { id: group.id, key: group.key, title: group.title },
            ],
          };
        });
      }

      if (current.some((item) => item.key === group.key)) return current;
      return [
        ...current,
        { ...group, subcategories: group.subcategories || [] },
      ];
    });

    postData(SERVER.kitchen.catalogCategories, {
      scope,
      key: group.key,
      title: group.title,
      parent_key: group.parentKey || null,
    })
      .then((savedCategory) => {
        const savedGroup = {
          id: savedCategory.id,
          key: savedCategory.key,
          title: savedCategory.title,
          parentKey: savedCategory.parent_key,
          scope: savedCategory.scope,
        };
        const setter =
          savedCategory.scope === "material" ? setMaterialGroups : setCatalogGroups;
        setter((current) => {
          if (savedCategory.parent_key) {
            return current.map((item) =>
              item.key === group.parentKey
                ? {
                    ...item,
                    subcategories: (item.subcategories || []).map((sub) =>
                      sub.key === group.key
                        ? { id: savedGroup.id, key: savedGroup.key, title: savedGroup.title }
                        : sub,
                    ),
                  }
                : item,
            );
          }
          return current.map((item) =>
            item.key === group.key
              ? {
                  ...item,
                  id: savedGroup.id,
                  key: savedGroup.key,
                  title: savedGroup.title,
                }
              : item,
          );
        });
      })
      .catch(() => undefined);
  };

  const removeCatalogGroup = (group, scope = "product") => {
    const setter = scope === "material" ? setMaterialGroups : setCatalogGroups;
    setter((current) =>
      group.parent_key || group.parentKey
        ? current.map((item) => ({
            ...item,
            subcategories: (item.subcategories || []).filter(
              (sub) => sub.key !== group.key,
            ),
          }))
        : current.filter((item) => item.key !== group.key),
    );
    if (scope === "product") {
      setCatalogItems((current) =>
        group.parent_key || group.parentKey
          ? current.filter((item) => item.subcategory !== group.key)
          : current.filter((item) => item.category !== group.key),
      );
    } else {
      setMaterials((current) =>
        group.parent_key || group.parentKey
          ? current.filter((item) => item.subcategory !== group.key)
          : current.filter((item) => item.type !== group.key),
      );
    }
    if (group.id) {
      deleteData(SERVER.kitchen.catalogCategory(group.id)).catch(() => undefined);
    }
  };

  const updateCatalogGroup = (group, updates, scope = "product") => {
    const setter = scope === "material" ? setMaterialGroups : setCatalogGroups;
    const nextGroup = { ...group, ...updates };
    setter((current) =>
      group.parent_key || group.parentKey
        ? current.map((item) => ({
            ...item,
            subcategories: (item.subcategories || []).map((sub) =>
              sub.key === group.key ? { ...sub, ...updates } : sub,
            ),
          }))
        : current.map((item) => (item.key === group.key ? nextGroup : item)),
    );
    if (group.id) {
      putData(SERVER.kitchen.catalogCategory(group.id), {
        scope,
        key: nextGroup.key,
        title: nextGroup.title,
        parent_key: nextGroup.parent_key || nextGroup.parentKey || null,
      }).catch(() => undefined);
    }
  };

  const updateCatalogItem = (productId, updater) => {
    setCatalogItems((current) =>
      current.map((product) => {
        if (product.id !== productId) return product;
        return updater(product);
      }),
    );
  };

  const saveCatalogItem = (product) =>
    putData(
      SERVER.kitchen.catalogItem(product.id),
      buildCatalogItemPayload(product),
    ).then((savedProduct) => {
      const nextProduct = savedProduct?.data || savedProduct;
      if (!nextProduct?.id) return product;
      setCatalogItems((current) =>
        current.map((item) =>
          item.id === nextProduct.id ? { ...item, ...nextProduct } : item,
        ),
      );
      return nextProduct;
    });

  const updateMaterial = (materialId, updater) => {
    let nextMaterial = null;
    setMaterials((current) =>
      current.map((material) => {
        if (material.id !== materialId) return material;
        nextMaterial = updater(material);
        return nextMaterial;
      }),
    );
    if (nextMaterial) {
      putData(
        SERVER.kitchen.material(materialId),
        buildMaterialPayload(nextMaterial),
      ).catch(() => undefined);
    }
  };

  const removeCatalogItem = (product) => {
    setCatalogItems((current) => current.filter((item) => item.id !== product.id));
    if (selectedCatalogProductId === product.id) {
      setSelectedCatalogProductId(null);
    }
    return deleteData(SERVER.kitchen.catalogItem(product.id)).catch(
      () => undefined,
    );
  };

  const removeMaterial = (material) => {
    setMaterials((current) => current.filter((item) => item.id !== material.id));
    if (selectedMaterialId === material.id) {
      setSelectedMaterialId(null);
    }
    deleteData(SERVER.kitchen.material(material.id)).catch(() => undefined);
  };

  const renderDesigner = () => (
    <>
      <KitchenPaletteDrawer
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        catalogGroups={catalogGroups}
        catalogItems={catalogItems}
        loading={catalogLoading}
        onLoadCatalogItems={loadCatalogItemsBySubcategory}
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
                inactiveIcon={
                  <MovieCreationOutlinedIcon sx={{ fontSize: 17 }} />
                }
                onToggle={() =>
                  setPremiumTools((current) => ({
                    ...current,
                    cameraTour: !current.cameraTour,
                  }))
                }
              />
              <Stack
                direction="row"
                spacing={0.4}
                aria-hidden={selectedSceneIndex === null}
                sx={{
                  p: 0.35,
                  borderRadius: 1.25,
                  bgcolor: "rgba(255,255,255,0.96)",
                  border: "1px solid rgba(37,99,235,0.5)",
                  boxShadow:
                    "0 10px 24px rgba(37,99,235,0.16), inset 0 1px 0 rgba(255,255,255,0.86)",
                  flexShrink: 0,
                  visibility:
                    selectedSceneIndex !== null ? "visible" : "hidden",
                  pointerEvents: selectedSceneIndex !== null ? "auto" : "none",
                }}
              >
                <ToolbarSceneToggleControl
                  label="Kilit"
                  active={Boolean(
                    selectedSceneIndex !== null &&
                    sceneItems[selectedSceneIndex]?.locked,
                  )}
                  activeTitle="Secili urun kilitli"
                  inactiveTitle="Secili urunu kilitle"
                  disabled={
                    selectedSceneIndex === null || selectedItemCount === 0
                  }
                  activeIcon={<LockOutlinedIcon sx={{ fontSize: 17 }} />}
                  inactiveIcon={<LockOpenOutlinedIcon sx={{ fontSize: 17 }} />}
                  iconColor="#F97316"
                  activeIconColor="#F97316"
                  onToggle={() => {
                    if (selectedSceneIndex !== null) {
                      toggleSelectedItemLock();
                    }
                  }}
                />
                <ToolbarSceneToggleControl
                  label="Ayar"
                  active={false}
                  activeTitle="Secili urun ayarlari"
                  inactiveTitle="Secili urun ayarlari"
                  disabled={selectedSceneIndex === null}
                  activeIcon={<SettingsOutlinedIcon sx={{ fontSize: 17 }} />}
                  inactiveIcon={<SettingsOutlinedIcon sx={{ fontSize: 17 }} />}
                  iconColor="#7C3AED"
                  onToggle={() => {
                    if (selectedSceneIndex !== null) {
                      setCustomizerOpen(true);
                    }
                  }}
                />
                <ToolbarSceneToggleControl
                  label="Kopya"
                  active={false}
                  activeTitle="Secili urunu kopyala"
                  inactiveTitle="Secili urunu kopyala"
                  disabled={selectedSceneIndex === null}
                  activeIcon={<ContentCopyIcon sx={{ fontSize: 17 }} />}
                  inactiveIcon={<ContentCopyIcon sx={{ fontSize: 17 }} />}
                  iconColor="#2563EB"
                  onToggle={() => {
                    if (selectedSceneIndex !== null) {
                      duplicateSceneItem(selectedSceneIndex);
                    }
                  }}
                />
                <ToolbarSceneToggleControl
                  label="Sil"
                  active={false}
                  activeTitle="Secili urunu sil"
                  inactiveTitle="Secili urunu sil"
                  disabled={selectedSceneIndex === null}
                  activeIcon={<DeleteOutlineIcon sx={{ fontSize: 17 }} />}
                  inactiveIcon={<DeleteOutlineIcon sx={{ fontSize: 17 }} />}
                  iconColor="#EF4444"
                  onToggle={() => {
                    if (selectedSceneIndex !== null) {
                      removeSceneItem(selectedSceneIndex);
                    }
                  }}
                />
                <ToolbarSceneToggleControl
                  label="Sol"
                  active={false}
                  activeTitle="Sola dondur"
                  inactiveTitle="Sola dondur"
                  disabled={selectedSceneIndex === null}
                  activeIcon={<RotateLeftIcon sx={{ fontSize: 17 }} />}
                  inactiveIcon={<RotateLeftIcon sx={{ fontSize: 17 }} />}
                  iconColor="#64748B"
                  onToggle={() => {
                    if (selectedSceneIndex !== null) {
                      rotateSceneItem(selectedSceneIndex, "y", -10);
                    }
                  }}
                />
                <ToolbarSceneToggleControl
                  label="Yukarı"
                  active={false}
                  activeTitle="Yukari dondur"
                  inactiveTitle="Yukari dondur"
                  disabled={selectedSceneIndex === null}
                  activeIcon={<KeyboardArrowUpIcon sx={{ fontSize: 17 }} />}
                  inactiveIcon={<KeyboardArrowUpIcon sx={{ fontSize: 17 }} />}
                  iconColor="#64748B"
                  onToggle={() => {
                    if (selectedSceneIndex !== null) {
                      rotateSceneItem(selectedSceneIndex, "x", -10);
                    }
                  }}
                />
                <ToolbarSceneToggleControl
                  label="Asagi"
                  active={false}
                  activeTitle="Asagi dondur"
                  inactiveTitle="Asagi dondur"
                  disabled={selectedSceneIndex === null}
                  activeIcon={<KeyboardArrowDownIcon sx={{ fontSize: 17 }} />}
                  inactiveIcon={<KeyboardArrowDownIcon sx={{ fontSize: 17 }} />}
                  iconColor="#64748B"
                  onToggle={() => {
                    if (selectedSceneIndex !== null) {
                      rotateSceneItem(selectedSceneIndex, "x", 10);
                    }
                  }}
                />
                <ToolbarSceneToggleControl
                  label="Sag"
                  active={false}
                  activeTitle="Saga dondur"
                  inactiveTitle="Saga dondur"
                  disabled={selectedSceneIndex === null}
                  activeIcon={<RotateRightIcon sx={{ fontSize: 17 }} />}
                  inactiveIcon={<RotateRightIcon sx={{ fontSize: 17 }} />}
                  iconColor="#64748B"
                  onToggle={() => {
                    if (selectedSceneIndex !== null) {
                      rotateSceneItem(selectedSceneIndex, "y", 10);
                    }
                  }}
                />
              </Stack>
              {showLegacyScenePrecisionControls() && (
                <>
                  <ToolbarSceneToggleControl
                    label="Ölçü"
                    active={premiumTools.measurements}
                    activeTitle="Ölçüler görünür"
                    inactiveTitle="Ölçüler gizli"
                    activeIcon={
                      <StraightenOutlinedIcon sx={{ fontSize: 17 }} />
                    }
                    inactiveIcon={
                      <StraightenOutlinedIcon sx={{ fontSize: 17 }} />
                    }
                    onToggle={() =>
                      setPremiumTools((current) => ({
                        ...current,
                        measurements: !current.measurements,
                      }))
                    }
                  />
                  <ToolbarSceneToggleControl
                    label="Bosluk"
                    active={premiumTools.clearanceMeasurements}
                    activeTitle="Sag-sol bosluklari gorunur"
                    inactiveTitle="Sag-sol bosluklari gizli"
                    activeIcon={
                      <CompareArrowsOutlinedIcon sx={{ fontSize: 17 }} />
                    }
                    inactiveIcon={
                      <CompareArrowsOutlinedIcon sx={{ fontSize: 17 }} />
                    }
                    onToggle={() =>
                      setPremiumTools((current) => ({
                        ...current,
                        clearanceMeasurements: !current.clearanceMeasurements,
                      }))
                    }
                  />
                  <ToolbarSceneToggleControl
                    label="Hizala"
                    active={false}
                    activeTitle="Ürünleri hizala"
                    inactiveTitle="Ürünleri hizala"
                    activeIcon={
                      <AlignHorizontalCenterOutlinedIcon
                        sx={{ fontSize: 17 }}
                      />
                    }
                    inactiveIcon={
                      <AlignHorizontalCenterOutlinedIcon
                        sx={{ fontSize: 17 }}
                      />
                    }
                    onToggle={autoAlignSceneItems}
                  />
                  <ToolbarSceneToggleControl
                    label="Üst Hiz"
                    active={false}
                    activeTitle="Üst dolapları hizala"
                    inactiveTitle="Üst dolapları hizala"
                    activeIcon={
                      <AlignHorizontalCenterOutlinedIcon
                        sx={{ fontSize: 17 }}
                      />
                    }
                    inactiveIcon={
                      <AlignHorizontalCenterOutlinedIcon
                        sx={{ fontSize: 17 }}
                      />
                    }
                    onToggle={alignUpperCabinets}
                  />
                </>
              )}
              {showLegacyScenePrecisionControls() && (
                <>
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
                    inactiveIcon={
                      <LockOpenOutlinedIcon sx={{ fontSize: 17 }} />
                    }
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
                </>
              )}
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
            onSaveProject={openProjectSaveDialog}
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
            onToggleAutoHideWalls={() => {
              setPremiumTools((current) => ({
                ...current,
                autoHideWalls: !current.autoHideWalls,
                walls: true,
              }));
              setRoomSurfaces((current) => ({
                ...current,
                backWallVisible: true,
                leftWallVisible: true,
                rightWallVisible: true,
                ceilingVisible: true,
              }));
            }}
            onAutoHideRoomSurface={(field) => {
              setPremiumTools((current) => ({
                ...current,
                walls: true,
              }));
              setRoomSurfaces((current) => ({
                ...current,
                backWallVisible: field !== "backWallVisible",
                leftWallVisible: field !== "leftWallVisible",
                rightWallVisible: field !== "rightWallVisible",
                ceilingVisible: field !== "ceilingVisible",
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
            onToggleMeasurements={() =>
              setPremiumTools((current) => ({
                ...current,
                measurements: !current.measurements,
              }))
            }
            onToggleClearanceMeasurements={() =>
              setPremiumTools((current) => ({
                ...current,
                clearanceMeasurements: !current.clearanceMeasurements,
              }))
            }
            onAutoAlignItems={autoAlignSceneItems}
            onAlignUpperCabinets={alignUpperCabinets}
            onAlignLowerCabinets={alignLowerCabinets}
            onToggleSelectedItemLock={toggleSelectedItemLock}
            selectedItemLocked={
              selectedSceneIndex !== null &&
              sceneItems[selectedSceneIndex]?.locked
            }
            selectedItemCount={selectedItemCount}
            onUndo={undoSceneChange}
            onRedo={redoSceneChange}
            canUndo={Boolean(undoStack.length)}
            canRedo={Boolean(redoStack.length)}
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
        materialsLoading={materialsLoading}
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
      <PremiumDialog
        open={projectSaveOpen}
        onClose={() => {
          if (!projectSaving) setProjectSaveOpen(false);
        }}
        closeDisabled={projectSaving}
        title={
          activeProject
            ? "Musteriye Ozel Proje Guncelle"
            : "Musteriye Ozel Proje Kaydet"
        }
        subtitle="Projeyi mevcut bir musteriye baglayin ya da yeni musteri olarak kaydedin."
        actions={
          <Button
            variant="contained"
            color="info"
            onClick={saveProject}
            disabled={projectSaving}
            sx={{
              minWidth: 132,
              height: 42,
              mt: 1,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 900,
            }}
          >
            {projectSaving
              ? activeProject
                ? "Guncelleniyor..."
                : "Kaydediliyor..."
              : activeProject
                ? "Guncelle"
                : "Kaydet"}
          </Button>
        }
      >
        <Stack spacing={2.1} sx={{ mt: "10px" }}>
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
          <Autocomplete
            freeSolo
            options={customers}
            inputValue={projectForm.customer_name}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : getCustomerDisplayName(option)
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onInputChange={(_, value) =>
              setProjectForm((current) => ({
                ...current,
                customer_id: null,
                customer_name: value,
              }))
            }
            onChange={(_, value) => {
              if (typeof value === "string") {
                setProjectForm((current) => ({
                  ...current,
                  customer_id: null,
                  customer_name: value,
                }));
                return;
              }

              setProjectForm((current) => ({
                ...current,
                customer_id: value?.id || null,
                customer_name: value ? getCustomerDisplayName(value) : "",
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Musteri adi"
                size="small"
                placeholder="Musteri ara veya yeni musteri adi yaz"
              />
            )}
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
            sx={{
              border: "1px solid #CFE0F5",
              borderRadius: 1.5,
              p: 1.5,
              bgcolor: "#F8FBFF",
            }}
          >
            <Typography sx={{ fontWeight: 900, color: "#173B63" }}>
              {sceneItems.length} urun kaydedilecek
            </Typography>
            <Typography variant="body2" sx={{ color: "#5F7897" }}>
              Toplam teklif: {money(quote.total)}
            </Typography>
          </Paper>
        </Stack>
      </PremiumDialog>
    </>
  );

  const renderCatalog = () => (
    <KitchenCatalogManager
      catalogItems={catalogItems}
      catalogGroups={catalogGroups}
      materialGroups={materialGroups}
      materials={materials}
      catalogStats={catalogStats}
      selectedProduct={selectedCatalogProduct}
      selectedMaterial={selectedMaterial}
      onSelectProduct={selectCatalogProduct}
      onCloseProduct={() => setSelectedCatalogProductId(null)}
      onUpdateProduct={updateCatalogItem}
      onSaveProduct={saveCatalogItem}
      onDeleteProduct={removeCatalogItem}
      onAddProduct={addCatalogItem}
      loading={catalogLoading}
      onLoadCatalogItems={loadCatalogItemsBySubcategory}
      onUploadFile={uploadKitchenFile}
      onAddCatalogGroup={addCatalogGroup}
      onUpdateCatalogGroup={updateCatalogGroup}
      onDeleteCatalogGroup={removeCatalogGroup}
      onSelectMaterial={selectMaterial}
      onCloseMaterial={() => setSelectedMaterialId(null)}
      onUpdateMaterial={updateMaterial}
      onAddMaterial={addMaterial}
      onDeleteMaterial={removeMaterial}
      onLoadMaterials={loadMaterialsBySubcategory}
      onEnsureMaterialCatalog={ensureMaterialCatalog}
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

  const renderProjects = () => {
    const projectColumns = [
      {
        field: "created_at",
        headerName: "Proje Kayit Tarihi",
        flex: 1,
        minWidth: 170,
        valueGetter: ({ row }) => formatProjectDate(row.created_at),
      },
      {
        field: "name",
        headerName: "Proje Adi",
        flex: 1.4,
        minWidth: 220,
      },
      {
        field: "customer_name",
        headerName: "Musteri Adi",
        flex: 1.2,
        minWidth: 190,
        valueGetter: ({ row }) => row.customer_name || "Musteri yok",
      },
      {
        field: "total",
        headerName: "Toplam Fiyati",
        flex: 1,
        minWidth: 150,
        valueGetter: ({ row }) => money(getProjectTotal(row)),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Islem",
        width: 124,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="inspect"
            className="grid-action-edit"
            icon={<VisibilityOutlinedIcon fontSize="small" />}
            label="Incele"
            onClick={() => inspectProject(row)}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="delete"
            className="grid-action-delete"
            icon={<DeleteOutlineIcon fontSize="small" />}
            label="Sil"
            onClick={() => requestProjectDelete(row)}
            showInMenu={false}
          />,
        ],
      },
    ];

    return (
      <Stack spacing={1.5}>
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #CFE0F5",
            borderRadius: 2,
            p: 2,
            bgcolor: "#F8FBFF",
            background:
              "linear-gradient(135deg, #FFFFFF 0%, #F4F9FF 58%, #EAF3FF 100%)",
            boxShadow: "0 14px 34px rgba(25,118,210,0.08)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  width: "fit-content",
                  px: 1.2,
                  py: 0.35,
                  borderRadius: 1,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  bgcolor: "#1976D2",
                  background:
                    "linear-gradient(135deg, #1976D2 0%, #1D8BFF 58%, #0B5FC6 100%)",
                  boxShadow: "0 8px 18px rgba(25,118,210,0.2)",
                }}
              >
                Kayitli Projeler
              </Typography>
              <Typography variant="body2" sx={{ color: "#4E6E97", mt: 0.6 }}>
                Proje ve musteri adina gore ara.
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Proje veya musteri ara"
              value={projectSearch}
              onChange={(event) => setProjectSearch(event.target.value)}
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
            border: "1px solid #CFE0F5",
            borderRadius: 2,
            p: 1.5,
            bgcolor: "#FFFFFF",
            boxShadow: "0 16px 38px rgba(25,118,210,0.08)",
          }}
        >
          <Box sx={{ width: "100%", height: 620 }}>
            <DataGrid
              rows={filteredProjects}
              columns={projectColumns}
              loading={projectsLoading}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              disableColumnMenu
              pagination
              getRowId={(row) => row.id}
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0
                  ? "row-even"
                  : "row-odd"
              }
              localeText={{
                noRowsLabel: "Henuz proje eklenmedi.",
                noResultsOverlayLabel: "Henuz proje eklenmedi.",
                footerRowSelected: (count) => `${count} satir secildi`,
              }}
              sx={{
                border: 0,
                color: "#173B63",
                bgcolor: "#FFFFFF",
                "& .MuiDataGrid-main": {
                  borderRadius: 1.5,
                  overflow: "hidden",
                  bgcolor: "#FFFFFF",
                },
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "#EAF3FF",
                  background:
                    "linear-gradient(180deg, #F4F9FF 0%, #E6F0FF 100%)",
                  borderRadius: 1.5,
                  border: "1px solid #CFE0F5",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.96), 0 10px 22px rgba(25,118,210,0.07)",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 900,
                  color: "#244A75",
                  letterSpacing: 0,
                },
                "& .MuiDataGrid-columnSeparator": {
                  color: "#BFD4EE",
                },
                "& .MuiDataGrid-row": {
                  position: "relative",
                  borderBottom: "1px solid #DCEBFA",
                  transition:
                    "background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 18,
                    right: 18,
                    bottom: -1,
                    height: 1,
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(25,118,210,0.2) 12%, rgba(96,165,250,0.34) 50%, rgba(25,118,210,0.2) 88%, transparent 100%)",
                    pointerEvents: "none",
                  },
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #FFFFFF 0%, #F5FAFF 48%, #FFFFFF 100%)",
                    boxShadow: "inset 3px 0 0 #1976D2",
                  },
                  "&.Mui-selected, &.Mui-selected:hover": {
                    bgcolor: "transparent",
                  },
                },
                "& .MuiDataGrid-row.row-even": {
                  background:
                    "linear-gradient(90deg, #FFFFFF 0%, #FCFEFF 48%, #FFFFFF 100%)",
                },
                "& .MuiDataGrid-row.row-odd": {
                  background:
                    "linear-gradient(90deg, #FFFFFF 0%, #F7FBFF 48%, #FFFFFF 100%)",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "0 !important",
                  fontWeight: 650,
                  color: "#173B63",
                },
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
                  outline: "none",
                },
                "& .MuiDataGrid-cell--withRenderer:focus, & .MuiDataGrid-cell--withRenderer:focus-within": {
                  outline: "none",
                  boxShadow: "none",
                },
                "& .MuiDataGrid-actionsCell": {
                  gap: 0.5,
                },
                "& .MuiDataGrid-actionsCell .MuiIconButton-root": {
                  width: 34,
                  height: 34,
                  borderRadius: 1,
                  border: "1px solid transparent",
                  transition:
                    "color 160ms ease, background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
                  "&.grid-action-edit": {
                    color: "#38A8FF",
                    bgcolor: "#EDF8FF",
                    borderColor: "#C7E8FF",
                  },
                  "&.grid-action-edit:hover": {
                    color: "#0F5ED7",
                    bgcolor: "#EAF3FF",
                    borderColor: "#BBD6F6",
                    boxShadow: "0 8px 18px rgba(25,118,210,0.16)",
                  },
                  "&.grid-action-delete": {
                    color: "#DC2626",
                    bgcolor: "#FEF2F2",
                    borderColor: "#FECACA",
                  },
                  "&.grid-action-delete:hover": {
                    color: "#B91C1C",
                    bgcolor: "#FEE2E2",
                    borderColor: "#FCA5A5",
                    boxShadow: "0 8px 18px rgba(220,38,38,0.14)",
                  },
                  "&:focus, &:focus-visible": {
                    outline: "none",
                    boxShadow: "none",
                  },
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "1px solid #CFE0F5",
                  bgcolor: "#FFFFFF",
                },
              }}
            />
          </Box>
        </Paper>
      </Stack>
    );
  };

  const renderCustomers = () => {
    const customerColumns = [
      {
        field: "first_name",
        headerName: "Ad",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "last_name",
        headerName: "Soyad",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "phone",
        headerName: "Telefon",
        flex: 1,
        minWidth: 150,
        valueGetter: ({ row }) => row.phone || "-",
      },
      {
        field: "address",
        headerName: "Adres",
        flex: 1.6,
        minWidth: 220,
        valueGetter: ({ row }) => row.address || "-",
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Islem",
        width: 124,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit"
            className="grid-action-edit"
            icon={<EditOutlinedIcon fontSize="small" />}
            label="Duzenle"
            onClick={() => openEditCustomerDialog(row)}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="delete"
            className="grid-action-delete"
            icon={<DeleteOutlineIcon fontSize="small" />}
            label="Sil"
            onClick={() => requestCustomerDelete(row)}
            showInMenu={false}
          />,
        ],
      },
    ];

    return (
      <>
        <Stack spacing={1.5}>
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #CFE0F5",
              borderRadius: 2,
              p: 2,
              bgcolor: "#F8FBFF",
              background:
                "linear-gradient(135deg, #FFFFFF 0%, #F4F9FF 58%, #EAF3FF 100%)",
              boxShadow: "0 14px 34px rgba(25,118,210,0.08)",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={1.5}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    width: "fit-content",
                    px: 1.2,
                    py: 0.35,
                    borderRadius: 1,
                    fontWeight: 900,
                    color: "#FFFFFF",
                    bgcolor: "#1976D2",
                    background:
                      "linear-gradient(135deg, #1976D2 0%, #1D8BFF 58%, #0B5FC6 100%)",
                    boxShadow: "0 8px 18px rgba(25,118,210,0.2)",
                  }}
                >
                  Müşteri Listesi
                </Typography>
                <Typography variant="body2" sx={{ color: "#4E6E97" }}>
                  Müşteri kayıtlarını görüntüle, ekle ve düzenle.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PersonAddAltOutlinedIcon />}
                onClick={openCreateCustomerDialog}
                sx={{ textTransform: "none", fontWeight: 900 }}
              >
                Kullanıcı Ekle
              </Button>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              border: "1px solid #CFE0F5",
              borderRadius: 2,
              p: 1.5,
              bgcolor: "#FFFFFF",
              background: "#FFFFFF",
              boxShadow: "0 16px 38px rgba(25,118,210,0.08)",
            }}
          >
            {customersLoading ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={1.2}
                sx={{ width: "100%", height: 620 }}
              >
                <CircularProgress color="info" />
                <Typography sx={{ color: "#41698F", fontWeight: 900 }}>
                  Müşteriler yükleniyor
                </Typography>
              </Stack>
            ) : (
            <Box sx={{ width: "100%", height: 620 }}>
              <DataGrid
                rows={customers}
                columns={customerColumns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                disableSelectionOnClick
                disableColumnMenu
                pagination
                getRowId={(row) => row.id}
                getRowClassName={(params) =>
                  params.indexRelativeToCurrentPage % 2 === 0
                    ? "row-even"
                    : "row-odd"
                }
                localeText={{
                  noRowsLabel: "Henuz musteri eklenmedi.",
                  noResultsOverlayLabel: "Henuz musteri eklenmedi.",
                  footerRowSelected: (count) => `${count} satir secildi`,
                }}
                sx={{
                  border: 0,
                  color: "#173B63",
                  bgcolor: "#FFFFFF",
                  "& .MuiDataGrid-main": {
                    borderRadius: 1.5,
                    overflow: "hidden",
                    bgcolor: "#FFFFFF",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: "#EAF3FF",
                    background:
                      "linear-gradient(180deg, #F4F9FF 0%, #E6F0FF 100%)",
                    borderRadius: 1.5,
                    border: "1px solid #CFE0F5",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.96), 0 10px 22px rgba(25,118,210,0.07)",
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 900,
                    color: "#244A75",
                    letterSpacing: 0,
                  },
                  "& .MuiDataGrid-columnSeparator": {
                    color: "#BFD4EE",
                  },
                  "& .MuiDataGrid-row": {
                    position: "relative",
                    borderBottom: "1px solid #DCEBFA",
                    transition:
                      "background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: 18,
                      right: 18,
                      bottom: -1,
                      height: 1,
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(25,118,210,0.2) 12%, rgba(96,165,250,0.34) 50%, rgba(25,118,210,0.2) 88%, transparent 100%)",
                      pointerEvents: "none",
                    },
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #FFFFFF 0%, #F5FAFF 48%, #FFFFFF 100%)",
                      boxShadow: "inset 3px 0 0 #1976D2",
                    },
                    "&.Mui-selected, &.Mui-selected:hover": {
                      bgcolor: "transparent",
                    },
                  },
                  "& .MuiDataGrid-row.row-even": {
                    background:
                      "linear-gradient(90deg, #FFFFFF 0%, #FCFEFF 48%, #FFFFFF 100%)",
                  },
                  "& .MuiDataGrid-row.row-odd": {
                    background:
                      "linear-gradient(90deg, #FFFFFF 0%, #F7FBFF 48%, #FFFFFF 100%)",
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: "0 !important",
                    fontWeight: 650,
                    color: "#173B63",
                  },
                  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                    {
                      outline: "none",
                    },
                  "& .MuiDataGrid-cell--withRenderer:focus, & .MuiDataGrid-cell--withRenderer:focus-within":
                    {
                      outline: "none",
                      boxShadow: "none",
                    },
                  "& .MuiDataGrid-actionsCell": {
                    gap: 0.5,
                  },
                  "& .MuiDataGrid-actionsCell .MuiIconButton-root": {
                    width: 34,
                    height: 34,
                    borderRadius: 1,
                    border: "1px solid transparent",
                    transition:
                      "color 160ms ease, background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
                    "&.grid-action-edit": {
                      color: "#38A8FF",
                      bgcolor: "#EDF8FF",
                      borderColor: "#C7E8FF",
                    },
                    "&.grid-action-edit:hover": {
                      color: "#0F5ED7",
                      bgcolor: "#EAF3FF",
                      borderColor: "#BBD6F6",
                      boxShadow: "0 8px 18px rgba(25,118,210,0.16)",
                    },
                    "&.grid-action-delete": {
                      color: "#DC2626",
                      bgcolor: "#FEF2F2",
                      borderColor: "#FECACA",
                    },
                    "&.grid-action-delete:hover": {
                      color: "#B91C1C",
                      bgcolor: "#FEE2E2",
                      borderColor: "#FCA5A5",
                      boxShadow: "0 8px 18px rgba(220,38,38,0.14)",
                    },
                    "&:focus, &:focus-visible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "1px solid #CFE0F5",
                    bgcolor: "#FFFFFF",
                  },
                }}
              />
            </Box>
            )}
          </Paper>
        </Stack>

        <PremiumDialog
          open={customerDialogOpen}
          onClose={closeCustomerDialog}
          closeDisabled={customerSaving}
          title={editingCustomer ? "Musteri Duzenle" : "Yeni Musteri Ekle"}
          subtitle="Musteri bilgilerini kaydedin ve listeyi guncel tutun."
          actions={
            <Button
              variant="contained"
              color="info"
              onClick={saveCustomer}
              disabled={
                customerSaving ||
                (!customerForm.first_name.trim() &&
                  !customerForm.last_name.trim())
              }
              sx={{
                minWidth: 132,
                height: 42,
                mt: 1,
                borderRadius: 1,
                textTransform: "none",
                fontWeight: 900,
              }}
            >
              {customerSaving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          }
        >
          <Stack spacing={2.1} sx={{ mt: "10px" }}>
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.15,
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 8px 18px rgba(15,48,86,0.045)",
                    "& fieldset": {
                      borderColor: "#CFE0F5",
                    },
                    "&:hover fieldset": {
                      borderColor: "#9EC5F2",
                    },
                    "&.Mui-focused": {
                      bgcolor: "#FFFFFF",
                      boxShadow:
                        "0 0 0 4px rgba(25,118,210,0.1), 0 10px 22px rgba(25,118,210,0.08)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1976D2",
                    },
                  },
                  "& .MuiInputBase-input": {
                    fontWeight: 700,
                    color: "#173B63",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#5F7897",
                    fontWeight: 700,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#1976D2",
                  },
                }}
              />
            ))}
          </Stack>
        </PremiumDialog>
      </>
    );
  };

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
                    bgcolor: "#1976D2",
                    background:
                      "linear-gradient(135deg, #1976D2 0%, #1D8BFF 58%, #0B5FC6 100%)",
                    boxShadow: "0 10px 22px rgba(25,118,210,0.22)",
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
      <PremiumDialog
        open={Boolean(deleteConfirmation)}
        onClose={closeDeleteConfirmation}
        title={deleteConfirmation?.title || "Silme Onayi"}
        subtitle="Lutfen silme islemini onaylayin."
        maxWidth="xs"
        actions={
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
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
            {deleteConfirmation?.message}
          </Typography>
          <Typography variant="body2" sx={{ color: "#5F7897" }}>
            {deleteConfirmation?.detail}
          </Typography>
        </Stack>
      </PremiumDialog>
    </Page>
  );
};

export default KitchenStudioPage;
