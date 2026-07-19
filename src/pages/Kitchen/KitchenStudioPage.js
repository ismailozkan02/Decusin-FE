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
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import Page from "components/Page";
import { SERVER } from "routes/paths";
import { getData, postData } from "utils/axiosForPhyton";
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

const buildLocalQuote = (items, catalogMap, materialMap, installationFee) => {
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
      name: product.name || "Urun",
      quantity,
      base_total: baseTotal,
      modifiers_total: modifiersTotal,
      line_total: baseTotal + modifiersTotal,
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
  const installation = Math.max(Number(installationFee || 0), 0);

  return {
    currency: "TRY",
    lines,
    subtotal,
    installation,
    discount: 0,
    total: subtotal + installation,
  };
};

const KitchenStudioPage = ({ initialTab = "designer" }) => {
  const sceneRef = useRef(null);
  const copiedSceneItemRef = useRef(null);
  const tab = TABS[initialTab] || 0;
  const [catalogItems, setCatalogItems] = useState(fallbackCatalog);
  const [catalogGroups, setCatalogGroups] = useState(fallbackCatalogGroups);
  const [materials, setMaterials] = useState(fallbackMaterials);
  const [projects, setProjects] = useState([]);
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
  const [sceneItems, setSceneItems] = useState([]);
  const [selectedCatalogProductId, setSelectedCatalogProductId] =
    useState(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(null);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [installationFee, setInstallationFee] = useState(0);
  const [roomDimensions, setRoomDimensions] = useState({
    width: 360,
    height: 260,
    depth: 240,
    unit: "cm",
  });

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
      designer: "Tasarim Sahnesi",
      catalog: "Urunler & Malzemeler",
      pricing: "Fiyatlandirma",
      projects: "Projeler",
    }[initialTab] || "Tasarim Sahnesi";

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
  const selectedCatalogProduct = selectedCatalogProductId
    ? catalogItems.find((item) => item.id === selectedCatalogProductId) || null
    : null;
  const selectedMaterial = selectedMaterialId
    ? materials.find((item) => item.id === selectedMaterialId) || null
    : null;
  const localQuote = useMemo(
    () => buildLocalQuote(sceneItems, catalogMap, materialMap, installationFee),
    [catalogMap, installationFee, materialMap, sceneItems],
  );
  const quote = localQuote;
  const selectedLineQuote =
    selectedSceneIndex === null
      ? null
      : localQuote.lines[selectedSceneIndex] || null;

  const getSceneMetrics = useCallback(
    (dimensions = roomDimensions) => {
      const rect = sceneRef.current?.getBoundingClientRect();
      const roomWidthCm = Math.max(Number(dimensions.width || 360), 1);
      const roomHeightCm = Math.max(Number(dimensions.height || 260), 1);
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
        setCatalogItems(catalogResult.value?.data || fallbackCatalog);
      }
      if (materialResult.status === "fulfilled") {
        setMaterials(materialResult.value?.data || fallbackMaterials);
      }
      if (projectResult.status === "fulfilled") {
        setProjects(projectResult.value?.data || []);
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
    })
      .then(() => undefined)
      .catch(() => undefined);
  }, [installationFee, sceneItems]);

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

  const getDefaultProductDimensions = (product) => ({
    ...(product.dimensions || { width: 60, height: 72, depth: 56, unit: "cm" }),
    width: clampProductSize(product, "width", product.dimensions?.width || 60),
    height: clampProductSize(
      product,
      "height",
      product.dimensions?.height || 72,
    ),
    unit: "cm",
  });

  const addSceneItemAt = (product, x, y) => {
    setSceneItems((current) => {
      const dimensions = getDefaultProductDimensions(product);
      const nextItem = {
        catalog_item_id: product.id,
        position: { x, y, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        dimensions,
        options: buildItemOptions(product),
        quantity: 1,
      };
      const position = clampScenePosition(nextItem, product, x, y);
      return [
        ...current,
        { ...nextItem, position: { ...nextItem.position, ...position } },
      ];
    });
    setSelectedSceneIndex(null);
    setPaletteOpen(false);
  };

  const updateSceneItemPosition = (index, x, y) => {
    setSceneItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const product = catalogMap[item.catalog_item_id] || {};
        const position = clampScenePosition(item, product, x, y);
        return { ...item, position: { ...item.position, ...position } };
      }),
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

        const nextValue =
          field === "width" || field === "height"
            ? clampProductSize(product, field, value)
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
      setCustomizerOpen(false);
      setPaletteOpen(false);
    }
  };

  const handleSceneItemMouseDown = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    setPaletteOpen(false);
    setSelectedSceneIndex(index);
    const point = scenePointFromEvent(event);
    const item = sceneItems[index];
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
    const payload = {
      id: `project-${Date.now()}`,
      name: projectForm.name || "Yeni mutfak projesi",
      customer_name: projectForm.customer_name || "Musteri",
      template_id: "",
      room_dimensions: roomDimensions,
      items: sceneItems,
      installation_fee: installationFee,
      quote,
      notes: projectForm.notes || "FE uzerinden kaydedilen proje.",
      created_at: new Date().toISOString(),
    };

    setProjects((current) => [payload, ...current]);
    setProjectSaveOpen(false);
    setProjectForm({ name: "", customer_name: "", notes: "" });

    postData(SERVER.kitchen.projects, payload)
      .then((project) => {
        if (!project?.id) return;
        setProjects((current) =>
          current.map((item) => (item.id === payload.id ? project : item)),
        );
      })
      .catch(() => undefined);
  };

  const addCatalogItem = (product) => {
    setCatalogItems((current) => [product, ...current]);
    setSelectedCatalogProductId(product.id);
    setSelectedMaterialId(null);
  };

  const addCatalogGroup = (group) => {
    setCatalogGroups((current) => {
      if (current.some((item) => item.key === group.key)) return current;
      return [...current, group];
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
        }}
        onDeleteItem={removeSceneItem}
        quote={quote}
      />
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 2.25,
          p: { xs: 1.5, md: 2 },
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
            sx={{ minWidth: 0 }}
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
                3D mutfak tasarimi, urun katalogu, malzeme secimi ve canli
                fiyatlandirma.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent={{ xs: "flex-start", md: "flex-end" }}
            spacing={1}
            sx={{ flexWrap: "wrap" }}
          >
            <Button
              variant="contained"
              startIcon={<Inventory2OutlinedIcon />}
              onClick={() => {
                setSelectedSceneIndex(null);
                setSceneItemsOpen(false);
                setPaletteOpen(true);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              Ürün Paletini Ac
            </Button>
            <Button
              variant="outlined"
              startIcon={<LayersOutlinedIcon />}
              onClick={() => {
                setPaletteOpen(false);
                setSceneItemsOpen(true);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              Ekli Urunler
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveOutlinedIcon />}
              onClick={() => setProjectSaveOpen(true)}
              disabled={!sceneItems.length}
              sx={{
                textTransform: "none",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              Projeyi Kaydet
            </Button>
            <Paper
              elevation={0}
              sx={{
                px: 0.8,
                py: 0.6,
                border: "1px solid #D7E3F1",
                borderRadius: 1.5,
                bgcolor: "rgba(255,255,255,0.92)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.8}>
                <IconButton
                  size="small"
                  onClick={() =>
                    setZoom((current) => Math.max(current - 0.05, 0.55))
                  }
                >
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <Typography
                  sx={{
                    minWidth: 54,
                    textAlign: "center",
                    fontWeight: 900,
                    color: "#1976D2",
                  }}
                >
                  %{Math.round(zoom * 100)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() =>
                    setZoom((current) => Math.min(current + 0.05, 1.8))
                  }
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
            <Paper
              elevation={0}
              sx={{
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
            roomDimensions={roomDimensions}
            dragState={dragState}
            zoom={zoom}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleSceneDrop}
            onWheel={handleSceneWheel}
            onMouseMove={handleSceneMouseMove}
            onMouseUp={handleSceneMouseUp}
            onBackgroundMouseDown={handleSceneBackgroundMouseDown}
            onSceneItemMouseDown={handleSceneItemMouseDown}
            onResizeMouseDown={handleResizeMouseDown}
            onOpenItemSettings={(index) => {
              setSelectedSceneIndex(index);
              setPaletteOpen(false);
              setSceneItemsOpen(false);
              setCustomizerOpen(true);
            }}
            onCopyItem={duplicateSceneItem}
            onDeleteItem={removeSceneItem}
            onSaveProject={() => setProjectSaveOpen(true)}
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
        materials={materials}
        selectedDoorMaterial={selectedDoorMaterial}
        selectedGlassMaterial={selectedGlassMaterial}
        selectedCounterMaterial={selectedCounterMaterial}
        onChangeDimension={updateSceneItemDimensions}
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
                {sceneItems.length} urun kaydedilecek
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
            Vazgec
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
      installationFee={installationFee}
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
      onChangeInstallationFee={setInstallationFee}
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
    <Paper
      elevation={0}
      sx={{ border: "1px solid #E2E8F0", borderRadius: 2, p: 2 }}
    >
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
                  {project.customer_name || "Musteri yok"} -{" "}
                  {project.items?.length || 0} kalem
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
                    3D mutfak tasarimi, urun katalogu, malzeme secimi ve canli
                    fiyatlandirma.
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
      </Stack>
    </Page>
  );
};

export default KitchenStudioPage;
