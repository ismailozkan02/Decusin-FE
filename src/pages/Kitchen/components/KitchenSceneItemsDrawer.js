import {
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { money } from "../kitchenUtils";

const KitchenSceneItemsDrawer = ({
  open,
  onClose,
  sceneItems,
  catalogMap,
  selectedSceneIndex,
  onSelectItem,
  onDeleteItem,
  quote,
}) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    variant="persistent"
    PaperProps={{
      sx: {
        width: { xs: 320, sm: 420 },
        p: 2,
        bgcolor: "#F8FAFC",
        top: 0,
        height: "100%",
        borderLeft: "1px solid #E2E8F0",
        boxShadow: "-14px 0 34px rgba(15,23,42,0.14)",
        zIndex: 1300,
      },
    }}
  >
    <ClickAwayListener
      mouseEvent="onMouseDown"
      touchEvent="onTouchStart"
      onClickAway={onClose}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Ekli Ürünler
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sahnedeki ürünleri yönet.
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            border: "1px solid #E2E8F0",
            borderRadius: 2,
            bgcolor: "#FFFFFF",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#E0F2FE",
                  color: "#0369A1",
                }}
              >
                <LayersOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900 }}>
                  {sceneItems.length} ürün
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Toplam {money(quote?.total)}
                </Typography>
              </Box>
            </Stack>
            <Chip
              size="small"
              label="Sahne"
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Paper>

        <Stack spacing={1.1}>
          {sceneItems.length ? (
            sceneItems.map((item, index) => {
              const product = catalogMap[item.catalog_item_id] || {};
              const line = quote?.lines?.[index];
              const dimensions = {
                ...(product.dimensions || {}),
                ...(item.dimensions || {}),
              };
              const selected = selectedSceneIndex === index;

              return (
                <Paper
                  key={`${item.catalog_item_id}-${index}`}
                  elevation={0}
                  onClick={() => onSelectItem(index)}
                  sx={{
                    p: 1,
                    border: selected
                      ? "2px solid #1976D2"
                      : "1px solid #E2E8F0",
                    borderRadius: 1.5,
                    bgcolor: selected ? "#EEF6FF" : "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Box
                      component="img"
                      src={
                        product.image_url || "/images/kitchen/base-cabinet.svg"
                      }
                      alt={product.name || "Ürün"}
                      sx={{
                        width: 64,
                        height: 52,
                        objectFit: "cover",
                        borderRadius: 1,
                        border: "1px solid #CBD5E1",
                        bgcolor: "#F8FAFC",
                      }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 900 }} noWrap>
                        {product.name || "Ürün"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(Number(dimensions.width || 0))} x{" "}
                        {Math.round(Number(dimensions.height || 0))} cm
                      </Typography>
                      <Typography
                        sx={{
                          display: "block",
                          fontWeight: 900,
                          color: "#0F766E",
                          mt: 0.3,
                        }}
                      >
                        {money(line?.line_total || product.base_price)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteItem(index);
                      }}
                      sx={{
                        color: "#EF4444",
                        border: "1px solid #FECACA",
                        bgcolor: "#FFF7F7",
                        "&:hover": { bgcolor: "#FEE2E2" },
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Paper>
              );
            })
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px dashed #CBD5E1",
                borderRadius: 2,
                textAlign: "center",
                bgcolor: "#FFFFFF",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>Sahnede ürün yok</Typography>
              <Typography variant="body2" color="text.secondary">
                Paletten ürün ekleyince burada listelenecek.
              </Typography>
            </Paper>
          )}
        </Stack>

        {sceneItems.length > 0 && (
          <>
            <Divider />
            <Button
              variant="contained"
              onClick={onClose}
              sx={{ textTransform: "none", fontWeight: 900 }}
            >
              Sahneye Don
            </Button>
          </>
        )}
      </Stack>
    </ClickAwayListener>
  </Drawer>
);

export default KitchenSceneItemsDrawer;
