import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import OpenInFullOutlinedIcon from "@mui/icons-material/OpenInFullOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Edges,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import {
  Box3,
  CanvasTexture,
  Color,
  DoubleSide,
  MOUSE,
  Plane,
  RepeatWrapping,
  Vector2,
  Vector3,
} from "three";

let kitchenSceneHasBooted = false;

const modelScaleByCategory = {
  base_cabinet: 1,
  wall_cabinet: 1,
  countertop: 1,
  shelf: 1,
  appliance: 1,
  room: 1,
};

const getModelMaterialColor = (materialName, category, palette) => {
  const name = materialName.toLowerCase();

  if (name.includes("glass")) return palette.glass;
  if (name.includes("stone")) return palette.countertop;
  if (name.includes("oak") || name.includes("light") || name.includes("door")) {
    return ["base_cabinet", "wall_cabinet"].includes(category)
      ? palette.door
      : null;
  }

  return null;
};

const ModelInstance = ({ modelUrl, category, rotation, palette }) => {
  const { scene } = useGLTF(modelUrl);
  const model = useMemo(() => {
    const clonedScene = scene.clone(true);

    clonedScene.traverse((object) => {
      if (!object.isMesh || !object.material) return;

      const applyMaterial = (material) => {
        const nextMaterial = material.clone();
        const nextColor = getModelMaterialColor(
          nextMaterial.name || object.name || "",
          category,
          palette,
        );

        if (nextColor && nextMaterial.color) {
          nextMaterial.color = new Color(nextColor);
          nextMaterial.needsUpdate = true;
        }

        if ((nextMaterial.name || "").toLowerCase().includes("glass")) {
          nextMaterial.transparent = true;
          nextMaterial.opacity = 0.42;
          nextMaterial.needsUpdate = true;
        }

        return nextMaterial;
      };

      object.material = Array.isArray(object.material)
        ? object.material.map(applyMaterial)
        : applyMaterial(object.material);
    });

    return clonedScene;
  }, [category, palette, scene]);
  const viewport = useThree((state) => state.viewport);
  const rotationX = (Number(rotation?.x || 0) * Math.PI) / 180;
  const rotationY = (Number(rotation?.y || 0) * Math.PI) / 180;
  const baseScale = modelScaleByCategory[category] || 1;
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(model);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    return {
      center,
      size: {
        x: Math.max(size.x, 0.001),
        y: Math.max(size.y, 0.001),
        z: Math.max(size.z, 0.001),
      },
    };
  }, [model]);
  const scaleX = (viewport.width * 1.02 * baseScale) / fit.size.x;
  const scaleY = (viewport.height * 1.02 * baseScale) / fit.size.y;
  const scaleZ = Math.min(scaleX, scaleY);

  return (
    <group
      rotation={[rotationX, rotationY, 0]}
      scale={[scaleX, scaleY, scaleZ]}
    >
      <primitive
        object={model}
        position={[-fit.center.x, -fit.center.y, -fit.center.z]}
      />
    </group>
  );
};

// Eski 2D onizleme fallback'i, 3D gecis tamamlanana kadar tutuluyor.
// eslint-disable-next-line no-unused-vars
const ProductImageFallback = ({ product, compact = false }) => (
  <Box
    component="img"
    src={product.image_url || "/images/kitchen/base-cabinet.svg"}
    alt={product.name || "Ürün"}
    sx={{
      position: "absolute",
      inset: compact ? 0 : 4,
      width: compact ? "100%" : "calc(100% - 8px)",
      height: compact ? "100%" : "calc(100% - 8px)",
      objectFit: "cover",
      borderRadius: 0.7,
      opacity: compact ? 1 : 0.32,
      pointerEvents: "none",
    }}
  />
);

// Eski kart ici model onizlemesi, yeni Canvas sahnesi stabil olana kadar tutuluyor.
// eslint-disable-next-line no-unused-vars
const ProductModelCanvas = ({ product, rotation, materialPalette }) => {
  if (!product.model_url) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <Canvas
        orthographic
        dpr={[1, 1.6]}
        camera={{ position: [1.2, 0.8, 3.2], zoom: 72 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.3} />
        <directionalLight position={[3, 5, 4]} intensity={1.8} />
        <directionalLight position={[-3, 2, -2]} intensity={0.55} />
        <Suspense fallback={null}>
          <ModelInstance
            modelUrl={product.model_url}
            category={product.category}
            rotation={rotation}
            palette={materialPalette}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </Box>
  );
};

const sceneToolPanelSx = {
  position: "absolute",
  left: { xs: 12, md: 18 },
  top: { xs: 12, md: 18 },
  zIndex: 1200,
  p: 0.65,
  borderRadius: 1.5,
  bgcolor: "rgba(255,255,255,0.96)",
  border: "1px solid rgba(226,232,240,0.95)",
  boxShadow: "0 14px 30px rgba(15,23,42,0.14)",
};

const sceneIconButtonSx = (color) => ({
  width: 38,
  height: 38,
  borderRadius: 1,
  color,
  bgcolor: "#FFFFFF",
  "&:hover": { bgcolor: "#F8FAFC" },
  "& .MuiSvgIcon-root": { fontSize: 25 },
  "&.Mui-disabled": {
    color: "rgba(100,116,139,0.38)",
    bgcolor: "#FFFFFF",
  },
});

const sceneSideControlButtonSx = (active, muted = false) => ({
  width: 42,
  height: 40,
  borderRadius: 1,
  p: 0.28,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.12,
  cursor: "pointer",
  outline: "none",
  appearance: "none",
  font: "inherit",
  color: muted ? "#94A3B8" : active ? "#F59E0B" : "#1976D2",
  bgcolor: muted ? "#F8FAFC" : active ? "#FFFBEB" : "#FFFFFF",
  border: active
    ? "1px solid rgba(245,158,11,0.5)"
    : "1px solid rgba(147,197,253,0.78)",
  opacity: muted ? 0.58 : 1,
  boxShadow: active
    ? "0 10px 22px rgba(245,158,11,0.14)"
    : "0 8px 18px rgba(15,23,42,0.08)",
  "&:hover": { bgcolor: muted ? "#EFF6FF" : active ? "#FEF3C7" : "#EFF6FF" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
});

const SceneSideControl = ({ label, active, muted, title, onClick, children }) => (
  <Box
    component="button"
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    sx={sceneSideControlButtonSx(active, muted)}
  >
    <Typography
      component="span"
      sx={{
        fontSize: 7.8,
        fontWeight: 950,
        lineHeight: "8px",
        color: "inherit",
      }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

const KitchenScene = ({
  sceneRef,
  sceneItems,
  catalogMap,
  materialMap,
  selectedDoor,
  selectedGlass,
  selectedCounter,
  selectedSceneIndex,
  selectedSceneIndices = [],
  roomDimensions,
  roomSurfaces,
  dragState,
  zoom,
  onDragOver,
  onDrop,
  onWheel,
  onMouseMove,
  onMouseUp,
  onBackgroundMouseDown,
  onClearSelection,
  onSceneItemMouseDown,
  onSelectItem,
  onMoveItem3D,
  onResizeMouseDown,
  onCopyItem,
  onDeleteItem,
  onOpenCustomizer,
  onRotateItem,
  onNewProject,
  onSaveProject,
  onClearItems,
  onExportPdf,
  onToggleFullscreen,
  onSelectCameraView,
  onToggleSceneWalls,
  onToggleRoomSurface,
  premiumTools,
  cameraPresetSignal,
}) => {
  void onResizeMouseDown;
  void onSceneItemMouseDown;

  const wrapperRef = useRef(null);
  const controlsRef = useRef(null);
  const pendingDragRef = useRef(null);
  const [sceneBox, setSceneBox] = useState({ width: 0, top: 0 });
  const [drag3DIndex, setDrag3DIndex] = useState(null);
  const [hover3DIndex, setHover3DIndex] = useState(null);
  const [controlsLocked, setControlsLocked] = useState(false);
  const [sceneReady, setSceneReady] = useState(kitchenSceneHasBooted);
  const scenePremiumTools = premiumTools || {
    quality: true,
    measurements: true,
    walls: true,
    topView: false,
  };
  const highQualityScene = scenePremiumTools.quality;
  const [viewportHeight, setViewportHeight] = useState(
    typeof window === "undefined" ? 900 : window.innerHeight,
  );
  const roomWidthCm = Math.max(Number(roomDimensions?.width || 450), 1);
  const roomHeightCm = Math.max(Number(roomDimensions?.height || 250), 1);
  const roomRatio = roomHeightCm / roomWidthCm;
  const availableWidth = Math.max((sceneBox.width || 1000) - 34, 300);
  const availableHeight = Math.max(viewportHeight - sceneBox.top - 128, 300);
  const fittedWidth = Math.min(availableWidth, availableHeight / roomRatio);
  const fittedHeight = fittedWidth * roomRatio;
  const cmToPx = Math.max((fittedWidth / roomWidthCm) * zoom, 0.6);
  const roomDepthCm = Math.max(Number(roomDimensions?.depth || 240), 1);
  const layoutReady = sceneBox.width > 0 && sceneBox.top > 0;
  const sceneLoading = !sceneReady;
  const placeholderHeight = Math.max(viewportHeight - 190, 420);
  const allRoomSurfacesVisible =
    scenePremiumTools.walls &&
    roomSurfaces?.backWallVisible !== false &&
    roomSurfaces?.leftWallVisible !== false &&
    roomSurfaces?.rightWallVisible !== false &&
    roomSurfaces?.ceilingVisible !== false;
  const lighting = useMemo(() => {
    const nightMode = roomSurfaces?.sceneMode === "night";
    const tourMode = scenePremiumTools?.cameraTour === true;
    const lampVisible = !tourMode && roomSurfaces?.lampVisible === true;
    const lightsOn = lampVisible && roomSurfaces?.lightsOn === true;

    if (nightMode) {
      return {
        nightMode,
        lampVisible,
        lightsOn,
        background: lightsOn ? "#130B18" : "#090712",
        ambient: lightsOn ? 0.32 : 0.24,
        hemisphere: lightsOn ? 0.3 : 0.26,
        sun: lightsOn ? 0.3 : 0.28,
        fill: lightsOn ? 0.2 : 0.16,
        sunColor: "#FFC77A",
        fillColor: lightsOn ? "#FFDCA3" : "#D7A4FF",
        hemisphereSky: "#FFD1A6",
        hemisphereGround: "#201018",
      };
    }

    return {
      nightMode,
      lampVisible,
      lightsOn,
      background: "#FAFAF8",
      ambient: lightsOn ? 0.71 : 0.66,
      hemisphere: lightsOn ? 0.45 : 0.42,
      sun: lightsOn ? 1.36 : 1.35,
      fill: lightsOn ? 0.25 : 0.22,
      sunColor: "#FFFFFF",
      fillColor: "#FFFFFF",
      hemisphereSky: "#FFFFFF",
      hemisphereGround: "#D8D0C2",
    };
  }, [
    roomSurfaces?.lampVisible,
    roomSurfaces?.lightsOn,
    roomSurfaces?.sceneMode,
    scenePremiumTools?.cameraTour,
  ]);
  const defaultCameraView = useMemo(() => {
    const roomWidth = cmToUnit(roomWidthCm);
    const roomHeight = cmToUnit(roomHeightCm);
    const roomDepth = cmToUnit(roomDepthCm);
    const cameraDistance = Math.max(roomWidth, roomDepth) * 1.48;

    return {
      position: [0, roomHeight * 0.62, cameraDistance],
      target: [0, roomHeight * 0.52, -roomDepth * 0.16],
    };
  }, [roomDepthCm, roomHeightCm, roomWidthCm]);
  const handleSceneReady = useCallback(() => {
    kitchenSceneHasBooted = true;
    setSceneReady(true);
  }, []);
  const applyDefaultCameraView = useCallback(
    (camera, controls) => {
      const target = new Vector3(...defaultCameraView.target);

      camera.position.set(...defaultCameraView.position);
      camera.lookAt(target);
      camera.updateProjectionMatrix();

      if (controls) {
        controls.target.copy(target);
        controls.update();
      }
    },
    [defaultCameraView],
  );
  const applyCameraPreset = useCallback(
    (preset) => {
      const controls = controlsRef.current;
      const camera = controls?.object;
      if (!camera || !controls) return;

      const roomWidth = cmToUnit(roomWidthCm);
      const roomHeight = cmToUnit(roomHeightCm);
      const roomDepth = cmToUnit(roomDepthCm);
      const target = new Vector3(0, roomHeight * 0.5, -roomDepth * 0.16);
      const distance = Math.max(roomWidth, roomDepth);
      const cameraPositions = {
        on: [0, roomHeight * 0.62, distance * 1.48],
        ust: [0, roomHeight * 2.85, distance * 0.18],
      };

      camera.position.set(...(cameraPositions[preset] || cameraPositions.on));
      camera.lookAt(target);
      camera.updateProjectionMatrix();
      controls.target.copy(target);
      controls.update();
    },
    [roomDepthCm, roomHeightCm, roomWidthCm],
  );
  useEffect(() => {
    if (!cameraPresetSignal?.preset) return;
    applyCameraPreset(cameraPresetSignal.preset);
  }, [applyCameraPreset, cameraPresetSignal]);
  const isWallDrag = (index) => {
    const item = sceneItems[index];
    const product = catalogMap[item?.catalog_item_id] || {};
    return isWallMountedItem(
      item,
      product,
      getSceneItemDimensions(product, item),
    );
  };
  const getDragSurfaceHeight = (index) => {
    const item = sceneItems[index];
    const product = catalogMap[item?.catalog_item_id] || {};
    const elevation = getDynamicElevationCm({
      item,
      index,
      product,
      sceneItems,
      catalogMap,
      cmToPx,
    });

    return cmToUnit(
      elevation !== null &&
        elevation !== undefined &&
        Number.isFinite(Number(elevation))
        ? elevation
        : 0.035,
    );
  };

  const moveItemFromWorldPoint = (index, point) => {
    const item = sceneItems[index];
    const product = catalogMap[item?.catalog_item_id] || {};
    if (!item || !product) return;

    const dimensions = getSceneItemDimensions(product, item);
    const widthCm = Math.max(Number(dimensions.width || 60), 1);
    const heightCm = Math.max(Number(dimensions.height || 72), 1);
    const depthCm = Math.max(Number(dimensions.depth || 56), 1);
    const rawXCm = (point.x + cmToUnit(roomWidthCm) / 2) * 100 - widthCm / 2;
    const xCm = snapRoomValue(rawXCm, roomWidthCm, widthCm);

    if (isWallMountedItem(item, product, dimensions)) {
      const rawTopCm = roomHeightCm - point.y * 100 - heightCm / 2;
      const yCm = snapRoomValue(rawTopCm, roomHeightCm, heightCm);

      const nextPosition = resolveDragCollisionCm({
        item,
        index,
        product,
        dimensions,
        sceneItems,
        catalogMap,
        cmToPx,
        nextPosition: {
          x: xCm * cmToPx,
          y: yCm * cmToPx,
          z: 0,
        },
      });

      onMoveItem3D?.(index, nextPosition);
      return;
    }

    const rawZCm = (point.z + cmToUnit(roomDepthCm) / 2) * 100 - depthCm / 2;
    const zCm = snapRoomValue(rawZCm, roomDepthCm, depthCm);

    const nextPosition = resolveDragCollisionCm({
      item,
      index,
      product,
      dimensions,
      sceneItems,
      catalogMap,
      cmToPx,
      nextPosition: {
        x: xCm * cmToPx,
        z: zCm,
      },
    });

    onMoveItem3D?.(index, nextPosition);
  };

  const handle3DDragPoint = (point) => {
    if (drag3DIndex === null) return;

    moveItemFromWorldPoint(drag3DIndex, point);
  };

  const handle3DSurfaceMove = (event) => {
    if (drag3DIndex === null) return;

    event.stopPropagation();
    handle3DDragPoint(event.point);
  };

  const handle3DPointerUp = () => {
    pendingDragRef.current = null;
    setDrag3DIndex(null);
    setControlsLocked(false);
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }
  };

  const prepareItemDrag = (index, event) => {
    const sourceEvent = event.sourceEvent || event;

    sourceEvent.preventDefault?.();
    sourceEvent.stopPropagation?.();
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
    pendingDragRef.current = {
      index,
      x: Number(sourceEvent.clientX || 0),
      y: Number(sourceEvent.clientY || 0),
    };
    setControlsLocked(true);
  };

  const maybeStartItemDrag = (index, event) => {
    const sourceEvent = event.sourceEvent || event;
    const pendingDrag = pendingDragRef.current;

    if (
      !pendingDrag ||
      pendingDrag.index !== index ||
      sourceEvent.buttons !== 1
    )
      return;

    const deltaX = Number(sourceEvent.clientX || 0) - pendingDrag.x;
    const deltaY = Number(sourceEvent.clientY || 0) - pendingDrag.y;

    if (Math.hypot(deltaX, deltaY) < 6) return;

    setDrag3DIndex(index);
  };

  const clearSelectionForOrbit = useCallback(() => {
    pendingDragRef.current = null;
    setDrag3DIndex(null);
    setControlsLocked(false);
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }
    onClearSelection?.();
  }, [onClearSelection]);

  useEffect(() => {
    if (!controlsRef.current) return;

    controlsRef.current.enabled = drag3DIndex === null && !controlsLocked;
  }, [controlsLocked, drag3DIndex]);

  useEffect(() => {
    const handleViewportResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleViewportResize);
    return () => window.removeEventListener("resize", handleViewportResize);
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return undefined;

    const updateSize = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      setSceneBox({
        width: rect?.width || 0,
        top: rect?.top || 0,
      });
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Paper
      ref={wrapperRef}
      elevation={0}
      sx={{
        border: "1px solid #E2E8F0",
        borderRadius: 2.5,
        overflow: "visible",
        bgcolor: "#FFFFFF",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        minHeight: layoutReady ? fittedHeight + 104 : placeholderHeight + 72,
        p: { xs: 1, md: 2 },
        background: "#FFFFFF",
      }}
    >
      {sceneLoading && (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={1.2}
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1300,
            background: "#FFFFFF",
            color: "#1976D2",
            borderRadius: 2.5,
          }}
        >
          <CircularProgress size={30} thickness={4} />
          <Typography sx={{ fontSize: 13, fontWeight: 900 }}>
            Sahne hazirlaniyor
          </Typography>
        </Stack>
      )}
      <Stack
        data-kitchen-scene-controls="true"
        direction="column"
        spacing={0.45}
        sx={sceneToolPanelSx}
      >
        <IconButton
          aria-label="Yeni proje"
          onClick={onNewProject}
          sx={sceneIconButtonSx("#1976D2")}
        >
          <RestartAltOutlinedIcon />
        </IconButton>
        <IconButton
          aria-label="Projeyi kaydet"
          onClick={onSaveProject}
          disabled={!sceneItems.length}
          sx={sceneIconButtonSx("#16A34A")}
        >
          <SaveOutlinedIcon />
        </IconButton>
        <IconButton
          aria-label="PDF aktar"
          onClick={onExportPdf}
          sx={sceneIconButtonSx("#F97316")}
        >
          <PictureAsPdfOutlinedIcon />
        </IconButton>
        <IconButton
          aria-label="Sahneyi buyut"
          onClick={onToggleFullscreen}
          sx={sceneIconButtonSx("#111827")}
        >
          <OpenInFullOutlinedIcon />
        </IconButton>
        <IconButton
          aria-label="Sahneyi temizle"
          onClick={onClearItems}
          disabled={!sceneItems.length}
          sx={sceneIconButtonSx("#DC2626")}
        >
          <DeleteSweepOutlinedIcon />
        </IconButton>
      </Stack>
      {selectedSceneIndex !== null && (
        <Stack
          data-kitchen-scene-controls="true"
          direction="column"
          spacing={0.45}
          sx={{
            ...sceneToolPanelSx,
            top: { xs: 240, md: 246 },
          }}
        >
          <IconButton
            aria-label="Secili urun ayarlari"
            onClick={onOpenCustomizer}
            sx={sceneIconButtonSx("#111827")}
          >
            <SettingsOutlinedIcon />
          </IconButton>
          <IconButton
            aria-label="Secili urunu kopyala"
            onClick={() => onCopyItem?.(selectedSceneIndex)}
            sx={sceneIconButtonSx("#2563EB")}
          >
            <ContentCopyIcon />
          </IconButton>
          <IconButton
            aria-label="Secili urunu sil"
            onClick={() => onDeleteItem?.(selectedSceneIndex)}
            sx={sceneIconButtonSx("#EF4444")}
          >
            <DeleteOutlineIcon />
          </IconButton>
          <IconButton
            aria-label="Secili urunu sola dondur"
            onClick={() => onRotateItem?.(selectedSceneIndex, "y", -10)}
            sx={sceneIconButtonSx("#64748B")}
          >
            <RotateLeftIcon />
          </IconButton>
          <IconButton
            aria-label="Secili urunu yukari dondur"
            onClick={() => onRotateItem?.(selectedSceneIndex, "x", -10)}
            sx={sceneIconButtonSx("#64748B")}
          >
            <KeyboardArrowUpIcon />
          </IconButton>
          <IconButton
            aria-label="Secili urunu asagi dondur"
            onClick={() => onRotateItem?.(selectedSceneIndex, "x", 10)}
            sx={sceneIconButtonSx("#64748B")}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
          <IconButton
            aria-label="Secili urunu saga dondur"
            onClick={() => onRotateItem?.(selectedSceneIndex, "y", 10)}
            sx={sceneIconButtonSx("#64748B")}
          >
            <RotateRightIcon />
          </IconButton>
        </Stack>
      )}
      <Stack
        data-kitchen-scene-controls="true"
        direction="column"
        spacing={0.35}
        sx={{
          position: "absolute",
          right: { xs: 12, md: 18 },
          top: { xs: 12, md: 18 },
          zIndex: 1200,
          p: 0.5,
          borderRadius: 1.5,
          bgcolor: "rgba(255,255,255,0.96)",
          border: "1px solid rgba(226,232,240,0.95)",
          boxShadow: "0 14px 30px rgba(15,23,42,0.14)",
        }}
      >
        <SceneSideControl
          label="On"
          title="On gorunum"
          onClick={() => onSelectCameraView?.("on")}
          active={!scenePremiumTools.topView}
        >
          <CameraAltOutlinedIcon />
        </SceneSideControl>
        <SceneSideControl
          label="Ust"
          title="Ust gorunum"
          onClick={() => onSelectCameraView?.("ust")}
          active={scenePremiumTools.topView}
        >
          <CameraAltOutlinedIcon />
        </SceneSideControl>
        <SceneSideControl
          label="Duvar"
          title="Duvarlari goster/gizle"
          onClick={onToggleSceneWalls}
          active={allRoomSurfacesVisible}
        >
          <GridViewOutlinedIcon />
        </SceneSideControl>
        {[
          ["backWallVisible", "Arka"],
          ["leftWallVisible", "Sol"],
          ["rightWallVisible", "Sag"],
          ["ceilingVisible", "Tavan"],
        ].map(([field, label]) => {
          const visible = roomSurfaces?.[field] !== false;
          const active = scenePremiumTools.walls && visible;
          const muted = !scenePremiumTools.walls;

          return (
            <SceneSideControl
              key={field}
              label={label}
              title={`${label} ${visible ? "gizle" : "goster"}`}
              onClick={() => onToggleRoomSurface?.(field)}
              active={active}
              muted={muted}
            >
              {visible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
            </SceneSideControl>
          );
        })}
      </Stack>
      <Box
        ref={sceneRef}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onWheel={onWheel}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseDown={onBackgroundMouseDown}
        sx={{
          width: layoutReady ? fittedWidth : "100%",
          height: layoutReady ? fittedHeight : placeholderHeight,
          minWidth: 320,
          maxWidth: "100%",
          position: "relative",
          background: sceneReady ? "#FFFFFF" : "transparent",
          perspective: "1000px",
          overflow: "visible",
          border: sceneReady
            ? "1px dashed rgba(15,23,42,0.18)"
            : "1px dashed transparent",
          borderRadius: 1.5,
          cursor:
            drag3DIndex !== null
              ? "grabbing"
              : hover3DIndex !== null || selectedSceneIndex !== null
                ? "grab"
                : "default",
          "&:fullscreen": {
            width: "100vw",
            height: "100vh",
            maxWidth: "100vw",
            minWidth: "100vw",
            borderRadius: 0,
            border: "none",
            background: "#FFFFFF",
          },
        }}
      >
        <Box
          data-kitchen-room-stage="true"
          data-kitchen-scene-root="true"
          onMouseDown={onBackgroundMouseDown}
          sx={{
            position: "absolute",
            inset: 0,
            transition: dragState ? "none" : "none",
          }}
        >
          {layoutReady && (
            <Canvas
              shadows
              dpr={[1, highQualityScene ? 1.9 : 1.25]}
              camera={{
                position: defaultCameraView.position,
                fov: 38,
              }}
              gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
              onCreated={({ camera }) => {
                applyDefaultCameraView(camera, controlsRef.current);
              }}
              onPointerMissed={() => {
                if (drag3DIndex === null) clearSelectionForOrbit();
              }}
              onPointerDown={(event) => {
                if (drag3DIndex === null && event.intersections.length === 0) {
                  clearSelectionForOrbit();
                }
              }}
            >
              {lighting.nightMode ? (
                <TwilightSceneBackground lightsOn={lighting.lightsOn} />
              ) : (
                <color attach="background" args={[lighting.background]} />
              )}
              <ambientLight intensity={lighting.ambient} />
              <hemisphereLight
                args={[
                  lighting.hemisphereSky,
                  lighting.hemisphereGround,
                  lighting.hemisphere,
                ]}
              />
              <directionalLight
                castShadow
                color={lighting.sunColor}
                position={lighting.nightMode ? [-3.2, 4.8, 2.8] : [0.8, 4.8, 3.2]}
                intensity={lighting.sun}
                shadow-mapSize={
                  highQualityScene ? [2048, 2048] : [1024, 1024]
                }
                shadow-bias={-0.0003}
              />
              <directionalLight
                color={lighting.fillColor}
                position={[-2.4, 2.8, 2.4]}
                intensity={lighting.fill}
              />
              <RoomShell
                roomDimensions={roomDimensions}
                roomSurfaces={roomSurfaces}
                premiumTools={scenePremiumTools}
                onEmptyPointerDown={clearSelectionForOrbit}
                onEmptyClick={clearSelectionForOrbit}
              />
              <CeilingLights
                roomDimensions={roomDimensions}
                visible={lighting.lampVisible}
                active={lighting.lightsOn}
                nightMode={lighting.nightMode}
                lampType={roomSurfaces?.lampType || "spot"}
              />
              {!floorPatternPalettes[roomSurfaces?.floorPattern] && (
                <gridHelper
                  args={[
                    Math.max(
                      cmToUnit(roomWidthCm),
                      cmToUnit(roomDimensions?.depth || 240),
                    ),
                    24,
                    "#D8DEE8",
                    "#EEF2F7",
                  ]}
                  position={[0, 0.008, 0]}
                />
              )}
              {drag3DIndex !== null && (
                <>
                  <SceneDragController
                    roomDimensions={roomDimensions}
                    wallMode={isWallDrag(drag3DIndex)}
                    surfaceHeight={getDragSurfaceHeight(drag3DIndex)}
                    onDragPoint={handle3DDragPoint}
                    onDragEnd={handle3DPointerUp}
                  />
                  <DragSurface
                    roomDimensions={roomDimensions}
                    wallMode={isWallDrag(drag3DIndex)}
                    surfaceHeight={getDragSurfaceHeight(drag3DIndex)}
                    onPointerMove={handle3DSurfaceMove}
                    onPointerUp={handle3DPointerUp}
                  />
                </>
              )}
              {sceneItems.map((item, index) => {
                const product = catalogMap[item.catalog_item_id] || {};
                const selected =
                  selectedSceneIndex === index ||
                  selectedSceneIndices.includes(index);

                return (
                  <SceneItem3D
                    key={`${item.catalog_item_id}-${index}`}
                    item={item}
                    index={index}
                    product={product}
                    materialMap={materialMap}
                    selectedDoor={selectedDoor}
                    selectedGlass={selectedGlass}
                    selectedCounter={selectedCounter}
                    selected={selected}
                    showMeasurements={scenePremiumTools.measurements}
                    sceneItems={sceneItems}
                    catalogMap={catalogMap}
                    roomDimensions={roomDimensions}
                    roomSurfaces={roomSurfaces}
                    cmToPx={cmToPx}
                    onSelectItem={onSelectItem}
                    onHoverItem={setHover3DIndex}
                    onOpenCustomizer={onOpenCustomizer}
                    onPrepareDrag={prepareItemDrag}
                    onMaybeStartDrag={maybeStartItemDrag}
                    onEndDrag={handle3DPointerUp}
                  />
                );
              })}
              <OrbitControls
                ref={controlsRef}
                makeDefault
                enabled={
                  drag3DIndex === null &&
                  !controlsLocked &&
                  !scenePremiumTools.cameraTour
                }
                enableDamping
                dampingFactor={0.08}
                enablePan
                screenSpacePanning
                mouseButtons={{
                  LEFT: MOUSE.ROTATE,
                  MIDDLE: MOUSE.PAN,
                  RIGHT: MOUSE.PAN,
                }}
                minDistance={0.28}
                maxDistance={8}
                minPolarAngle={0.04}
                maxPolarAngle={Math.PI - 0.04}
                target={defaultCameraView.target}
              />
              {scenePremiumTools.cameraTour && (
                <CameraTourController
                  controlsRef={controlsRef}
                  roomDimensions={roomDimensions}
                />
              )}
              <InitialCameraView
                controlsRef={controlsRef}
                applyView={applyDefaultCameraView}
                onReady={handleSceneReady}
              />
              <Environment preset="apartment" />
            </Canvas>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const InitialCameraView = ({ controlsRef, applyView, onReady }) => {
  const { camera } = useThree();

  useEffect(() => {
    applyView(camera, controlsRef.current);

    const frameId = requestAnimationFrame(() => onReady());
    return () => cancelAnimationFrame(frameId);
  }, [applyView, camera, controlsRef, onReady]);

  return null;
};

const CameraTourController = ({ controlsRef, roomDimensions }) => {
  const { camera, clock } = useThree();
  const startTimeRef = useRef(null);
  const roomWidth = cmToUnit(roomDimensions?.width || 450);
  const roomHeight = cmToUnit(roomDimensions?.height || 250);
  const roomDepth = cmToUnit(roomDimensions?.depth || 240);

  useFrame(() => {
    const controls = controlsRef.current;
    const target = new Vector3(0, roomHeight * 0.52, -roomDepth * 0.16);
    const radius = Math.max(roomWidth, roomDepth) * 1.58;
    const elapsed = clock.getElapsedTime();

    if (startTimeRef.current === null) {
      startTimeRef.current = elapsed;
    }

    const angle = (elapsed - startTimeRef.current) * 0.18;

    camera.position.set(
      Math.sin(angle) * radius,
      roomHeight * 0.72,
      Math.cos(angle) * radius,
    );
    camera.lookAt(target);
    camera.updateProjectionMatrix();

    if (controls) {
      controls.target.copy(target);
      controls.update();
    }
  });

  return null;
};

const cmToUnit = (value) => Number(value || 0) / 100;

const snapRoomValue = (value, roomSize, itemSize) => {
  const gridSize = 5;
  const edgeSnap = 10;
  const maxValue = Math.max(Number(roomSize || 0) - Number(itemSize || 0), 0);
  const snapped = Math.round(Number(value || 0) / gridSize) * gridSize;
  const clamped = Math.min(Math.max(snapped, 0), maxValue);

  if (clamped <= edgeSnap) return 0;
  if (maxValue - clamped <= edgeSnap) return maxValue;

  return clamped;
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

const isWallMountedItem = (
  item,
  product,
  dimensions = item?.dimensions || product?.dimensions || {},
) => item?.placement === "wall" || isWallMountedProduct(product, dimensions);

const getSceneItemDimensions = (product, item = {}) => {
  const mounted = isCountertopMountedProduct(product);
  const sourceDimensions = {
    ...(product.dimensions || {}),
    ...(item.dimensions || {}),
  };
  const wallMounted = isWallMountedItem(item, product, sourceDimensions);
  const defaults = {
    width: mounted ? 60 : 60,
    height: product.category === "countertop" ? 4 : mounted ? 6 : 72,
    depth: wallMounted ? 34 : mounted ? 48 : 56,
    unit: "cm",
  };
  const dimensions = {
    ...defaults,
    ...sourceDimensions,
  };

  if (mounted && Number(dimensions.height || 0) > 20) {
    dimensions.height = 6;
  }
  if (
    product.category === "countertop" &&
    Number(dimensions.height || 0) > 12
  ) {
    dimensions.height = 4;
  }

  return dimensions;
};

const rangesOverlap = (startA, sizeA, startB, sizeB) =>
  Math.min(startA + sizeA, startB + sizeB) - Math.max(startA, startB) > 1;

const isCollisionBlockingProduct = (product) =>
  Boolean(product) &&
  product.category !== "room" &&
  product.category !== "countertop" &&
  !isCountertopMountedProduct(product);

const resolveDragCollisionCm = ({
  item,
  index,
  product,
  dimensions,
  sceneItems,
  catalogMap,
  cmToPx,
  nextPosition,
}) => {
  if (!isCollisionBlockingProduct(product)) return nextPosition;

  const width = Math.max(Number(dimensions.width || 60), 1);
  const height = Math.max(Number(dimensions.height || 72), 1);
  const depth = Math.max(Number(dimensions.depth || 56), 1);
  const wallMode = isWallMountedItem(item, product, dimensions);
  const current = {
    x: Number(item.position?.x || 0) / cmToPx,
    y: Number(item.position?.y || 0) / cmToPx,
    z: Number(item.position?.z || 0),
  };
  const resolved = {
    x: Number(nextPosition.x ?? item.position?.x ?? 0) / cmToPx,
    y: Number(nextPosition.y ?? item.position?.y ?? 0) / cmToPx,
    z: Number(nextPosition.z ?? item.position?.z ?? 0),
  };
  const movement = {
    x: resolved.x - current.x,
    y: resolved.y - current.y,
    z: resolved.z - current.z,
  };

  sceneItems.forEach((otherItem, otherIndex) => {
    if (otherIndex === index) return;

    const otherProduct = catalogMap[otherItem.catalog_item_id] || {};
    if (!isCollisionBlockingProduct(otherProduct)) return;

    const otherDimensions = getSceneItemDimensions(otherProduct, otherItem);
    if (
      isWallMountedItem(otherItem, otherProduct, otherDimensions) !== wallMode
    )
      return;

    const other = {
      x: Number(otherItem.position?.x || 0) / cmToPx,
      y: Number(otherItem.position?.y || 0) / cmToPx,
      z: Number(otherItem.position?.z || 0),
      width: Math.max(Number(otherDimensions.width || 60), 1),
      height: Math.max(Number(otherDimensions.height || 72), 1),
      depth: Math.max(Number(otherDimensions.depth || 56), 1),
    };

    if (wallMode) {
      if (
        !rangesOverlap(resolved.x, width, other.x, other.width) ||
        !rangesOverlap(resolved.y, height, other.y, other.height)
      ) {
        return;
      }

      const xPenLeft = resolved.x + width - other.x;
      const xPenRight = other.x + other.width - resolved.x;
      const yPenTop = resolved.y + height - other.y;
      const yPenBottom = other.y + other.height - resolved.y;
      const xPen = Math.min(xPenLeft, xPenRight);
      const yPen = Math.min(yPenTop, yPenBottom);

      if (Math.abs(movement.x) >= Math.abs(movement.y) || xPen <= yPen) {
        resolved.x = movement.x >= 0 ? other.x - width : other.x + other.width;
      } else {
        resolved.y =
          movement.y >= 0 ? other.y - height : other.y + other.height;
      }
      return;
    }

    if (
      !rangesOverlap(resolved.x, width, other.x, other.width) ||
      !rangesOverlap(resolved.z, depth, other.z, other.depth)
    ) {
      return;
    }

    const xPenLeft = resolved.x + width - other.x;
    const xPenRight = other.x + other.width - resolved.x;
    const zPenFront = resolved.z + depth - other.z;
    const zPenBack = other.z + other.depth - resolved.z;
    const xPen = Math.min(xPenLeft, xPenRight);
    const zPen = Math.min(zPenFront, zPenBack);

    if (Math.abs(movement.x) >= Math.abs(movement.z) || xPen <= zPen) {
      resolved.x = movement.x >= 0 ? other.x - width : other.x + other.width;
    } else {
      resolved.z = movement.z >= 0 ? other.z - depth : other.z + other.depth;
    }
  });

  return {
    ...nextPosition,
    x: resolved.x * cmToPx,
    ...(wallMode ? { y: resolved.y * cmToPx, z: 0 } : { z: resolved.z }),
  };
};

const getItemFootprintCm = (item, product, cmToPx) => {
  const dimensions = getSceneItemDimensions(product, item);

  return {
    x: Number(item.position?.x || 0) / cmToPx,
    z: Number(item.position?.z || 0),
    width: Number(dimensions.width || 60),
    depth: Number(dimensions.depth || 56),
    height: Number(dimensions.height || 72),
    dimensions,
  };
};

const getBaseSupportTopCm = ({
  sceneItems,
  catalogMap,
  targetIndex,
  targetFootprint,
  cmToPx,
}) => {
  let supportTop = 0;

  sceneItems.forEach((supportItem, supportIndex) => {
    if (supportIndex === targetIndex) return;

    const supportProduct = catalogMap[supportItem.catalog_item_id] || {};
    if (!["base_cabinet", "appliance"].includes(supportProduct.category))
      return;

    const supportFootprint = getItemFootprintCm(
      supportItem,
      supportProduct,
      cmToPx,
    );
    const overlaps =
      rangesOverlap(
        targetFootprint.x,
        targetFootprint.width,
        supportFootprint.x,
        supportFootprint.width,
      ) &&
      rangesOverlap(
        targetFootprint.z,
        targetFootprint.depth,
        supportFootprint.z,
        supportFootprint.depth,
      );

    if (!overlaps) return;

    const supportElevation = Number(supportItem.position?.elevation);
    const supportBottom = Number.isFinite(supportElevation)
      ? supportElevation
      : 0;
    supportTop = Math.max(supportTop, supportBottom + supportFootprint.height);
  });

  return supportTop;
};

const getCountertopSupportTopCm = ({
  sceneItems,
  catalogMap,
  targetIndex,
  targetFootprint,
  cmToPx,
}) => {
  let supportTop = 0;

  sceneItems.forEach((supportItem, supportIndex) => {
    if (supportIndex === targetIndex) return;

    const supportProduct = catalogMap[supportItem.catalog_item_id] || {};
    if (supportProduct.category !== "countertop") return;

    const supportFootprint = getItemFootprintCm(
      supportItem,
      supportProduct,
      cmToPx,
    );
    const overlaps =
      rangesOverlap(
        targetFootprint.x,
        targetFootprint.width,
        supportFootprint.x,
        supportFootprint.width,
      ) &&
      rangesOverlap(
        targetFootprint.z,
        targetFootprint.depth,
        supportFootprint.z,
        supportFootprint.depth,
      );

    if (!overlaps) return;

    const countertopBottom =
      getBaseSupportTopCm({
        sceneItems,
        catalogMap,
        targetIndex: supportIndex,
        targetFootprint: supportFootprint,
        cmToPx,
      }) || Number(supportItem.position?.elevation || 0);

    supportTop = Math.max(
      supportTop,
      countertopBottom + supportFootprint.height,
    );
  });

  return supportTop;
};

const getDynamicElevationCm = ({
  item,
  index,
  product,
  sceneItems,
  catalogMap,
  cmToPx,
}) => {
  const footprint = getItemFootprintCm(item, product, cmToPx);

  if (product.category === "countertop") {
    return getBaseSupportTopCm({
      sceneItems,
      catalogMap,
      targetIndex: index,
      targetFootprint: footprint,
      cmToPx,
    });
  }

  if (isCountertopMountedProduct(product)) {
    return (
      getCountertopSupportTopCm({
        sceneItems,
        catalogMap,
        targetIndex: index,
        targetFootprint: footprint,
        cmToPx,
      }) ||
      getBaseSupportTopCm({
        sceneItems,
        catalogMap,
        targetIndex: index,
        targetFootprint: footprint,
        cmToPx,
      })
    );
  }

  const elevation = Number(item.position?.elevation);
  return Number.isFinite(elevation) ? elevation : null;
};

const getCategoryPlacement = (
  item,
  product,
  roomHeightCm,
  dimensions,
  topCm,
  elevationCm,
) => {
  const category = product?.category;
  const height = Number(dimensions.height || 72);
  const hasElevation =
    elevationCm !== null &&
    elevationCm !== undefined &&
    Number.isFinite(Number(elevationCm));
  const elevation = Number(elevationCm);

  if (hasElevation) {
    const maxElevation = Math.max(roomHeightCm - height, 0);
    return cmToUnit(
      Math.min(Math.max(elevation, 0), maxElevation) + height / 2,
    );
  }

  if (isWallMountedItem(item, product, dimensions)) {
    return Math.max(
      cmToUnit(roomHeightCm - topCm - height / 2),
      cmToUnit(height / 2),
    );
  }

  if (category === "countertop" || isCountertopMountedProduct(product)) {
    return cmToUnit(height / 2);
  }
  if (category === "appliance") return cmToUnit(Math.max(height / 2, 6));

  return cmToUnit(height / 2);
};

const getItem3DTransform = ({
  item,
  index,
  product,
  sceneItems,
  catalogMap,
  roomDimensions,
  cmToPx,
}) => {
  const roomWidthCm = Math.max(Number(roomDimensions?.width || 450), 1);
  const roomHeightCm = Math.max(Number(roomDimensions?.height || 250), 1);
  const roomDepthCm = Math.max(Number(roomDimensions?.depth || 240), 1);
  const dimensions = getSceneItemDimensions(product, item);
  const widthCm = Math.max(Number(dimensions.width || 60), 1);
  const heightCm = Math.max(Number(dimensions.height || 72), 1);
  const depthCm = Math.max(Number(dimensions.depth || 56), 1);
  const xCm = Math.min(
    Math.max(Number(item.position?.x || 0) / cmToPx, 0),
    roomWidthCm,
  );
  const topCm = Math.min(
    Math.max(Number(item.position?.y || 0) / cmToPx, 0),
    roomHeightCm,
  );
  const zCm = Math.min(Math.max(Number(item.position?.z || 0), 0), roomDepthCm);
  const roomWidth = cmToUnit(roomWidthCm);
  const roomDepth = cmToUnit(roomDepthCm);
  const width = cmToUnit(widthCm);
  const height = cmToUnit(heightCm);
  const depth = cmToUnit(depthCm);
  const x = -roomWidth / 2 + cmToUnit(xCm) + width / 2;
  const dynamicElevation = getDynamicElevationCm({
    item,
    index,
    product,
    sceneItems,
    catalogMap,
    cmToPx,
  });
  const y = getCategoryPlacement(
    item,
    product,
    roomHeightCm,
    dimensions,
    topCm,
    dynamicElevation,
  );
  const z =
    product.category === "room"
      ? 0
      : -roomDepth / 2 + cmToUnit(zCm) + depth / 2 + 0.08;

  return {
    position: [x, y, z],
    size: [width, height, depth],
    dimensions,
  };
};

const floorPatternPalettes = {
  oakHerringbone: {
    base: "#E7C37C",
    colors: ["#F2D99C", "#D9AE65", "#E9C782", "#C9964F", "#F6E0AB"],
    mode: "herringbone",
    sheen: 0.12,
  },
  warmPlank: {
    base: "#C98F43",
    colors: ["#D6A35A", "#BF7F35", "#E0B46E", "#A96D2F", "#C88E45"],
    mode: "plank",
    sheen: 0.1,
  },
  naturalChevron: {
    base: "#D5A760",
    colors: ["#E5BE7D", "#C28B44", "#F0D39B", "#B9843E", "#D7A15A"],
    mode: "chevron",
    sheen: 0.1,
  },
  paleOak: {
    base: "#EED9A6",
    colors: ["#F4E2B4", "#D9BA78", "#FFE9B7", "#CFA766", "#EBD29A"],
    mode: "plank",
    sheen: 0.16,
  },
  classicOak: {
    base: "#C28A40",
    colors: ["#C89247", "#E0B66F", "#B97A32", "#D59A4E", "#A96A2E"],
    mode: "plank",
    sheen: 0.08,
  },
  goldenChevron: {
    base: "#C98930",
    colors: ["#C98930", "#EAB961", "#A96A24", "#D99B3F", "#F0C875"],
    mode: "chevron",
    sheen: 0.08,
  },
  walnutPlank: {
    base: "#5B351F",
    colors: ["#5B351F", "#8A542D", "#3E2418", "#704224", "#9A6034"],
    mode: "plank",
    sheen: 0.04,
    dark: true,
  },
  darkWalnut: {
    base: "#2D1A13",
    colors: ["#2D1A13", "#5B3524", "#1F130E", "#42261A", "#6C4430"],
    mode: "plank",
    sheen: 0.03,
    dark: true,
  },
  smokedOak: {
    base: "#5C5A50",
    colors: ["#5C5A50", "#8B8778", "#3D3B35", "#737064", "#A29D8F"],
    mode: "plank",
    sheen: 0.045,
    dark: true,
  },
  blackChevron: {
    base: "#161616",
    colors: ["#161616", "#3A332B", "#0C0C0C", "#2A2621", "#4A4035"],
    mode: "chevron",
    sheen: 0.025,
    dark: true,
  },
  grayAsh: {
    base: "#A9A99F",
    colors: ["#A9A99F", "#D2D0C5", "#7B7B73", "#BDBBAF", "#96968D"],
    mode: "plank",
    sheen: 0.09,
  },
  rusticBrown: {
    base: "#70421F",
    colors: ["#70421F", "#A66B34", "#4A2C18", "#8A562B", "#BD7B3B"],
    mode: "plank",
    sheen: 0.04,
    dark: true,
  },
};

const drawWoodGrain = (
  context,
  x,
  y,
  width,
  height,
  seed = 0,
  dark = false,
) => {
  for (let grain = 0; grain < 7; grain += 1) {
    const grainY = y + 10 + grain * (height / 8) + ((seed + grain) % 5);
    context.strokeStyle = dark
      ? `rgba(245,222,179,${0.035 + grain * 0.007})`
      : `rgba(91,58,24,${0.08 + grain * 0.012})`;
    context.lineWidth = 1.1;
    context.beginPath();
    context.moveTo(x + 8, grainY);
    context.bezierCurveTo(
      x + width * 0.32,
      grainY - 7,
      x + width * 0.68,
      grainY + 9,
      x + width - 8,
      grainY - 2,
    );
    context.stroke();
  }
};

const paintWoodTile = (
  context,
  x,
  y,
  width,
  height,
  color,
  seed = 0,
  dark = false,
) => {
  const gradient = context.createLinearGradient(x, y, x + width, y + height);

  gradient.addColorStop(0, color);
  gradient.addColorStop(
    0.48,
    dark ? "rgba(92,64,42,0.92)" : "rgba(255,238,184,0.9)",
  );
  gradient.addColorStop(1, color);
  context.fillStyle = gradient;
  context.fillRect(x, y, width, height);
  context.strokeStyle = dark ? "rgba(0,0,0,0.38)" : "rgba(92,58,24,0.24)";
  context.lineWidth = 2;
  context.strokeRect(x + 1, y + 1, width - 2, height - 2);
  drawWoodGrain(context, x, y, width, height, seed, dark);
};

const createParquetTexture = (pattern = "oakHerringbone") => {
  if (typeof document === "undefined") return null;

  const palette =
    floorPatternPalettes[pattern] || floorPatternPalettes.oakHerringbone;
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 768;
  const context = canvas.getContext("2d");

  if (!context) return null;

  context.fillStyle = palette.base;
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (palette.mode === "herringbone" || palette.mode === "chevron") {
    const tile = 96;

    for (let y = -tile; y < canvas.height + tile; y += tile) {
      for (let x = -tile; x < canvas.width + tile; x += tile) {
        const color =
          palette.colors[(x / tile + y / tile + 8) % palette.colors.length];
        context.save();
        context.translate(x + tile / 2, y + tile / 2);
        context.rotate(Math.PI / 4);
        paintWoodTile(
          context,
          -tile / 2,
          -tile / 8,
          tile,
          tile / 4,
          color,
          x + y,
          palette.dark,
        );
        context.restore();

        context.save();
        context.translate(x + tile / 2, y + tile / 2);
        context.rotate(
          palette.mode === "chevron" ? -Math.PI / 4 : (Math.PI * 3) / 4,
        );
        paintWoodTile(
          context,
          -tile / 2,
          -tile / 8,
          tile,
          tile / 4,
          palette.colors[(x / tile + y / tile + 11) % palette.colors.length],
          x - y,
          palette.dark,
        );
        context.restore();
      }
    }
  } else {
    const plankHeight = 96;
    const plankWidths = [192, 256, 160, 224];

    for (let row = 0; row < canvas.height / plankHeight; row += 1) {
      let x = row % 2 === 0 ? 0 : -96;
      let plankIndex = row % plankWidths.length;

      while (x < canvas.width) {
        const plankWidth = plankWidths[plankIndex % plankWidths.length];
        const y = row * plankHeight;
        const color =
          palette.colors[(row + plankIndex) % palette.colors.length];

        paintWoodTile(
          context,
          x,
          y,
          plankWidth,
          plankHeight,
          color,
          row + plankIndex,
          palette.dark,
        );
        x += plankWidth;
        plankIndex += 1;
      }
    }
  }

  context.fillStyle = `rgba(255,255,255,${palette.sheen ?? 0.08})`;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
};

const seededRandom = (seed) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const createTwilightSkyTexture = () => {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  if (!context) return null;

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#000105");
  gradient.addColorStop(0.46, "#03030B");
  gradient.addColorStop(0.76, "#090513");
  gradient.addColorStop(1, "#120814");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 170; index += 1) {
    const x = seededRandom(index + 4) * canvas.width;
    const y = 8 + seededRandom(index + 19) * canvas.height * 0.7;
    const brightness = 0.16 + seededRandom(index + 41) * 0.34;
    const radius =
      seededRandom(index + 77) > 0.92
        ? 1.45
        : 0.45 + seededRandom(index + 93) * 0.45;
    context.fillStyle = `rgba(255,255,255,${brightness})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  const moonX = canvas.width * 0.055;
  const moonY = canvas.height * 0.075;
  const moonGlow = context.createRadialGradient(
    moonX,
    moonY,
    4,
    moonX,
    moonY,
    34,
  );
  moonGlow.addColorStop(0, "rgba(238,246,255,0.14)");
  moonGlow.addColorStop(0.42, "rgba(238,246,255,0.045)");
  moonGlow.addColorStop(1, "rgba(238,246,255,0)");
  context.fillStyle = moonGlow;
  context.beginPath();
  context.arc(moonX, moonY, 34, 0, Math.PI * 2);
  context.fill();

  const moonBody = context.createRadialGradient(
    moonX - 8,
    moonY - 9,
    2,
    moonX,
    moonY,
    14,
  );
  moonBody.addColorStop(0, "#FFFFFF");
  moonBody.addColorStop(0.62, "#E8EDF2");
  moonBody.addColorStop(1, "#BFC7CF");
  context.fillStyle = moonBody;
  context.beginPath();
  context.arc(moonX, moonY, 12, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(150,158,168,0.18)";
  context.beginPath();
  context.arc(moonX - 2.5, moonY + 3, 2.2, 0, Math.PI * 2);
  context.arc(moonX + 3.5, moonY - 1.5, 1.6, 0, Math.PI * 2);
  context.arc(moonX + 2, moonY + 4.5, 1.3, 0, Math.PI * 2);
  context.fill();

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const TwilightSceneBackground = ({ lightsOn }) => {
  void lightsOn;
  const texture = useMemo(() => createTwilightSkyTexture(), []);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) return null;

  return <primitive attach="background" object={texture} />;
};

const CeilingLights = ({
  roomDimensions,
  visible,
  active,
  nightMode,
  lampType = "spot",
}) => {
  const width = cmToUnit(roomDimensions?.width || 450);
  const height = cmToUnit(roomDimensions?.height || 250);
  const depth = cmToUnit(roomDimensions?.depth || 240);
  const y = Math.max(height - 0.06, 0.2);
  const lightPositions =
    lampType === "chandelier"
      ? [
          [-width * 0.16, y - 0.18, -depth * 0.12],
          [width * 0.16, y - 0.18, -depth * 0.12],
        ]
      : [
          [-width * 0.24, y, -depth * 0.28],
          [width * 0.24, y, -depth * 0.28],
          [-width * 0.24, y, depth * 0.12],
          [width * 0.24, y, depth * 0.12],
        ];
  const lightIntensity = active ? (nightMode ? 1.22 : 0.58) : 0;
  const fixtureColor = active ? "#FFE4A3" : "#D8D3C8";

  if (!visible) return null;

  return (
    <group>
      {lampType === "track" && (
        <mesh position={[0, y + 0.006, -depth * 0.08]} raycast={() => null}>
          <boxGeometry args={[width * 0.62, 0.025, 0.035]} />
          <meshStandardMaterial color="#1F2937" roughness={0.36} metalness={0.28} />
        </mesh>
      )}
      {lightPositions.map((position, index) => (
        <group key={`${position.join("-")}-${index}`} position={position}>
          {lampType === "chandelier" && (
            <mesh position={[0, 0.09, 0]} raycast={() => null}>
              <cylinderGeometry args={[0.006, 0.006, 0.34, 12]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.5} />
            </mesh>
          )}
          <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
            <cylinderGeometry
              args={[
                lampType === "chandelier" ? 0.105 : 0.078,
                lampType === "chandelier" ? 0.075 : 0.078,
                lampType === "track" ? 0.038 : 0.022,
                36,
              ]}
            />
            <meshStandardMaterial
              color={
                lampType === "track"
                  ? "#111827"
                  : nightMode
                    ? "#EFECE4"
                    : "#F7F4EC"
              }
              emissive={active ? "#FFE2A6" : "#000000"}
              emissiveIntensity={active ? (nightMode ? 0.36 : 0.27) : 0}
              roughness={0.42}
              metalness={0.08}
            />
          </mesh>
          <mesh
            position={[0, -0.014, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            raycast={() => null}
          >
            <circleGeometry args={[0.052, 32]} />
            <meshBasicMaterial
              color={fixtureColor}
              transparent
              opacity={active ? 0.88 : 0.45}
            />
          </mesh>
          <pointLight
            color="#FFE7B8"
            intensity={lightIntensity}
            distance={Math.max(width, depth) * (nightMode ? 0.72 : 0.95)}
            decay={nightMode ? 2.15 : 1.8}
            position={[0, -0.1, 0]}
            castShadow={nightMode && active}
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.00025}
          />
        </group>
      ))}
    </group>
  );
};

const RoomShell = ({
  roomDimensions,
  roomSurfaces,
  premiumTools,
  onEmptyClick,
  onEmptyPointerDown,
}) => {
  const width = cmToUnit(roomDimensions?.width || 450);
  const height = cmToUnit(roomDimensions?.height || 250);
  const depth = cmToUnit(roomDimensions?.depth || 240);
  const wallThickness = 0.075;
  const trimColor = "#D0D0CA";
  const surfaces = {
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
    ...(roomSurfaces || {}),
  };
  const isNight = surfaces.sceneMode === "night";
  const lightsOn = surfaces.lampVisible === true && surfaces.lightsOn === true;
  const surfaceColor = (value, fallback) => {
    const color = new Color(value || fallback);

    if (!isNight) return color;

    color.lerp(new Color(lightsOn ? "#FFE4B8" : "#8FA9CC"), lightsOn ? 0.1 : 0.18);
    color.multiplyScalar(lightsOn ? 0.78 : 0.48);

    return color;
  };
  const trimMaterialColor = surfaceColor(trimColor, "#D0D0CA");
  const floorTexture = useMemo(() => {
    if (!floorPatternPalettes[surfaces.floorPattern])
      return null;

    const texture = createParquetTexture(surfaces.floorPattern);
    if (texture) {
      texture.repeat.set(Math.max(width * 0.9, 1), Math.max(depth * 0.9, 1));
    }
    return texture;
  }, [depth, surfaces.floorPattern, width]);
  const cameraTourMode = premiumTools?.cameraTour === true;
  const wallsVisible = premiumTools?.walls !== false || cameraTourMode;
  const ceilingVisible =
    wallsVisible &&
    premiumTools?.topView !== true &&
    surfaces.ceilingVisible !== false;

  useEffect(() => () => floorTexture?.dispose(), [floorTexture]);

  const handleEmptyClick = (event) => {
    event.stopPropagation();
    onEmptyClick();
  };

  const handleEmptyPointerDown = (event) => {
    event.stopPropagation();
    onEmptyPointerDown();
  };

  return (
    <group>
      <mesh
        position={[0, -0.015, 0]}
        receiveShadow
        onPointerDown={handleEmptyPointerDown}
        onClick={handleEmptyClick}
      >
        <boxGeometry args={[width, 0.04, depth]} />
        <meshStandardMaterial
          color={
            floorTexture
              ? surfaceColor("#FFFFFF", "#FFFFFF")
              : surfaceColor(surfaces.floor, "#DDBF86")
          }
          map={floorTexture || null}
          roughness={0.42}
          metalness={0.02}
        />
      </mesh>
      {wallsVisible && (cameraTourMode || surfaces.backWallVisible !== false) && (
        <>
          <mesh
            position={[0, height / 2, -depth / 2 - wallThickness / 2]}
            receiveShadow
            onClick={handleEmptyClick}
            raycast={() => null}
          >
            <boxGeometry
              args={[width + wallThickness * 2, height, wallThickness]}
            />
            <meshStandardMaterial
              color={surfaceColor(surfaces.backWall, "#E8E6DE")}
              roughness={0.88}
              metalness={0}
            />
          </mesh>
          <mesh
            position={[0, height - 0.025, -depth / 2 + 0.035]}
            raycast={() => null}
          >
            <boxGeometry args={[width + 0.02, 0.035, 0.035]} />
            <meshStandardMaterial color={trimMaterialColor} roughness={0.82} />
          </mesh>
        </>
      )}
      {wallsVisible &&
        !cameraTourMode &&
        surfaces.leftWallVisible !== false && (
        <>
          <mesh
            position={[-width / 2 - wallThickness / 2, height / 2, 0]}
            receiveShadow
            onClick={handleEmptyClick}
            raycast={() => null}
          >
            <boxGeometry args={[wallThickness, height, depth]} />
            <meshStandardMaterial
              color={surfaceColor(surfaces.sideWall, "#E1DED5")}
              roughness={0.92}
              metalness={0}
            />
          </mesh>
        </>
      )}
      {wallsVisible &&
        !cameraTourMode &&
        surfaces.rightWallVisible !== false && (
        <>
          <mesh
            position={[width / 2 + wallThickness / 2, height / 2, 0]}
            receiveShadow
            onClick={handleEmptyClick}
            raycast={() => null}
          >
            <boxGeometry args={[wallThickness, height, depth]} />
            <meshStandardMaterial
              color={surfaceColor(surfaces.sideWall, "#E1DED5")}
              roughness={0.92}
              metalness={0}
            />
          </mesh>
        </>
      )}
      {!cameraTourMode && ceilingVisible && (
        <mesh
          position={[0, height + wallThickness / 2, 0]}
          receiveShadow
          onClick={handleEmptyClick}
          raycast={() => null}
        >
          <boxGeometry
            args={[
              width + wallThickness * 2,
              wallThickness,
              depth + wallThickness,
            ]}
          />
          <meshStandardMaterial
            color={surfaceColor(surfaces.ceiling, "#D4CDC0")}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      )}
      {wallsVisible &&
        !cameraTourMode &&
        surfaces.backWallVisible !== false &&
        surfaces.leftWallVisible !== false && (
          <mesh
            position={[-width / 2 + 0.018, height / 2, -depth / 2 + 0.018]}
            raycast={() => null}
          >
            <boxGeometry args={[0.028, height, 0.028]} />
            <meshStandardMaterial color={trimMaterialColor} roughness={0.88} />
          </mesh>
        )}
      {wallsVisible &&
        !cameraTourMode &&
        surfaces.backWallVisible !== false &&
        surfaces.rightWallVisible !== false && (
          <mesh
            position={[width / 2 - 0.018, height / 2, -depth / 2 + 0.018]}
            raycast={() => null}
          >
            <boxGeometry args={[0.028, height, 0.028]} />
            <meshStandardMaterial color={trimMaterialColor} roughness={0.88} />
          </mesh>
        )}
    </group>
  );
};

const DragSurface = ({
  roomDimensions,
  wallMode,
  surfaceHeight,
  onPointerMove,
  onPointerUp,
}) => {
  const width = cmToUnit(roomDimensions?.width || 450);
  const height = cmToUnit(roomDimensions?.height || 250);
  const depth = cmToUnit(roomDimensions?.depth || 240);

  if (wallMode) {
    return (
      <mesh
        position={[0, height / 2, -depth / 2 + 0.035]}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          transparent
          opacity={0.01}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    );
  }

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, surfaceHeight, 0]}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial
        transparent
        opacity={0.01}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
};

const SceneDragController = ({
  roomDimensions,
  wallMode,
  surfaceHeight,
  onDragPoint,
  onDragEnd,
}) => {
  const { camera, gl, raycaster } = useThree();
  const pointer = useRef(new Vector2());
  const point = useRef(new Vector3());
  const depth = cmToUnit(roomDimensions?.depth || 240);
  const dragPlane = useMemo(() => {
    if (wallMode) {
      return new Plane(new Vector3(0, 0, 1), depth / 2 - 0.035);
    }

    return new Plane(new Vector3(0, 1, 0), -surfaceHeight);
  }, [depth, surfaceHeight, wallMode]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (event.buttons !== 1) {
        onDragEnd();
        return;
      }

      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer.current, camera);

      if (raycaster.ray.intersectPlane(dragPlane, point.current)) {
        onDragPoint(point.current);
      }
    };

    const handlePointerUp = () => onDragEnd();

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [camera, dragPlane, gl.domElement, onDragEnd, onDragPoint, raycaster]);

  return null;
};

const FallbackCabinet3D = ({ product, size, palette }) => {
  const [width, height, depth] = size;
  const bodyColor =
    product.category === "countertop"
      ? palette.countertop
      : product.category === "shelf"
        ? "#B8874D"
        : "#E9E5DB";
  const doorColor = palette.door || "#F8FAFC";

  if (product.category === "countertop") {
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={bodyColor} roughness={0.48} />
      </mesh>
    );
  }

  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={bodyColor} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0, depth / 2 + 0.004]} castShadow>
        <boxGeometry args={[width * 0.82, height * 0.74, 0.018]} />
        <meshStandardMaterial color={doorColor} roughness={0.56} />
      </mesh>
      <mesh position={[width * 0.24, 0, depth / 2 + 0.018]}>
        <boxGeometry args={[0.018, height * 0.42, 0.012]} />
        <meshStandardMaterial
          color="#9CA3AF"
          metalness={0.25}
          roughness={0.42}
        />
      </mesh>
    </group>
  );
};

const Model3D = ({ product, size, rotation, palette }) => {
  const { scene } = useGLTF(product.model_url);
  const model = useMemo(() => {
    const clonedScene = scene.clone(true);

    clonedScene.traverse((object) => {
      if (!object.isMesh || !object.material) return;

      const applyMaterial = (material) => {
        const nextMaterial = material.clone();
        const nextColor = getModelMaterialColor(
          nextMaterial.name || object.name || "",
          product.category,
          palette,
        );

        if (nextColor && nextMaterial.color) {
          nextMaterial.color = new Color(nextColor);
          nextMaterial.needsUpdate = true;
        }

        return nextMaterial;
      };

      object.castShadow = true;
      object.receiveShadow = true;
      object.material = Array.isArray(object.material)
        ? object.material.map(applyMaterial)
        : applyMaterial(object.material);
    });

    return clonedScene;
  }, [palette, product.category, scene]);
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(model);
    const boxSize = new Vector3();
    const center = new Vector3();
    box.getSize(boxSize);
    box.getCenter(center);
    return {
      center,
      size: {
        x: Math.max(boxSize.x, 0.001),
        y: Math.max(boxSize.y, 0.001),
        z: Math.max(boxSize.z, 0.001),
      },
    };
  }, [model]);
  const rotationX = (Number(rotation?.x || 0) * Math.PI) / 180;
  const rotationY = (Number(rotation?.y || 0) * Math.PI) / 180;
  const rotationZ = (Number(rotation?.z || 0) * Math.PI) / 180;
  const scale = [
    size[0] / fit.size.x,
    size[1] / fit.size.y,
    size[2] / fit.size.z,
  ];

  return (
    <group rotation={[rotationX, rotationY, rotationZ]} scale={scale}>
      <primitive
        object={model}
        position={[-fit.center.x, -fit.center.y, -fit.center.z]}
      />
    </group>
  );
};

const formatDimensionValue = (value) => {
  const rounded = Math.round(Number(value || 0) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

const DimensionLabel = ({ position, children, distanceFactor = 7 }) => (
  <Html position={position} center distanceFactor={distanceFactor} occlude>
    <Box
      data-kitchen-scene-controls="true"
      sx={{
        pointerEvents: "none",
        px: 0.65,
        py: 0.28,
        borderRadius: 0.8,
        bgcolor: "#050505",
        color: "#FFFFFF",
        fontSize: 10.5,
        fontWeight: 900,
        lineHeight: 1,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 18px rgba(15,23,42,0.24)",
      }}
    >
      {children}
    </Box>
  </Html>
);

const DimensionLine = ({ position, size }) => (
  <mesh position={position} raycast={() => null}>
    <boxGeometry args={size} />
    <meshBasicMaterial color="#686868" />
  </mesh>
);

const DimensionEndCap = ({ position, vertical = false }) => (
  <mesh position={position} raycast={() => null}>
    <boxGeometry args={vertical ? [0.055, 0.01, 0.01] : [0.01, 0.055, 0.01]} />
    <meshBasicMaterial color="#686868" />
  </mesh>
);

const SceneItemDimensionGuides = ({ size, dimensions }) => {
  const [width, height, depth] = size;
  const frontZ = depth / 2 + 0.065;
  const sideX = width / 2 + 0.11;
  const leftX = -width / 2 - 0.11;
  const topY = height / 2 + 0.11;
  const bottomY = -height / 2 + 0.055;
  const guideColorZ = depth / 2 + 0.02;

  return (
    <group>
      <DimensionLine position={[0, topY, frontZ]} size={[width, 0.01, 0.01]} />
      <DimensionEndCap position={[-width / 2, topY, frontZ]} />
      <DimensionEndCap position={[width / 2, topY, frontZ]} />
      <DimensionLabel position={[width / 2 + 0.08, topY + 0.08, frontZ]}>
        {formatDimensionValue(dimensions.width)}
      </DimensionLabel>

      <DimensionLine
        position={[leftX, 0, guideColorZ]}
        size={[0.01, height, 0.01]}
      />
      <DimensionEndCap position={[leftX, -height / 2, guideColorZ]} vertical />
      <DimensionEndCap position={[leftX, height / 2, guideColorZ]} vertical />
      <DimensionLabel position={[leftX - 0.06, 0, guideColorZ]}>
        {formatDimensionValue(dimensions.height)}
      </DimensionLabel>

      <DimensionLine
        position={[sideX, bottomY, 0]}
        size={[0.01, 0.01, depth]}
      />
      <DimensionEndCap position={[sideX, bottomY, -depth / 2]} />
      <DimensionEndCap position={[sideX, bottomY, depth / 2]} />
      <DimensionLabel position={[sideX + 0.06, bottomY + 0.03, 0]}>
        {formatDimensionValue(dimensions.depth)}
      </DimensionLabel>
    </group>
  );
};

const isCameraBehindVisibleRoomWall = ({
  cameraPosition,
  roomDimensions,
  roomSurfaces,
}) => {
  const roomWidth = cmToUnit(roomDimensions?.width || 450);
  const roomHeight = cmToUnit(roomDimensions?.height || 250);
  const roomDepth = cmToUnit(roomDimensions?.depth || 240);
  const margin = 0.025;

  return (
    (roomSurfaces?.leftWallVisible !== false &&
      cameraPosition.x < -roomWidth / 2 - margin) ||
    (roomSurfaces?.rightWallVisible !== false &&
      cameraPosition.x > roomWidth / 2 + margin) ||
    (roomSurfaces?.backWallVisible !== false &&
      cameraPosition.z < -roomDepth / 2 - margin) ||
    (roomSurfaces?.ceilingVisible !== false &&
      cameraPosition.y > roomHeight + margin)
  );
};

const SceneItem3D = ({
  item,
  index,
  product,
  sceneItems,
  catalogMap,
  materialMap,
  selectedDoor,
  selectedGlass,
  selectedCounter,
  selected,
  showMeasurements,
  roomDimensions,
  roomSurfaces,
  cmToPx,
  onSelectItem,
  onHoverItem,
  onOpenCustomizer,
  onPrepareDrag,
  onMaybeStartDrag,
  onEndDrag,
}) => {
  const camera = useThree((state) => state.camera);
  const overlayHiddenRef = useRef(false);
  const [overlayHidden, setOverlayHidden] = useState(false);
  const transform = getItem3DTransform({
    item,
    index,
    product,
    sceneItems,
    catalogMap,
    roomDimensions,
    cmToPx,
  });
  const itemDoor = materialMap[item.options?.door_material_id] || selectedDoor;
  const itemGlass =
    materialMap[item.options?.glass_material_id] || selectedGlass;
  const itemCounter =
    materialMap[item.options?.countertop_material_id] || selectedCounter;
  const palette = {
    door: itemDoor?.color_hex || "#F8FAFC",
    glass: itemGlass?.color_hex || "#BAE6FD",
    countertop: itemCounter?.color_hex || "#E5E7EB",
  };

  useFrame(() => {
    const nextOverlayHidden =
      selected &&
      isCameraBehindVisibleRoomWall({
        cameraPosition: camera.position,
        roomDimensions,
        roomSurfaces,
      });

    if (overlayHiddenRef.current !== nextOverlayHidden) {
      overlayHiddenRef.current = nextOverlayHidden;
      setOverlayHidden(nextOverlayHidden);
    }
  });

  return (
    <group
      position={transform.position}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHoverItem(index);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        onHoverItem((current) => (current === index ? null : current));
      }}
  onPointerDown={(event) => {
        event.stopPropagation();
        event.sourceEvent?.preventDefault?.();
        event.sourceEvent?.stopPropagation?.();
        onSelectItem(index);
        if (!item.locked) {
          onPrepareDrag(index, event);
          event.target.setPointerCapture?.(event.pointerId);
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }
      }}
      onPointerMove={(event) => {
        event.stopPropagation();
        if (!item.locked) onMaybeStartDrag(index, event);
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        onEndDrag();
        event.target.releasePointerCapture?.(event.pointerId);
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelectItem(index);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        event.sourceEvent?.preventDefault?.();
        event.sourceEvent?.stopPropagation?.();
        onSelectItem(index);
        onOpenCustomizer?.(index);
      }}
    >
      <Suspense fallback={null}>
        {product.model_url ? (
          <Model3D
            product={product}
            size={transform.size}
            rotation={item.rotation}
            palette={palette}
          />
        ) : (
          <FallbackCabinet3D
            product={product}
            size={transform.size}
            palette={palette}
          />
        )}
      </Suspense>
      {selected && !overlayHidden && showMeasurements && (
        <>
          <mesh>
            <boxGeometry args={transform.size.map((value) => value + 0.035)} />
            <meshBasicMaterial transparent opacity={0} />
            <Edges color="#1976D2" linewidth={2} />
          </mesh>
          <SceneItemDimensionGuides
            size={transform.size}
            dimensions={transform.dimensions}
          />
        </>
      )}
      {selected && item.locked && !overlayHidden && (
        <DimensionLabel
          position={[0, transform.size[1] / 2 + 0.22, 0]}
          distanceFactor={8}
        >
          Kilitli
        </DimensionLabel>
      )}
    </group>
  );
};

export default KitchenScene;
