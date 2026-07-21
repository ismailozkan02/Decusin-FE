import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ClickAwayListener,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { money } from "../kitchenUtils";

const ProductPreview = ({ product, selectedDoor, selectedCounter }) => {
  if (product.image_url) {
    return (
      <Box
        component="img"
        src={product.image_url}
        alt={product.name}
        sx={{
          width: 86,
          height: 68,
          objectFit: "contain",
          borderRadius: 1,
          border: "1px solid #CBD5E1",
          bgcolor: "#F1F7FE",
          p: 0.5,
        }}
      />
    );
  }

  const isWall = product.category === "wall_cabinet";
  const isCounter = product.category === "countertop";
  const isShelf = product.category === "shelf";
  const isAppliance = product.category === "appliance";
  const isRoom = product.category === "room";

  return (
    <Box
      sx={{
        width: 86,
        height: 68,
        borderRadius: 1,
        bgcolor: isAppliance || isRoom ? "#E0F2FE" : "#F8FAFC",
        border: "1px solid #CBD5E1",
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: isRoom ? 68 : isCounter ? 68 : isShelf ? 58 : 44,
          height: isRoom
            ? 42
            : isCounter
              ? 10
              : isShelf
                ? 8
                : isWall
                  ? 50
                  : isAppliance
                    ? 38
                    : 56,
          borderRadius: isAppliance ? "50%" : isRoom ? 1 : 0.5,
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

const KitchenPaletteDrawer = ({
  open,
  onClose,
  catalogGroups,
  catalogItems,
  onPaletteDragStart,
  onPaletteProductClick,
  selectedDoor,
  selectedCounter,
}) => {
  const orderedGroups = [
    ...catalogGroups.filter((group) => group.key === "room"),
    ...catalogGroups.filter((group) => group.key !== "room"),
  ];
  const [expanded, setExpanded] = useState("room");
  const toggle = (panel) => (_, nextExpanded) => {
    setExpanded(nextExpanded ? panel : false);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      PaperProps={{
        sx: {
          width: { xs: 310, sm: 380 },
          p: 2,
          bgcolor: "#F8FAFC",
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
        onClickAway={onClose}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Ürün Paleti
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Şablon seç veya ürünü sahneye sürükle.
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <MenuOpenIcon />
            </IconButton>
          </Stack>

          {orderedGroups.map((group) => {
            const groupItems = catalogItems.filter(
              (item) => item.category === group.key,
            );
            if (!groupItems.length) return null;

            return (
              <Accordion
                key={group.key}
                expanded={expanded === group.key}
                onChange={toggle(group.key)}
                disableGutters
                elevation={0}
                sx={{ border: "1px solid #E2E8F0" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 900 }}>
                    {group.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1.2}>
                    {groupItems.map((product) => (
                      <Grid item xs={6} key={product.id}>
                        <Paper
                          draggable
                          onClick={() => onPaletteProductClick(product)}
                          onDragStart={(event) =>
                            onPaletteDragStart(event, product)
                          }
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
                            <ProductPreview
                              product={product}
                              selectedDoor={selectedDoor}
                              selectedCounter={selectedCounter}
                            />
                            <Box sx={{ width: "100%", textAlign: "center" }}>
                              <Typography
                                sx={{ fontWeight: 900, fontSize: 12 }}
                                noWrap
                              >
                                {product.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", fontWeight: 800 }}
                              >
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
      </ClickAwayListener>
    </Drawer>
  );
};

export default KitchenPaletteDrawer;
