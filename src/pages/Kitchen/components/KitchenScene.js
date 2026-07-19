import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, IconButton, Paper, Stack } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInFullOutlinedIcon from "@mui/icons-material/OpenInFullOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { Box3, Color, Vector3 } from "three";

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
    return ["base_cabinet", "wall_cabinet"].includes(category) ? palette.door : null;
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
        const nextColor = getModelMaterialColor(nextMaterial.name || object.name || "", category, palette);

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

const KitchenScene = ({
  sceneRef,
  sceneItems,
  catalogMap,
  materialMap,
  selectedDoor,
  selectedGlass,
  selectedCounter,
  selectedSceneIndex,
  roomDimensions,
  dragState,
  zoom,
  onDragOver,
  onDrop,
  onWheel,
  onMouseMove,
  onMouseUp,
  onBackgroundMouseDown,
  onSceneItemMouseDown,
  onResizeMouseDown,
  onCopyItem,
  onDeleteItem,
  onNewProject,
  onSaveProject,
  onExportPdf,
  onToggleFullscreen,
}) => {
  const wrapperRef = useRef(null);
  const [sceneBox, setSceneBox] = useState({ width: 0, top: 0 });
  const [viewportHeight, setViewportHeight] = useState(
    typeof window === "undefined" ? 900 : window.innerHeight,
  );
  const roomWidthCm = Math.max(Number(roomDimensions?.width || 360), 1);
  const roomHeightCm = Math.max(Number(roomDimensions?.height || 260), 1);
  const roomRatio = roomHeightCm / roomWidthCm;
  const availableWidth = Math.max((sceneBox.width || 1000) - 34, 300);
  const availableHeight = Math.max(viewportHeight - sceneBox.top - 128, 300);
  const fittedWidth = Math.min(availableWidth, availableHeight / roomRatio);
  const fittedHeight = fittedWidth * roomRatio;
  const cmToPx = Math.max((fittedWidth / roomWidthCm) * zoom, 0.6);

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
        bgcolor: "#DCEEFF",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        display: "flex",
        justifyContent: "center",
        position: "relative",
        p: { xs: 1, md: 2 },
        background: "linear-gradient(135deg, #E8F4FF 0%, #D8EBFF 100%)",
      }}
    >
      <Box
        ref={sceneRef}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onWheel={onWheel}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseDown={onBackgroundMouseDown}
        sx={{
          width: fittedWidth,
          height: fittedHeight,
          minWidth: 320,
          maxWidth: "100%",
          position: "relative",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%)",
          perspective: "1000px",
          overflow: "visible",
          border: "1px dashed rgba(15,23,42,0.18)",
          borderRadius: 1.5,
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
          onMouseDown={onBackgroundMouseDown}
          sx={{
            position: "absolute",
            inset: 0,
            transition: dragState ? "none" : "none",
          }}
        >
          {sceneItems.map((item, index) => {
            const product = catalogMap[item.catalog_item_id] || {};
            const isWall = product.category === "wall_cabinet";
            const isCounter = product.category === "countertop";
            const isShelf = product.category === "shelf";
            const hasModel = Boolean(product.model_url);
            const itemDimensions = {
              ...(product.dimensions || {}),
              ...(item.dimensions || {}),
            };
            const itemDoor =
              materialMap[item.options?.door_material_id] || selectedDoor;
            const itemGlass =
              materialMap[item.options?.glass_material_id] || selectedGlass;
            const itemCounter =
              materialMap[item.options?.countertop_material_id] ||
              selectedCounter;
            const widthCm = Number(itemDimensions.width || 60);
            const heightCm = Number(
              itemDimensions.height ||
                (isWall ? 72 : isCounter ? 4 : isShelf ? 3 : 72),
            );
            const width = Math.max(widthCm * cmToPx, hasModel ? 44 : 24);
            const height = Math.max(heightCm * cmToPx, hasModel ? 44 : 12);
            const selected = selectedSceneIndex === index;
            const layerIndex =
              product.category === "room"
                ? 1
                : isWall
                  ? 12
                  : isCounter
                    ? 18
                    : product.category === "appliance"
                      ? 24
                    : isShelf
                      ? 20
                      : 10;
            const depthLayer = Math.round(Number(item.position?.z || 0));

            return (
              <Box
                key={`${item.catalog_item_id}-${index}`}
                data-kitchen-scene-item="true"
                onMouseDown={(event) => onSceneItemMouseDown(event, index)}
                sx={{
                  width,
                  height,
                  position: "absolute",
                  left: Number(item.position?.x || 0),
                  top: Number(item.position?.y || 0),
                  border: hasModel
                    ? selected
                      ? "1px solid rgba(25,118,210,0.36)"
                      : "1px solid transparent"
                    : "1px solid rgba(15,23,42,0.18)",
                  bgcolor: isCounter
                    ? itemCounter?.color_hex
                    : isShelf
                      ? "#A16207"
                      : hasModel
                        ? selected
                          ? "rgba(25,118,210,0.035)"
                          : "rgba(255,255,255,0.01)"
                        : itemDoor?.color_hex,
                  transform:
                    hasModel || isShelf
                      ? "none"
                      : "rotateX(2deg) rotateY(-12deg)",
                  display: "grid",
                  placeItems: "center",
                  cursor: dragState?.index === index ? "grabbing" : "grab",
                  userSelect: "none",
                  zIndex: selected
                    ? 1000
                    : dragState?.index === index
                      ? 900
                      : layerIndex + depthLayer,
                  outline: "none",
                  boxShadow: selected
                    ? hasModel
                      ? "inset 0 0 0 2px rgba(25,118,210,0.96), 0 10px 22px rgba(15,23,42,0.08)"
                      : "inset 0 0 0 3px #1976D2, 10px 14px 22px rgba(15,23,42,0.18)"
                    : hasModel
                      ? "none"
                      : "10px 14px 22px rgba(15,23,42,0.18)",
                  borderRadius: hasModel ? 1.5 : 0,
                }}
              >
              {hasModel && (
                <ProductModelCanvas
                  product={product}
                  rotation={item.rotation}
                  materialPalette={{
                    door: itemDoor?.color_hex || "#F8FAFC",
                    glass: itemGlass?.color_hex || "#BAE6FD",
                    countertop: itemCounter?.color_hex || "#E5E7EB",
                  }}
                />
              )}
                {!hasModel && product.image_url && (
                  <ProductImageFallback product={product} compact />
                )}
                {!hasModel && !isCounter && !isShelf && (
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
                {selected && (
                  <>
                    <Stack
                      data-kitchen-scene-controls="true"
                      direction="row"
                      spacing={0.25}
                      sx={{
                        position: "absolute",
                        top: -30,
                        left: "50%",
                        transform: "translateX(-50%)",
                        p: 0.25,
                        borderRadius: 999,
                        bgcolor: "rgba(255,255,255,0.96)",
                        border: "1px solid rgba(226,232,240,0.95)",
                        boxShadow: "0 12px 28px rgba(15,23,42,0.16)",
                        backdropFilter: "blur(10px)",
                        zIndex: 9,
                      }}
                    >
                      <IconButton
                        size="small"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          onCopyItem(index);
                        }}
                        sx={{
                          width: 22,
                          height: 22,
                          color: "#2563EB",
                          borderRadius: "50%",
                          "& .MuiSvgIcon-root": { fontSize: 15 },
                          "&:hover": {
                            bgcolor: "#EFF6FF",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteItem(index);
                        }}
                        sx={{
                          width: 22,
                          height: 22,
                          color: "#EF4444",
                          borderRadius: "50%",
                          "& .MuiSvgIcon-root": { fontSize: 15 },
                          "&:hover": {
                            bgcolor: "#FEF2F2",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                    {[
                      ["top-left", -6, -6, "nwse-resize"],
                      ["top-center", -6, width / 2 - 6, "ns-resize"],
                      ["top-right", -6, width - 6, "nesw-resize"],
                      ["bottom-left", height - 6, -6, "nesw-resize"],
                      ["bottom-center", height - 6, width / 2 - 6, "ns-resize"],
                      ["bottom-right", height - 6, width - 6, "nwse-resize"],
                    ].map(([corner, top, left, cursor]) => (
                      <Box
                        key={corner}
                        data-kitchen-scene-controls="true"
                        onMouseDown={(event) =>
                          onResizeMouseDown(
                            event,
                            index,
                            corner,
                            widthCm,
                            heightCm,
                            cmToPx,
                          )
                        }
                        sx={{
                          position: "absolute",
                          top,
                          left,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: "#1976D2",
                          border: "2px solid #FFFFFF",
                          boxShadow: "0 2px 7px rgba(15,23,42,0.24)",
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
                                : corner === "top-center"
                                  ? "rotate(45deg)"
                                  : corner === "top-right"
                                    ? "rotate(90deg)"
                                    : corner === "bottom-center"
                                      ? "rotate(225deg)"
                                      : corner === "bottom-right"
                                        ? "rotate(180deg)"
                                        : "rotate(270deg)",
                          },
                        }}
                      />
                    ))}
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
      <Stack
        data-kitchen-scene-controls="true"
        direction="row"
        spacing={1}
        sx={{
          position: "absolute",
          left: { xs: 12, md: 20 },
          top: { xs: 12, md: 20 },
          zIndex: 1200,
        }}
      >
        <Button
          variant="contained"
          startIcon={<PictureAsPdfOutlinedIcon />}
          onClick={onExportPdf}
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 1.5,
            px: 1.8,
            boxShadow: "0 12px 24px rgba(25,118,210,0.22)",
          }}
        >
          PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={<OpenInFullOutlinedIcon />}
          onClick={onToggleFullscreen}
          sx={{
            bgcolor: "rgba(255,255,255,0.92)",
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 1.5,
            px: 1.8,
            "&:hover": { bgcolor: "#FFFFFF" },
          }}
        >
          Buyut
        </Button>
      </Stack>
      <Stack
        data-kitchen-scene-controls="true"
        direction="row"
        spacing={1}
        sx={{
          position: "absolute",
          right: { xs: 12, md: 20 },
          bottom: { xs: 12, md: 20 },
          zIndex: 1200,
        }}
      >
        <Button
          variant="contained"
          startIcon={<RestartAltOutlinedIcon />}
          onClick={onNewProject}
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 1.5,
            px: 2.2,
            py: 1,
            bgcolor: "#1976D2",
            boxShadow: "0 14px 28px rgba(25,118,210,0.24)",
            "&:hover": { bgcolor: "#1565C0" },
          }}
        >
          Yeni Proje
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={onSaveProject}
          disabled={!sceneItems.length}
          color="success"
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 1.5,
            px: 2.2,
            py: 1,
            boxShadow: "0 14px 28px rgba(25,118,210,0.28)",
          }}
        >
          Projeyi Kaydet
        </Button>
      </Stack>
    </Paper>
  );
};

export default KitchenScene;
