import { useEffect, useRef } from "react";
import {
  Box,
  Button,
  ClickAwayListener,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import { categoryLabel } from "../kitchenUtils";
import KitchenPricingPanel from "./KitchenPricingPanel";

const toInputValue = (value) => String(Math.round(Number(value || 0)));

const KitchenCustomizer = ({
  open,
  onClose,
  selectedSceneIndex,
  selectedSceneItem,
  selectedProduct,
  selectedDimensions,
  selectedOptions,
  selectedElevation,
  materials,
  selectedDoorMaterial,
  selectedGlassMaterial,
  selectedCounterMaterial,
  onChangeDimension,
  onChangeElevation,
  onChangeOption,
  onRotateItem,
  onRemoveItem,
  selectedLineQuote,
}) => {
  const commitTimersRef = useRef({});
  const minWidth = Number(selectedProduct?.constraints?.min_width || 0);
  const maxWidth = Number(
    selectedProduct?.constraints?.max_width || selectedDimensions?.width || 0,
  );
  const minHeight = Number(selectedProduct?.constraints?.min_height || 0);
  const maxHeight = Number(
    selectedProduct?.constraints?.max_height || selectedDimensions?.height || 0,
  );

  const commitDimension = (field, value) => {
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue)) return;

    onChangeDimension(selectedSceneIndex, field, nextValue);
  };

  const commitInputValue = (event, commit) => {
    const value = event.target.value;
    if (value.trim() === "" || !Number.isFinite(Number(value))) return;

    commit(value);
  };

  const clearCommitTimer = (key) => {
    if (!commitTimersRef.current[key]) return;
    clearTimeout(commitTimersRef.current[key]);
    delete commitTimersRef.current[key];
  };

  const scheduleCommit = (key, value, commit) => {
    clearCommitTimer(key);
    if (value.trim() === "" || !Number.isFinite(Number(value))) return;

    commitTimersRef.current[key] = setTimeout(() => {
      commit(value);
      delete commitTimersRef.current[key];
    }, 1000);
  };

  const commitOnEnter = (event, commit) => {
    if (event.key !== "Enter") return;
    clearCommitTimer(event.target.name);
    commitInputValue(event, commit);
    event.target.blur();
  };

  useEffect(
    () => () => {
      Object.values(commitTimersRef.current).forEach(clearTimeout);
      commitTimersRef.current = {};
    },
    [],
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      PaperProps={{
        sx: {
          width: { xs: 320, sm: 390 },
          p: 2,
          bgcolor: "#FFFFFF",
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
        onClickAway={(event) => {
          if (event.target?.closest?.("[data-kitchen-scene-item='true']")) return;
          if (event.target?.closest?.("[data-kitchen-scene-root='true']")) return;
          onClose();
        }}
      >
        <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Item Ozellikleri
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        {selectedSceneItem && selectedProduct ? (
          <>
            <Stack spacing={0.4}>
              <Typography sx={{ fontWeight: 900 }}>
                {selectedProduct.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {categoryLabel(selectedProduct.category)} - sahnedeki #
                {selectedSceneIndex + 1}
              </Typography>
            </Stack>

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  key={`width-${selectedSceneIndex}-${selectedDimensions.width}`}
                  label="Genislik"
                  size="small"
                  defaultValue={toInputValue(selectedDimensions.width)}
                  helperText={`Min ${minWidth} cm - Max ${maxWidth} cm`}
                  name="width"
                  inputProps={{ inputMode: "numeric" }}
                  onChange={(event) =>
                    scheduleCommit("width", event.target.value, (value) =>
                      commitDimension("width", value),
                    )
                  }
                  onBlur={(event) => {
                    clearCommitTimer("width");
                    commitInputValue(event, (value) => commitDimension("width", value));
                  }}
                  onKeyDown={(event) =>
                    commitOnEnter(event, (value) => commitDimension("width", value))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  key={`height-${selectedSceneIndex}-${selectedDimensions.height}`}
                  label="Yukseklik"
                  size="small"
                  defaultValue={toInputValue(selectedDimensions.height)}
                  helperText={`Min ${minHeight} cm - Max ${maxHeight} cm`}
                  name="height"
                  inputProps={{ inputMode: "numeric" }}
                  onChange={(event) =>
                    scheduleCommit("height", event.target.value, (value) =>
                      commitDimension("height", value),
                    )
                  }
                  onBlur={(event) => {
                    clearCommitTimer("height");
                    commitInputValue(event, (value) => commitDimension("height", value));
                  }}
                  onKeyDown={(event) =>
                    commitOnEnter(event, (value) => commitDimension("height", value))
                  }
                />
              </Grid>
            </Grid>

            <TextField
              key={`elevation-${selectedSceneIndex}-${selectedElevation}`}
              label="Yerden Yukseklik"
              size="small"
              defaultValue={toInputValue(selectedElevation)}
              helperText="Urunu sahnede asagi-yukari alir"
              name="elevation"
              inputProps={{ inputMode: "numeric" }}
              onChange={(event) =>
                scheduleCommit("elevation", event.target.value, (value) =>
                  onChangeElevation(selectedSceneIndex, value),
                )
              }
              onBlur={(event) => {
                clearCommitTimer("elevation");
                commitInputValue(event, (value) =>
                  onChangeElevation(selectedSceneIndex, value),
                );
              }}
              onKeyDown={(event) =>
                commitOnEnter(event, (value) =>
                  onChangeElevation(selectedSceneIndex, value),
                )
              }
            />

            {["base_cabinet", "wall_cabinet"].includes(
              selectedProduct.category,
            ) && (
              <TextField
                select
                label="Bu item kapagi"
                value={selectedOptions.door_material_id || selectedDoorMaterial}
                onChange={(event) =>
                  onChangeOption(
                    selectedSceneIndex,
                    "door_material_id",
                    event.target.value,
                  )
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
                value={
                  selectedOptions.glass_material_id || selectedGlassMaterial
                }
                onChange={(event) =>
                  onChangeOption(
                    selectedSceneIndex,
                    "glass_material_id",
                    event.target.value,
                  )
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
                value={
                  selectedOptions.countertop_material_id ||
                  selectedCounterMaterial
                }
                onChange={(event) =>
                  onChangeOption(
                    selectedSceneIndex,
                    "countertop_material_id",
                    event.target.value,
                  )
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

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 800 }}
              >
                Ürünü döndürmek için seçenekleri kullanın!
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{
                  mt: 1,
                  p: 1,
                  border: "1px solid #E2E8F0",
                  borderRadius: 1.5,
                  bgcolor: "#F8FAFC",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => onRotateItem(selectedSceneIndex, "y", -10)}
                  sx={{
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 6px 14px rgba(15,23,42,0.08)",
                  }}
                >
                  <RotateLeftIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onRotateItem(selectedSceneIndex, "x", -10)}
                  sx={{
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 6px 14px rgba(15,23,42,0.08)",
                  }}
                >
                  <KeyboardArrowUpIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onRotateItem(selectedSceneIndex, "x", 10)}
                  sx={{
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 6px 14px rgba(15,23,42,0.08)",
                  }}
                >
                  <KeyboardArrowDownIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onRotateItem(selectedSceneIndex, "y", 10)}
                  sx={{
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 6px 14px rgba(15,23,42,0.08)",
                  }}
                >
                  <RotateRightIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => onRemoveItem(selectedSceneIndex)}
              sx={{ textTransform: "none", fontWeight: 800 }}
            >
              Secili ürünü sil
            </Button>
          </>
        ) : (
          <Typography color="text.secondary">
            Ozellestirmek icin sahneden bir ürün seçin.
          </Typography>
        )}
        <KitchenPricingPanel
          selectedProduct={selectedProduct}
          selectedLineQuote={selectedLineQuote}
        />
        </Stack>
      </ClickAwayListener>
    </Drawer>
  );
};

export default KitchenCustomizer;
