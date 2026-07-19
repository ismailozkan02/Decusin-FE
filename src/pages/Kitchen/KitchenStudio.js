import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import Page from "components/Page";
import { SERVER } from "routes/paths";
import { getData, postData } from "utils/axiosForPhyton";

const TABS = {
  designer: 0,
  catalog: 1,
  pricing: 2,
  projects: 3,
};

const fallbackTemplates = [
  { id: "template-linear-300", name: "Duz mutfak 300 cm", type: "linear" },
  { id: "template-l-360-240", name: "L mutfak 360 x 240 cm", type: "l_shape" },
  { id: "template-island-420", name: "Ada mutfak 420 cm", type: "island" },
];

const fallbackCatalog = [
  {
    id: "cabinet-base-60",
    sku: "ALT-060",
    name: "Alt dolap 60 cm",
    category: "base_cabinet",
    dimensions: { width: 60, height: 72, depth: 56, unit: "cm" },
    base_price: 4800,
  },
  {
    id: "cabinet-wall-80",
    sku: "UST-080",
    name: "Ust dolap 80 cm",
    category: "wall_cabinet",
    dimensions: { width: 80, height: 72, depth: 34, unit: "cm" },
    base_price: 3900,
  },
  {
    id: "countertop-meter",
    sku: "TEZ-MT",
    name: "Tezgah metre",
    category: "countertop",
    dimensions: { width: 100, height: 4, depth: 60, unit: "cm" },
    base_price: 2200,
  },
  {
    id: "sink-standard",
    sku: "EVY-STD",
    name: "Standart evye",
    category: "appliance",
    dimensions: { width: 50, height: 20, depth: 45, unit: "cm" },
    base_price: 3200,
  },
  {
    id: "shelf-inner-60",
    sku: "RAF-060",
    name: "Ic raf 60 cm",
    category: "shelf",
    dimensions: { width: 56, height: 3, depth: 50, unit: "cm" },
    base_price: 650,
  },
];

const fallbackMaterials = [
  {
    id: "mat-door-lake-white",
    code: "LAKE-WHITE",
    name: "Beyaz lake kapak",
    type: "door",
    color_hex: "#F8FAFC",
    price_modifier: 0.18,
    modifier_type: "percent",
  },
  {
    id: "mat-door-wood-oak",
    code: "WOOD-OAK",
    name: "Mese kapak",
    type: "door",
    color_hex: "#B6814A",
    price_modifier: 0.12,
    modifier_type: "percent",
  },
  {
    id: "mat-glass-smoked",
    code: "GLASS-SMOKE",
    name: "Fume cam",
    type: "glass",
    color_hex: "#6B7280",
    price_modifier: 900,
    modifier_type: "fixed",
  },
  {
    id: "mat-counter-quartz",
    code: "QUARTZ",
    name: "Kuvars tezgah",
    type: "countertop",
    color_hex: "#E5E7EB",
    price_modifier: 0.32,
    modifier_type: "percent",
  },
];

const money = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const categoryLabel = (value) =>
  ({
    base_cabinet: "Alt dolap",
    wall_cabinet: "Ust dolap",
    countertop: "Tezgah",
    appliance: "Cihaz / aksesuar",
    shelf: "Ic raf",
  })[value] || value;

const materialModifierLabel = (material) =>
  material.modifier_type === "percent"
    ? `%${Math.round(Number(material.price_modifier || 0) * 100)}`
    : money(material.price_modifier);

const templateScenes = {
  "template-linear-300": [
    {
      catalog_item_id: "cabinet-base-60",
      position: { x: 130, y: 320, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-lake-white" },
      quantity: 1,
    },
    {
      catalog_item_id: "cabinet-base-60",
      position: { x: 200, y: 320, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-lake-white" },
      quantity: 1,
    },
    {
      catalog_item_id: "cabinet-wall-80",
      position: { x: 145, y: 140, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 80, height: 72, depth: 34, unit: "cm" },
      options: {
        door_material_id: "mat-door-lake-white",
        glass_material_id: "mat-glass-smoked",
      },
      quantity: 1,
    },
  ],
  "template-l-360-240": [
    {
      catalog_item_id: "cabinet-base-60",
      position: { x: 120, y: 320, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-lake-white" },
      quantity: 1,
    },
    {
      catalog_item_id: "cabinet-base-60",
      position: { x: 188, y: 320, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-lake-white" },
      quantity: 1,
    },
    {
      catalog_item_id: "cabinet-wall-80",
      position: { x: 130, y: 140, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 80, height: 72, depth: 34, unit: "cm" },
      options: {
        door_material_id: "mat-door-lake-white",
        glass_material_id: "mat-glass-smoked",
      },
      quantity: 1,
    },
    {
      catalog_item_id: "cabinet-wall-80",
      position: { x: 300, y: 220, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 80, height: 72, depth: 34, unit: "cm" },
      options: {
        door_material_id: "mat-door-wood-oak",
        glass_material_id: "mat-glass-smoked",
      },
      quantity: 1,
    },
  ],
  "template-island-420": [
    {
      catalog_item_id: "cabinet-base-60",
      position: { x: 150, y: 305, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 80, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-wood-oak" },
      quantity: 1,
    },
    {
      catalog_item_id: "cabinet-base-60",
      position: { x: 245, y: 305, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 80, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-wood-oak" },
      quantity: 1,
    },
    {
      catalog_item_id: "countertop-meter",
      position: { x: 135, y: 280, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 210, height: 16, depth: 80, unit: "cm" },
      options: { countertop_material_id: "mat-counter-quartz" },
      quantity: 1,
    },
    {
      catalog_item_id: "sink-standard",
      position: { x: 390, y: 265, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 45, depth: 45, unit: "cm" },
      options: {},
      quantity: 1,
    },
  ],
};

const catalogGroups = [
  { key: "base_cabinet", title: "Alt Dolaplar" },
  { key: "wall_cabinet", title: "Ust Dolaplar" },
  { key: "countertop", title: "Tezgahlar" },
  { key: "shelf", title: "Raflar" },
  { key: "appliance", title: "Evye / Cihazlar" },
];

const KitchenStudio = ({ initialTab = "designer" }) => {
  const sceneRef = useRef(null);
  const [tab, setTab] = useState(TABS[initialTab] || 0);
  const [templates, setTemplates] = useState(fallbackTemplates);
  const [catalogItems, setCatalogItems] = useState(fallbackCatalog);
  const [materials, setMaterials] = useState(fallbackMaterials);
  const [projects, setProjects] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("template-l-360-240");
  const [selectedDoorMaterial, setSelectedDoorMaterial] = useState("mat-door-lake-white");
  const [selectedGlassMaterial, setSelectedGlassMaterial] = useState("mat-glass-smoked");
  const [selectedCounterMaterial, setSelectedCounterMaterial] = useState("mat-counter-quartz");
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [sceneItems, setSceneItems] = useState([
    {
      catalog_item_id: "cabinet-base-60",
      position: { x: 135, y: 310, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: null,
      options: { door_material_id: "mat-door-lake-white" },
      quantity: 3,
    },
    {
      catalog_item_id: "cabinet-wall-80",
      position: { x: 210, y: 140, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: null,
      options: {
        door_material_id: "mat-door-lake-white",
        glass_material_id: "mat-glass-smoked",
      },
      quantity: 2,
    },
  ]);
  const [quote, setQuote] = useState(null);
  const [notice, setNotice] = useState("");
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);

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

  const applyTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    setSceneItems(templateScenes[templateId] || []);
    setSelectedSceneIndex(null);
  };

  const productPreview = (product) => {
    const isWall = product.category === "wall_cabinet";
    const isCounter = product.category === "countertop";
    const isShelf = product.category === "shelf";
    const isAppliance = product.category === "appliance";

    return (
      <Box
        sx={{
          width: 86,
          height: 68,
          borderRadius: 1,
          bgcolor: isAppliance ? "#E0F2FE" : "#F8FAFC",
          border: "1px solid #CBD5E1",
          display: "grid",
          placeItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: isCounter ? 68 : isShelf ? 58 : 44,
            height: isCounter ? 10 : isShelf ? 8 : isWall ? 50 : isAppliance ? 38 : 56,
            borderRadius: isAppliance ? "50%" : 0.5,
            bgcolor: isCounter
              ? selectedCounter?.color_hex || "#E5E7EB"
              : isShelf
                ? "#A16207"
                : selectedDoor?.color_hex || "#F8FAFC",
            border: "1px solid rgba(15,23,42,0.18)",
            boxShadow: "5px 7px 14px rgba(15,23,42,0.12)",
          }}
        />
      </Box>
    );
  };

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      getData(SERVER.kitchen.templates),
      getData(SERVER.kitchen.catalogItems),
      getData(SERVER.kitchen.materials),
      getData(SERVER.kitchen.projects),
    ]).then((results) => {
      if (!mounted) return;

      const [templateResult, catalogResult, materialResult, projectResult] = results;
      if (templateResult.status === "fulfilled") {
        setTemplates(templateResult.value?.data || fallbackTemplates);
      }
      if (catalogResult.status === "fulfilled") {
        setCatalogItems(catalogResult.value?.data || fallbackCatalog);
      }
      if (materialResult.status === "fulfilled") {
        setMaterials(materialResult.value?.data || fallbackMaterials);
      }
      if (projectResult.status === "fulfilled") {
        setProjects(projectResult.value?.data || []);
      }
      if (results.some((item) => item.status === "rejected")) {
        setNotice("Backend kapaliysa sorun yok; ekran simdilik mock veriyle calisir.");
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
    })
      .then(setQuote)
      .catch(() => {
        const total = sceneItems.reduce((sum, item) => {
          const product = catalogMap[item.catalog_item_id];
          return sum + Number(product?.base_price || 0) * Number(item.quantity || 1);
        }, 0);
        setQuote({
          currency: "TRY",
          lines: [],
          subtotal: total,
          installation: total * 0.08,
          discount: 0,
          total: total * 1.08,
        });
      });
  }, [
    catalogMap,
    sceneItems,
  ]);

  const addSceneItem = (product) => {
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

    setSceneItems((current) => {
      const nextItem = {
        catalog_item_id: product.id,
        position: { x: 140 + current.length * 28, y: product.category === "wall_cabinet" ? 145 : 310, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        dimensions: null,
        options,
        quantity: 1,
      };
      setSelectedSceneIndex(current.length);
      return [...current, nextItem];
    });
  };

  const addSceneItemAt = (product, x, y) => {
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

    setSceneItems((current) => {
      const nextItem = {
        catalog_item_id: product.id,
        position: { x, y, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        dimensions: null,
        options,
        quantity: 1,
      };
      setSelectedSceneIndex(current.length);
      return [...current, nextItem];
    });
  };

  const updateSceneItemPosition = (index, x, y) => {
    setSceneItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, position: { ...item.position, x: Math.max(0, x), y: Math.max(0, y) } }
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

        return {
          ...item,
          position: {
            ...item.position,
            x: Math.max(0, nextValues.x),
            y: Math.max(0, nextValues.y),
          },
          dimensions: {
            ...baseDimensions,
            ...(item.dimensions || {}),
            width: Math.max(nextValues.width, 20),
            height: Math.max(nextValues.height, 10),
            unit: "cm",
          },
        };
      }),
    );
  };

  const scenePointFromEvent = (event) => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePaletteDragStart = (event, product) => {
    event.dataTransfer.setData("application/x-kitchen-product", product.id);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleSceneDrop = (event) => {
    event.preventDefault();
    const productId = event.dataTransfer.getData("application/x-kitchen-product");
    const product = catalogItems.find((item) => item.id === productId);
    if (!product) return;

    const point = scenePointFromEvent(event);
    addSceneItemAt(product, point.x - 40, point.y - 40);
  };

  const handleSceneMouseMove = (event) => {
    if (resizeState) {
      const point = scenePointFromEvent(event);
      const deltaX = point.x - resizeState.startX;
      const deltaY = point.y - resizeState.startY;
      const flipsX = resizeState.corner.includes("left");
      const flipsY = resizeState.corner.includes("top");
      const nextWidth = resizeState.startWidth + (flipsX ? -deltaX : deltaX);
      const nextHeight = resizeState.startHeight + (flipsY ? -deltaY : deltaY);
      const nextX = flipsX ? resizeState.startItemX + deltaX : resizeState.startItemX;
      const nextY = flipsY ? resizeState.startItemY + deltaY : resizeState.startItemY;

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
    updateSceneItemPosition(dragState.index, point.x - dragState.offsetX, point.y - dragState.offsetY);
  };

  const handleSceneMouseUp = () => {
    setDragState(null);
    setResizeState(null);
  };

  const handleSceneBackgroundMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      setSelectedSceneIndex(null);
    }
  };

  const handleSceneItemMouseDown = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedSceneIndex(index);
    const point = scenePointFromEvent(event);
    const item = sceneItems[index];
    setDragState({
      index,
      offsetX: point.x - Number(item.position?.x || 0),
      offsetY: point.y - Number(item.position?.y || 0),
    });
  };

  const handleResizeMouseDown = (event, index, corner, width, height) => {
    event.preventDefault();
    event.stopPropagation();
    const point = scenePointFromEvent(event);
    const item = sceneItems[index];

    setSelectedSceneIndex(index);
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
    });
  };

  const removeSceneItem = (index) => {
    setSceneItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setSelectedSceneIndex((current) => {
      if (current === null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  };

  const changeQuantity = (index, quantity) => {
    setSceneItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: Math.max(Number(quantity) || 1, 1) } : item,
      ),
    );
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

        return {
          ...item,
          dimensions: {
            ...baseDimensions,
            ...(item.dimensions || {}),
            [field]: Math.max(Number(value) || 1, 1),
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
          ? {
              ...item,
              options: {
                ...item.options,
                [field]: value,
              },
            }
          : item,
      ),
    );
  };

  const saveProject = () => {
    postData(SERVER.kitchen.projects, {
      name: "Yeni mutfak projesi",
      customer_name: "Musteri",
      template_id: selectedTemplate,
      room_dimensions: { width: 360, height: 260, depth: 240, unit: "cm" },
      items: sceneItems,
      notes: "FE uzerinden kaydedilen mock proje.",
    })
      .then((project) => {
        setProjects((current) => [project, ...current]);
        setNotice("Proje kaydedildi. MySQL baglaninca kalici tabloya yazilacak.");
      })
      .catch(() => setNotice("Backend ulasilamadi; proje kaydi MySQL sonrasi aktif olacak."));
  };

  const selectedSceneItem =
    selectedSceneIndex === null ? null : sceneItems[selectedSceneIndex] || null;
  const selectedProduct = selectedSceneItem
    ? catalogMap[selectedSceneItem.catalog_item_id] || null
    : null;
  const selectedDimensions = {
    ...(selectedProduct?.dimensions || {
      width: 60,
      height: 72,
      depth: 56,
      unit: "cm",
    }),
    ...(selectedSceneItem?.dimensions || {}),
  };
  const selectedOptions = selectedSceneItem?.options || {};

  const renderPaletteDrawer = () => (
    <Drawer
      anchor="left"
      open={paletteOpen}
      onClose={() => setPaletteOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: 310, sm: 380 },
          p: 2,
          bgcolor: "#F8FAFC",
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Urun Paleti
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sablon sec veya urunu sahneye surukle.
            </Typography>
          </Box>
          <IconButton onClick={() => setPaletteOpen(false)}>
            <MenuOpenIcon />
          </IconButton>
        </Stack>

        <Accordion defaultExpanded disableGutters elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 900 }}>Hazir Sablonlar</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.2}>
              {templates.map((template) => {
                const active = selectedTemplate === template.id;

                return (
                  <Paper
                    key={template.id}
                    elevation={0}
                    onClick={() => applyTemplate(template.id)}
                    sx={{
                      border: active ? "2px solid #1976D2" : "1px solid #E5E7EB",
                      borderRadius: 1,
                      p: 1.2,
                      bgcolor: active ? "#EEF6FF" : "#FFFFFF",
                      cursor: "pointer",
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box
                        sx={{
                          width: 74,
                          height: 52,
                          borderRadius: 1,
                          bgcolor: "#E2E8F0",
                          border: "1px solid #CBD5E1",
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            left: template.type === "island" ? 18 : 8,
                            right: template.type === "island" ? 18 : 8,
                            bottom: template.type === "l_shape" ? 10 : 18,
                            height: 10,
                            bgcolor: "#94A3B8",
                            borderRadius: 0.5,
                          }}
                        />
                        {template.type === "l_shape" && (
                          <Box
                            sx={{
                              position: "absolute",
                              right: 12,
                              top: 8,
                              width: 10,
                              bottom: 10,
                              bgcolor: "#94A3B8",
                              borderRadius: 0.5,
                            }}
                          />
                        )}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>{template.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {template.type || "custom"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {catalogGroups.map((group) => {
          const groupItems = catalogItems.filter((item) => item.category === group.key);
          if (!groupItems.length) return null;

          return (
            <Accordion key={group.key} defaultExpanded={group.key === "base_cabinet"} disableGutters elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 900 }}>{group.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1.2}>
                  {groupItems.map((product) => (
                    <Grid item xs={6} key={product.id}>
                      <Paper
                        draggable
                        onDragStart={(event) => handlePaletteDragStart(event, product)}
                        elevation={0}
                        sx={{
                          border: "1px solid #E5E7EB",
                          borderRadius: 1,
                          p: 1,
                          bgcolor: "#FFFFFF",
                          cursor: "grab",
                          userSelect: "none",
                          "&:active": { cursor: "grabbing" },
                        }}
                      >
                        <Stack spacing={0.8} alignItems="center">
                          {productPreview(product)}
                          <Box sx={{ width: "100%" }}>
                            <Typography sx={{ fontWeight: 900, fontSize: 12 }} noWrap>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {money(product.base_price)}
                            </Typography>
                          </Box>
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
    </Drawer>
  );

  const renderDesigner = () => (
    <>
      {renderPaletteDrawer()}
      <Stack direction="row" spacing={1.2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Inventory2OutlinedIcon />}
          onClick={() => setPaletteOpen(true)}
          sx={{ textTransform: "none", fontWeight: 900 }}
        >
          Urun Paletini Ac
        </Button>
        <Chip label={templates.find((item) => item.id === selectedTemplate)?.name || "Ozel sahne"} />
      </Stack>
      <Grid container spacing={2.5}>
      <Grid item xs={12} lg={9}>
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #E2E8F0",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#F8FAFC",
          }}
        >
          <Box
            ref={sceneRef}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleSceneDrop}
            onMouseMove={handleSceneMouseMove}
            onMouseUp={handleSceneMouseUp}
            onMouseLeave={handleSceneMouseUp}
            onMouseDown={handleSceneBackgroundMouseDown}
            sx={{
              minHeight: 520,
              position: "relative",
              background:
                "linear-gradient(180deg, #F8FAFC 0%, #EEF2F7 58%, #D9E0EA 58%, #D9E0EA 100%)",
              perspective: "1000px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: "8%",
                right: "8%",
                bottom: 78,
                height: 220,
                borderLeft: "10px solid #CBD5E1",
                borderBottom: "12px solid #B7C2D0",
                transform: "skewY(-1deg)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: "11%",
                right: "11%",
                bottom: 68,
                height: 18,
                bgcolor: selectedCounter?.color_hex || "#E5E7EB",
                borderRadius: 0.5,
                boxShadow: "0 12px 24px rgba(15,23,42,0.16)",
              }}
            />
            <Typography
              sx={{
                position: "absolute",
                left: 18,
                top: 14,
                color: "#64748B",
                fontSize: 12,
                fontWeight: 700,
                pointerEvents: "none",
              }}
            >
              Paletten surukle, sahneye birak. Objeleri tutup istedigin yere tasi.
            </Typography>
            <Box
              onMouseDown={handleSceneBackgroundMouseDown}
              sx={{
                position: "absolute",
                inset: 0,
              }}
            >
              {sceneItems.map((item, index) => {
                const product = catalogMap[item.catalog_item_id] || {};
                const isWall = product.category === "wall_cabinet";
                const isCounter = product.category === "countertop";
                const isShelf = product.category === "shelf";
                const itemDimensions = {
                  ...(product.dimensions || {}),
                  ...(item.dimensions || {}),
                };
                const itemDoor = materialMap[item.options?.door_material_id] || selectedDoor;
                const itemGlass = materialMap[item.options?.glass_material_id] || selectedGlass;
                const itemCounter =
                  materialMap[item.options?.countertop_material_id] || selectedCounter;
                const width = Math.min(Math.max(Number(itemDimensions.width || 60), 34), 150);
                const height = Math.min(
                  Math.max(Number(itemDimensions.height || (isWall ? 72 : isCounter ? 4 : isShelf ? 3 : 72)), 10),
                  180,
                );

                return (
                  <Box
                    key={`${item.catalog_item_id}-${index}`}
                    onMouseDown={(event) => handleSceneItemMouseDown(event, index)}
                    sx={{
                      width,
                      height,
                      position: "absolute",
                      left: Number(item.position?.x || 0),
                      top: Number(item.position?.y || 0),
                      border: "1px solid rgba(15,23,42,0.18)",
                      bgcolor: isCounter
                        ? itemCounter?.color_hex
                        : isShelf
                          ? "#A16207"
                          : itemDoor?.color_hex,
                      boxShadow: "10px 14px 22px rgba(15,23,42,0.18)",
                      transform: isShelf ? "none" : "rotateX(2deg) rotateY(-12deg)",
                      display: "grid",
                      placeItems: "center",
                      cursor: dragState?.index === index ? "grabbing" : "grab",
                      userSelect: "none",
                      zIndex: dragState?.index === index ? 5 : isWall ? 3 : 2,
                      outline:
                        selectedSceneIndex === index
                          ? "3px solid #1976D2"
                          : "1px solid transparent",
                      outlineOffset: 3,
                    }}
                  >
                    {!isCounter && !isShelf && (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 8,
                          border: "1px solid rgba(15,23,42,0.18)",
                          bgcolor:
                            isWall && itemGlass
                              ? `${itemGlass.color_hex}66`
                              : "rgba(255,255,255,0.18)",
                        }}
                      />
                    )}
                    <Typography sx={{ fontSize: 11, fontWeight: 800, zIndex: 1 }}>
                      {isShelf ? "RAF" : `x${item.quantity}`}
                    </Typography>
                    {selectedSceneIndex === index &&
                      [
                        ["top-left", -7, -7, "nwse-resize"],
                        ["top-right", -7, width - 7, "nesw-resize"],
                        ["bottom-left", height - 7, -7, "nesw-resize"],
                        ["bottom-right", height - 7, width - 7, "nwse-resize"],
                      ].map(([corner, top, left, cursor]) => (
                        <Box
                          key={corner}
                          onMouseDown={(event) =>
                            handleResizeMouseDown(event, index, corner, width, height)
                          }
                          sx={{
                            position: "absolute",
                            top,
                            left,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            bgcolor: "#1976D2",
                            border: "2px solid #FFFFFF",
                            boxShadow: "0 2px 8px rgba(15,23,42,0.28)",
                            cursor,
                            zIndex: 8,
                            "&:before": {
                              content: '""',
                              position: "absolute",
                              inset: 3,
                              borderTop: "2px solid #FFFFFF",
                              borderLeft: "2px solid #FFFFFF",
                              transform:
                                corner === "top-left"
                                  ? "rotate(0deg)"
                                  : corner === "top-right"
                                    ? "rotate(90deg)"
                                    : corner === "bottom-right"
                                      ? "rotate(180deg)"
                                      : "rotate(270deg)",
                            },
                          }}
                        />
                      ))}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} lg={3}>
        <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2, p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Secili item
            </Typography>
            {selectedSceneItem && selectedProduct ? (
              <>
                <Stack spacing={0.4}>
                  <Typography sx={{ fontWeight: 900 }}>{selectedProduct.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {categoryLabel(selectedProduct.category)} - sahnedeki #{selectedSceneIndex + 1}
                  </Typography>
                </Stack>

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      label="Genislik"
                      type="number"
                      size="small"
                      value={selectedDimensions.width}
                      onChange={(event) =>
                        updateSceneItemDimensions(selectedSceneIndex, "width", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Yukseklik"
                      type="number"
                      size="small"
                      value={selectedDimensions.height}
                      onChange={(event) =>
                        updateSceneItemDimensions(selectedSceneIndex, "height", event.target.value)
                      }
                    />
                  </Grid>
                </Grid>

                {["base_cabinet", "wall_cabinet"].includes(selectedProduct.category) && (
                  <TextField
                    select
                    label="Bu item kapagi"
                    value={selectedOptions.door_material_id || selectedDoorMaterial}
                    onChange={(event) =>
                      updateSceneItemOption(selectedSceneIndex, "door_material_id", event.target.value)
                    }
                    size="small"
                  >
                    {materials
                      .filter((item) => item.type === "door")
                      .map((material) => (
                        <MenuItem key={material.id} value={material.id}>
                          {material.name}
                        </MenuItem>
                      ))}
                  </TextField>
                )}

                {selectedProduct.category === "wall_cabinet" && (
                  <TextField
                    select
                    label="Bu item cami"
                    value={selectedOptions.glass_material_id || selectedGlassMaterial}
                    onChange={(event) =>
                      updateSceneItemOption(selectedSceneIndex, "glass_material_id", event.target.value)
                    }
                    size="small"
                  >
                    {materials
                      .filter((item) => item.type === "glass")
                      .map((material) => (
                        <MenuItem key={material.id} value={material.id}>
                          {material.name}
                        </MenuItem>
                      ))}
                  </TextField>
                )}

                {selectedProduct.category === "countertop" && (
                  <TextField
                    select
                    label="Bu tezgah malzemesi"
                    value={selectedOptions.countertop_material_id || selectedCounterMaterial}
                    onChange={(event) =>
                      updateSceneItemOption(selectedSceneIndex, "countertop_material_id", event.target.value)
                    }
                    size="small"
                  >
                    {materials
                      .filter((item) => item.type === "countertop")
                      .map((material) => (
                        <MenuItem key={material.id} value={material.id}>
                          {material.name}
                        </MenuItem>
                      ))}
                  </TextField>
                )}

                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => removeSceneItem(selectedSceneIndex)}
                  sx={{ textTransform: "none", fontWeight: 800 }}
                >
                  Secili itemi sil
                </Button>
              </>
            ) : (
              <Typography color="text.secondary">
                Ozellestirmek icin sahneden bir item sec.
              </Typography>
            )}
            <Divider />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Fiyat
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              {money(quote?.total)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ara toplam {money(quote?.subtotal)} + montaj {money(quote?.installation)}
            </Typography>
            <Button
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              onClick={saveProject}
              sx={{ textTransform: "none", fontWeight: 800 }}
            >
              Projeyi kaydet
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
    </>
  );

  const renderCatalog = () => (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={7}>
        <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2, p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Suruklenecek urunler
          </Typography>
          <Stack spacing={1.2}>
            {catalogItems.map((product) => (
              <Stack
                key={product.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ border: "1px solid #E5E7EB", borderRadius: 1, p: 1.5 }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{product.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {product.sku} - {categoryLabel(product.category)}
                  </Typography>
                </Box>
                <Chip label={money(product.base_price)} />
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Grid>
      <Grid item xs={12} md={5}>
        <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2, p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Malzeme ve renkler
          </Typography>
          <Stack spacing={1.2}>
            {materials.map((material) => (
              <Stack
                key={material.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ border: "1px solid #E5E7EB", borderRadius: 1, p: 1.5 }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 0.75,
                      bgcolor: material.color_hex || "#CBD5E1",
                      border: "1px solid #CBD5E1",
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>{material.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {material.type}
                    </Typography>
                  </Box>
                </Stack>
                <Chip label={materialModifierLabel(material)} size="small" />
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderPricing = () => (
    <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2, p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Fiyat motoru taslagi
      </Typography>
      <Grid container spacing={2}>
        {sceneItems.map((item, index) => {
          const product = catalogMap[item.catalog_item_id] || {};
          return (
            <Grid item xs={12} md={6} key={`${item.catalog_item_id}-price-${index}`}>
              <Stack
                spacing={1.2}
                sx={{ border: "1px solid #E5E7EB", borderRadius: 1, p: 1.5 }}
              >
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>{product.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Baz fiyat {money(product.base_price)}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => removeSceneItem(index)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <TextField
                  label="Adet"
                  type="number"
                  size="small"
                  value={item.quantity}
                  onChange={(event) => changeQuantity(index, event.target.value)}
                />
              </Stack>
            </Grid>
          );
        })}
      </Grid>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Genel toplam
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          {money(quote?.total)}
        </Typography>
      </Stack>
    </Paper>
  );

  const renderProjects = () => (
    <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2, p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Kayitli projeler
      </Typography>
      <Stack spacing={1.2}>
        {projects.length ? (
          projects.map((project) => (
            <Stack
              key={project.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ border: "1px solid #E5E7EB", borderRadius: 1, p: 1.5 }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{project.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {project.customer_name || "Musteri yok"} - {project.items?.length || 0} kalem
                </Typography>
              </Box>
              <Chip label={project.template_id || "ozel"} />
            </Stack>
          ))
        ) : (
          <Typography color="text.secondary">
            Henuz proje yok. Tasarim ekranindan mock proje kaydedebilirsin.
          </Typography>
        )}
      </Stack>
    </Paper>
  );

  return (

      <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 } }}>
        <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2, p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
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
                  3D Mutfak Tasarim Sistemi
                </Typography>
                <Typography color="text.secondary">
                  Sahne, urun katalogu, malzeme secimi ve fiyat endpointleri hazir.
                </Typography>
              </Box>
            </Stack>
            <Chip color="success" label="MVP altyapi" />
          </Stack>
          {notice && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {notice}
            </Alert>
          )}
        </Paper>

        <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 1 }}
          >
            <Tab label="Tasarim sahnesi" />
            <Tab label="Urunler & malzemeler" />
            <Tab label="Fiyatlandirma" />
            <Tab label="Projeler" />
          </Tabs>
        </Paper>

        {tab === 0 && renderDesigner()}
        {tab === 1 && renderCatalog()}
        {tab === 2 && renderPricing()}
        {tab === 3 && renderProjects()}
      </Stack>

  );
};

export default KitchenStudio;
