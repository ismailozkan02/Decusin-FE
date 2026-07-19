import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, IconButton, Paper, Stack } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInFullOutlinedIcon from "@mui/icons-material/OpenInFullOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Canvas, useThree } from "@react-three/fiber";
import { Edges, Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, Color, DoubleSide, Plane, Vector2, Vector3 } from "three";

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
  onClearSelection,
  onSceneItemMouseDown,
  onSelectItem,
  onMoveItem3D,
  onResizeMouseDown,
  onCopyItem,
  onDeleteItem,
  onNewProject,
  onSaveProject,
  onExportPdf,
  onToggleFullscreen,
}) => {
  void onResizeMouseDown;
  void onSceneItemMouseDown;

  const wrapperRef = useRef(null);
  const pendingDragRef = useRef(null);
  const [sceneBox, setSceneBox] = useState({ width: 0, top: 0 });
  const [drag3DIndex, setDrag3DIndex] = useState(null);
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
  const roomDepthCm = Math.max(Number(roomDimensions?.depth || 240), 1);
  const isWallDrag = (index) => {
    const item = sceneItems[index];
    const product = catalogMap[item?.catalog_item_id] || {};
    return product.category === "wall_cabinet" || product.category === "shelf";
  };

  const moveItemFromWorldPoint = (index, point) => {
    const item = sceneItems[index];
    const product = catalogMap[item?.catalog_item_id] || {};
    if (!item || !product) return;

    const dimensions = {
      width: 60,
      height: product.category === "countertop" ? 4 : 72,
      depth: product.category === "wall_cabinet" ? 34 : 56,
      ...(product.dimensions || {}),
      ...(item.dimensions || {}),
    };
    const widthCm = Math.max(Number(dimensions.width || 60), 1);
    const heightCm = Math.max(Number(dimensions.height || 72), 1);
    const depthCm = Math.max(Number(dimensions.depth || 56), 1);
    const rawXCm = (point.x + cmToUnit(roomWidthCm) / 2) * 100 - widthCm / 2;
    const xCm = snapRoomValue(rawXCm, roomWidthCm, widthCm);

    if (product.category === "wall_cabinet" || product.category === "shelf") {
      const rawTopCm = roomHeightCm - point.y * 100 - heightCm / 2;
      const yCm = snapRoomValue(rawTopCm, roomHeightCm, heightCm);

      onMoveItem3D?.(index, {
        x: xCm * cmToPx,
        y: yCm * cmToPx,
        z: 0,
      });
      return;
    }

    const rawZCm = (point.z + cmToUnit(roomDepthCm) / 2) * 100 - depthCm / 2;
    const zCm = snapRoomValue(rawZCm, roomDepthCm, depthCm);

    onMoveItem3D?.(index, {
      x: xCm * cmToPx,
      z: zCm,
    });
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
  };

  const prepareItemDrag = (index, event) => {
    const sourceEvent = event.sourceEvent || event;

    pendingDragRef.current = {
      index,
      x: Number(sourceEvent.clientX || 0),
      y: Number(sourceEvent.clientY || 0),
    };
  };

  const maybeStartItemDrag = (index, event) => {
    const sourceEvent = event.sourceEvent || event;
    const pendingDrag = pendingDragRef.current;

    if (!pendingDrag || pendingDrag.index !== index || sourceEvent.buttons !== 1) return;

    const deltaX = Number(sourceEvent.clientX || 0) - pendingDrag.x;
    const deltaY = Number(sourceEvent.clientY || 0) - pendingDrag.y;

    if (Math.hypot(deltaX, deltaY) < 6) return;

    setDrag3DIndex(index);
  };

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
          data-kitchen-scene-root="true"
          onMouseDown={onBackgroundMouseDown}
          sx={{
            position: "absolute",
            inset: 0,
            transition: dragState ? "none" : "none",
          }}
        >
          <Canvas
            shadows
            dpr={[1, 1.7]}
            camera={{
              position: [
                cmToUnit(roomWidthCm) * 0.85,
                cmToUnit(roomHeightCm) * 0.72,
                cmToUnit(roomDimensions?.depth || 240) * 1.15,
              ],
              fov: 38,
            }}
            gl={{ antialias: true, alpha: true }}
            onPointerMissed={() => {
              if (drag3DIndex === null) onClearSelection();
            }}
          >
            <color attach="background" args={["#F7F7F5"]} />
            <ambientLight intensity={0.74} />
            <directionalLight
              castShadow
              position={[2.8, 4.8, 3.4]}
              intensity={2}
              shadow-mapSize={[1024, 1024]}
            />
            <directionalLight position={[-3, 2.6, 2]} intensity={0.55} />
            <RoomShell
              roomDimensions={roomDimensions}
              onEmptyClick={() => {
                if (drag3DIndex === null) onClearSelection();
              }}
            />
            <gridHelper
              args={[Math.max(cmToUnit(roomWidthCm), cmToUnit(roomDimensions?.depth || 240)), 24, "#D8DEE8", "#EEF2F7"]}
              position={[0, 0.008, 0]}
            />
            {drag3DIndex !== null && (
              <>
                <SceneDragController
                  roomDimensions={roomDimensions}
                  wallMode={isWallDrag(drag3DIndex)}
                  onDragPoint={handle3DDragPoint}
                  onDragEnd={handle3DPointerUp}
                />
                <DragSurface
                  roomDimensions={roomDimensions}
                  wallMode={isWallDrag(drag3DIndex)}
                  onPointerMove={handle3DSurfaceMove}
                  onPointerUp={handle3DPointerUp}
                />
              </>
            )}
            {sceneItems.map((item, index) => {
              const product = catalogMap[item.catalog_item_id] || {};

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
                  selected={selectedSceneIndex === index}
                  roomDimensions={roomDimensions}
                  cmToPx={cmToPx}
                  onSelectItem={onSelectItem}
                  dragging={drag3DIndex === index}
                  onPrepareDrag={prepareItemDrag}
                  onMaybeStartDrag={maybeStartItemDrag}
                  onEndDrag={handle3DPointerUp}
                  onCopyItem={onCopyItem}
                  onDeleteItem={onDeleteItem}
                />
              );
            })}
            <OrbitControls
              makeDefault
              enabled={drag3DIndex === null}
              enableDamping
              dampingFactor={0.08}
              minDistance={2.1}
              maxDistance={8}
              maxPolarAngle={Math.PI / 2.05}
              target={[0, cmToUnit(roomHeightCm) * 0.42, 0]}
            />
            <Environment preset="apartment" />
          </Canvas>
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
  const name = `${product?.name || ""} ${product?.category || ""}`.toLowerCase();
  return ["evye", "ocak", "sink", "hob", "cooktop"].some((keyword) => name.includes(keyword));
};

const getCategoryPlacement = (product, roomHeightCm, dimensions, topCm) => {
  const category = product?.category;
  const height = Number(dimensions.height || 72);

  if (category === "wall_cabinet" || category === "shelf") {
    return Math.max(cmToUnit(roomHeightCm - topCm - height / 2), cmToUnit(height / 2));
  }

  if (category === "countertop") return cmToUnit(90);
  if (isCountertopMountedProduct(product)) return cmToUnit(92 + height / 2);
  if (category === "appliance") return cmToUnit(Math.max(height / 2, 6));

  return cmToUnit(height / 2);
};

const getItem3DTransform = ({ item, product, roomDimensions, cmToPx }) => {
  const roomWidthCm = Math.max(Number(roomDimensions?.width || 360), 1);
  const roomHeightCm = Math.max(Number(roomDimensions?.height || 260), 1);
  const roomDepthCm = Math.max(Number(roomDimensions?.depth || 240), 1);
  const dimensions = {
    width: 60,
    height: product.category === "countertop" ? 4 : 72,
    depth: product.category === "wall_cabinet" ? 34 : 56,
    ...(product.dimensions || {}),
    ...(item.dimensions || {}),
  };
  const widthCm = Math.max(Number(dimensions.width || 60), 1);
  const heightCm = Math.max(Number(dimensions.height || 72), 1);
  const depthCm = Math.max(Number(dimensions.depth || 56), 1);
  const xCm = Math.min(Math.max(Number(item.position?.x || 0) / cmToPx, 0), roomWidthCm);
  const topCm = Math.min(Math.max(Number(item.position?.y || 0) / cmToPx, 0), roomHeightCm);
  const zCm = Math.min(Math.max(Number(item.position?.z || 0), 0), roomDepthCm);
  const roomWidth = cmToUnit(roomWidthCm);
  const roomDepth = cmToUnit(roomDepthCm);
  const width = cmToUnit(widthCm);
  const height = cmToUnit(heightCm);
  const depth = cmToUnit(depthCm);
  const x = -roomWidth / 2 + cmToUnit(xCm) + width / 2;
  const y = getCategoryPlacement(product, roomHeightCm, dimensions, topCm);
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

const RoomShell = ({ roomDimensions, onEmptyClick }) => {
  const width = cmToUnit(roomDimensions?.width || 360);
  const height = cmToUnit(roomDimensions?.height || 260);
  const depth = cmToUnit(roomDimensions?.depth || 240);
  const handleEmptyClick = (event) => {
    event.stopPropagation();
    onEmptyClick();
  };

  return (
    <group>
      <mesh position={[0, -0.015, 0]} receiveShadow onClick={handleEmptyClick}>
        <boxGeometry args={[width, 0.03, depth]} />
        <meshStandardMaterial color="#DDBF86" roughness={0.58} metalness={0.02} />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow onClick={handleEmptyClick}>
        <boxGeometry args={[width, height, 0.06]} />
        <meshStandardMaterial color="#F4F1E9" roughness={0.72} />
      </mesh>
      <mesh position={[-width / 2, height / 2, 0]} receiveShadow onClick={handleEmptyClick}>
        <boxGeometry args={[0.06, height, depth]} />
        <meshStandardMaterial color="#EFECE3" roughness={0.76} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} receiveShadow onClick={handleEmptyClick}>
        <boxGeometry args={[0.06, height, depth]} />
        <meshStandardMaterial color="#ECE9DF" roughness={0.76} />
      </mesh>
      <mesh position={[0, height + 0.015, 0]} receiveShadow onClick={handleEmptyClick}>
        <boxGeometry args={[width, 0.03, depth]} />
        <meshStandardMaterial color="#D8D8D2" roughness={0.74} />
      </mesh>
      <mesh position={[0, 0.025, -depth / 2 - 0.02]}>
        <boxGeometry args={[width + 0.08, 0.05, 0.08]} />
        <meshStandardMaterial color="#D5D5D0" />
      </mesh>
      <mesh position={[-width / 2 - 0.02, height / 2, 0]}>
        <boxGeometry args={[0.08, height + 0.08, depth + 0.08]} />
        <meshStandardMaterial color="#D5D5D0" />
      </mesh>
      <mesh position={[width / 2 + 0.02, height / 2, 0]}>
        <boxGeometry args={[0.08, height + 0.08, depth + 0.08]} />
        <meshStandardMaterial color="#D5D5D0" />
      </mesh>
    </group>
  );
};

const DragSurface = ({ roomDimensions, wallMode, onPointerMove, onPointerUp }) => {
  const width = cmToUnit(roomDimensions?.width || 360);
  const height = cmToUnit(roomDimensions?.height || 260);
  const depth = cmToUnit(roomDimensions?.depth || 240);

  if (wallMode) {
    return (
      <mesh
        position={[0, height / 2, -depth / 2 + 0.035]}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} side={DoubleSide} />
      </mesh>
    );
  }

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.035, 0]}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial transparent opacity={0.01} depthWrite={false} side={DoubleSide} />
    </mesh>
  );
};

const SceneDragController = ({ roomDimensions, wallMode, onDragPoint, onDragEnd }) => {
  const { camera, gl, raycaster } = useThree();
  const pointer = useRef(new Vector2());
  const point = useRef(new Vector3());
  const depth = cmToUnit(roomDimensions?.depth || 240);
  const dragPlane = useMemo(() => {
    if (wallMode) {
      return new Plane(new Vector3(0, 0, 1), depth / 2 - 0.035);
    }

    return new Plane(new Vector3(0, 1, 0), -0.035);
  }, [depth, wallMode]);

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
        <meshStandardMaterial color="#9CA3AF" metalness={0.25} roughness={0.42} />
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
        const nextColor = getModelMaterialColor(nextMaterial.name || object.name || "", product.category, palette);

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
      <primitive object={model} position={[-fit.center.x, -fit.center.y, -fit.center.z]} />
    </group>
  );
};

const SceneItem3D = ({
  item,
  index,
  product,
  materialMap,
  selectedDoor,
  selectedGlass,
  selectedCounter,
  selected,
  dragging,
  roomDimensions,
  cmToPx,
  onSelectItem,
  onPrepareDrag,
  onMaybeStartDrag,
  onEndDrag,
  onCopyItem,
  onDeleteItem,
}) => {
  const transform = getItem3DTransform({ item, product, roomDimensions, cmToPx });
  const itemDoor = materialMap[item.options?.door_material_id] || selectedDoor;
  const itemGlass = materialMap[item.options?.glass_material_id] || selectedGlass;
  const itemCounter = materialMap[item.options?.countertop_material_id] || selectedCounter;
  const palette = {
    door: itemDoor?.color_hex || "#F8FAFC",
    glass: itemGlass?.color_hex || "#BAE6FD",
    countertop: itemCounter?.color_hex || "#E5E7EB",
  };

  return (
    <group
      position={transform.position}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelectItem(index);
        onPrepareDrag(index, event);
        event.target.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        event.stopPropagation();
        onMaybeStartDrag(index, event);
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        onEndDrag();
        event.target.releasePointerCapture?.(event.pointerId);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelectItem(index);
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
          <FallbackCabinet3D product={product} size={transform.size} palette={palette} />
        )}
      </Suspense>
      {selected && (
        <>
          <mesh>
            <boxGeometry args={transform.size.map((value) => value + 0.035)} />
            <meshBasicMaterial transparent opacity={0} />
            <Edges color="#1976D2" linewidth={2} />
          </mesh>
          {dragging && (
            <Html position={[0, 0.08, transform.size[2] / 2 + 0.16]} center distanceFactor={7}>
              <Box
                data-kitchen-scene-controls="true"
                sx={{
                  px: 0.8,
                  py: 0.35,
                  borderRadius: 1,
                  bgcolor: "rgba(25,118,210,0.92)",
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                }}
              >
                Snap 5 cm
              </Box>
            </Html>
          )}
          <Html position={[0, transform.size[1] / 2 + 0.12, 0]} center distanceFactor={6}>
            <Stack
              data-kitchen-scene-controls="true"
              direction="row"
              spacing={0.4}
              sx={{
                p: 0.35,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(226,232,240,0.95)",
                boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
              }}
            >
              <IconButton
                size="small"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onCopyItem(index);
                }}
                sx={{ width: 24, height: 24, color: "#2563EB" }}
              >
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                size="small"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteItem(index);
                }}
                sx={{ width: 24, height: 24, color: "#EF4444" }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          </Html>
          <Html position={[transform.size[0] / 2 + 0.12, 0, transform.size[2] / 2]} center distanceFactor={8}>
            <Box
              data-kitchen-scene-controls="true"
              sx={{
                px: 0.8,
                py: 0.35,
                borderRadius: 1,
                bgcolor: "#050505",
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              {Math.round(Number(transform.dimensions.width || 0))} x {Math.round(Number(transform.dimensions.height || 0))}
            </Box>
          </Html>
        </>
      )}
    </group>
  );
};

export default KitchenScene;
