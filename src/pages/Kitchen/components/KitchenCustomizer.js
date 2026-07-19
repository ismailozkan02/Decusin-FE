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

const KitchenCustomizer = ({
  open,
  onClose,
  selectedSceneIndex,
  selectedSceneItem,
  selectedProduct,
  selectedDimensions,
  selectedOptions,
  materials,
  selectedDoorMaterial,
  selectedGlassMaterial,
  selectedCounterMaterial,
  onChangeDimension,
  onChangeOption,
  onRotateItem,
  onRemoveItem,
  selectedLineQuote,
}) => (
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
                  label="Genislik"
                  type="number"
                  size="small"
                  value={selectedDimensions.width}
                  onChange={(event) =>
                    onChangeDimension(
                      selectedSceneIndex,
                      "width",
                      event.target.value,
                    )
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
                    onChangeDimension(
                      selectedSceneIndex,
                      "height",
                      event.target.value,
                    )
                  }
                />
              </Grid>
            </Grid>

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

export default KitchenCustomizer;
