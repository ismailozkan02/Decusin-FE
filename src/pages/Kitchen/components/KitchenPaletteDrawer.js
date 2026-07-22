import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  ClickAwayListener,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import { getProductSubcategory, money } from "../kitchenUtils";

const ProductPreview = ({ product, selectedDoor, selectedCounter }) => {
  if (product.image_url) {
    return (
      <Box
        component="img"
        src={product.image_url}
        alt={product.name}
        sx={{
          width: 104,
          height: 82,
          objectFit: "contain",
          borderRadius: 1,
          border: "1px solid rgba(148,163,184,0.34)",
          background:
            "linear-gradient(145deg, rgba(248,251,255,0.98), rgba(232,240,250,0.78))",
          p: 0.7,
        }}
      />
    );
  }

  const isWall = product.category === "wall_cabinet";
  const isCounter = product.category === "countertop";
  const isShelf = product.category === "shelf";
  const isAppliance = ["appliance", "sink", "cooktop"].includes(
    product.category,
  );
  const isRoom = product.category === "room";

  return (
    <Box
      sx={{
        width: 104,
        height: 82,
        borderRadius: 1,
        bgcolor: isAppliance || isRoom ? "#E0F2FE" : "#F8FAFC",
        border: "1px solid rgba(148,163,184,0.34)",
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: isRoom ? 78 : isCounter ? 76 : isShelf ? 66 : 52,
          height: isRoom
            ? 48
            : isCounter
              ? 12
              : isShelf
                ? 8
                : isWall
                  ? 58
                  : isAppliance
                    ? 42
                    : 62,
          borderRadius: isAppliance ? "50%" : isRoom ? 1 : 0.5,
          bgcolor: isCounter
            ? selectedCounter?.color_hex || "#E5E7EB"
            : isShelf
              ? "#A16207"
              : selectedDoor?.color_hex || "#F8FAFC",
          border: "1px solid rgba(15,23,42,0.18)",
          boxShadow: "8px 11px 22px rgba(15,23,42,0.16)",
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
  const [selectedSubcategories, setSelectedSubcategories] = useState({});
  const toggle = (panel) => (_, nextExpanded) => {
    setExpanded(nextExpanded ? panel : false);
  };
  const getGroupSubcategories = (group) =>
    group.subcategories?.length
      ? group.subcategories
      : [{ key: "standard", title: group.title, hideTitle: true }];
  const handleWheelScroll = (event) => {
    const target = event.target;
    const scrollArea =
      target instanceof Element
        ? target.closest("[data-palette-scroll-area]") ||
          event.currentTarget.querySelector("[data-palette-scroll-root]")
        : event.currentTarget.querySelector("[data-palette-scroll-root]");

    if (!scrollArea) return;

    const maxScroll = scrollArea.scrollHeight - scrollArea.clientHeight;
    if (maxScroll <= 0) return;

    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent?.stopImmediatePropagation?.();

    scrollArea.scrollTop = Math.max(
      0,
      Math.min(maxScroll, scrollArea.scrollTop + event.deltaY),
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      PaperProps={{
        onWheelCapture: handleWheelScroll,
        onTouchMove: (event) => event.stopPropagation(),
        sx: {
          width: { xs: 340, sm: 430 },
          p: 0,
          bgcolor: "#F5F8FC",
          top: 0,
          height: "100vh",
          maxHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderLeft: "1px solid rgba(148,163,184,0.32)",
          boxShadow: "-18px 0 42px rgba(15,23,42,0.16)",
          zIndex: 1300,
        },
      }}
    >
      <ClickAwayListener
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        onClickAway={onClose}
      >
        <Stack sx={{ width: "100%", height: "100vh", minHeight: 0, overflow: "hidden" }}>
          <Box
            sx={{
              p: 2,
              flexShrink: 0,
              borderBottom: "1px solid rgba(148,163,184,0.24)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(235,243,255,0.9))",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "#2563EB",
                    fontWeight: 900,
                    letterSpacing: 0,
                    lineHeight: 1,
                  }}
                >
                  KATALOG
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                  Ürün Seçimi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kategori seç, ürünü tıkla veya sahneye sürükle.
                </Typography>
              </Box>
              <IconButton
                onClick={onClose}
                sx={{
                  borderRadius: 1,
                  bgcolor: "#FFFFFF",
                  border: "1px solid rgba(148,163,184,0.28)",
                }}
              >
                <MenuOpenIcon />
              </IconButton>
            </Stack>
          </Box>

          <Stack
            data-palette-scroll-root
            spacing={1.2}
            sx={{
              p: 1.4,
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              overscrollBehavior: "contain",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(37,99,235,0.45) rgba(226,232,240,0.7)",
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-track": {
                background: "rgba(226,232,240,0.7)",
                borderRadius: 8,
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(37,99,235,0.45)",
                borderRadius: 8,
              },
            }}
          >
            {orderedGroups.map((group) => {
              const groupItems = catalogItems.filter(
                (item) => item.category === group.key,
              );
              if (!groupItems.length) return null;
              const subcategories = getGroupSubcategories(group);
              const activeSubcategory =
                selectedSubcategories[group.key] || subcategories[0]?.key;
              const visibleItems = group.subcategories?.length
                ? groupItems.filter(
                    (product) =>
                      getProductSubcategory(product) === activeSubcategory,
                  )
                : groupItems;

              return (
                <Accordion
                  key={group.key}
                  expanded={expanded === group.key}
                  onChange={toggle(group.key)}
                  disableGutters
                  elevation={0}
                  sx={{
                    border: "1px solid rgba(148,163,184,0.26)",
                    borderRadius: "6px !important",
                    overflow: "hidden",
                    flexShrink: 0,
                    bgcolor: "#FFFFFF",
                    boxShadow:
                      expanded === group.key
                        ? "0 14px 30px rgba(15,23,42,0.08)"
                        : "0 8px 20px rgba(15,23,42,0.04)",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      minHeight: 54,
                      px: 1.5,
                      "& .MuiAccordionSummary-content": { my: 1 },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ width: "100%" }}
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 1,
                          display: "grid",
                          placeItems: "center",
                          color: "#2563EB",
                          bgcolor: "#EFF6FF",
                          border: "1px solid rgba(37,99,235,0.18)",
                        }}
                      >
                        <ViewInArOutlinedIcon sx={{ fontSize: 19 }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 950 }}>
                          {group.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {groupItems.length} ürün
                        </Typography>
                      </Box>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails
                    data-palette-scroll-area
                    sx={{
                      pt: 0,
                      px: 1.2,
                      pb: 1.2,
                      maxHeight: "calc(100vh - 184px)",
                      overflowY: "auto",
                      overscrollBehavior: "contain",
                      scrollbarWidth: "thin",
                      scrollbarColor:
                        "rgba(37,99,235,0.42) rgba(226,232,240,0.65)",
                      "&::-webkit-scrollbar": { width: 7 },
                      "&::-webkit-scrollbar-track": {
                        background: "rgba(226,232,240,0.65)",
                        borderRadius: 8,
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "rgba(37,99,235,0.42)",
                        borderRadius: 8,
                      },
                    }}
                  >
                    {group.subcategories?.length ? (
                      <Box
                        sx={{
                          mb: 1,
                          p: 0.7,
                          borderRadius: 1.2,
                          bgcolor: "#F8FAFC",
                          border: "1px solid rgba(148,163,184,0.2)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
                        }}
                      >
                        <Typography
                          sx={{
                            mb: 0.45,
                            fontSize: 10,
                            fontWeight: 950,
                            color: "#2563EB",
                            textTransform: "uppercase",
                            lineHeight: 1,
                          }}
                        >
                          Alt kategori
                        </Typography>
                        <Box
                          component="select"
                          value={activeSubcategory}
                          onChange={(event) =>
                            setSelectedSubcategories((current) => ({
                              ...current,
                              [group.key]: event.target.value,
                            }))
                          }
                          sx={{
                            width: "100%",
                            height: 38,
                            borderRadius: 1,
                            border: "1px solid rgba(37,99,235,0.28)",
                            outline: "none",
                            bgcolor: "#FFFFFF",
                            color: "#0F172A",
                            px: 1.1,
                            fontSize: 13,
                            fontWeight: 900,
                            boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
                            cursor: "pointer",
                            "&:focus": {
                              borderColor: "rgba(37,99,235,0.72)",
                              boxShadow: "0 0 0 3px rgba(37,99,235,0.12)",
                            },
                          }}
                        >
                          {subcategories.map((subcategory) => {
                            const count = groupItems.filter(
                              (product) =>
                                getProductSubcategory(product) ===
                                subcategory.key,
                            ).length;

                            return (
                              <option key={subcategory.key} value={subcategory.key}>
                                {subcategory.title} ({count} ürün)
                              </option>
                            );
                          })}
                        </Box>
                      </Box>
                    ) : null}

                    <Stack
                      spacing={0.9}
                      sx={{
                        pr: 0.4,
                      }}
                    >
                      {visibleItems.map((product) => (
                        <Paper
                          key={product.id}
                          draggable
                          onClick={() => onPaletteProductClick(product)}
                          onDragStart={(event) =>
                            onPaletteDragStart(event, product)
                          }
                          elevation={0}
                          sx={{
                            border: "1px solid rgba(148,163,184,0.28)",
                            borderRadius: 1,
                            p: 0.8,
                            bgcolor: "#FFFFFF",
                            cursor: "grab",
                            userSelect: "none",
                            transition:
                              "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease",
                            "&:hover": {
                              transform: "translateY(-1px)",
                              borderColor: "rgba(37,99,235,0.38)",
                              boxShadow: "0 12px 26px rgba(15,23,42,0.11)",
                            },
                            "&:active": { cursor: "grabbing" },
                          }}
                        >
                          <Stack direction="row" spacing={1.1} alignItems="center">
                            <ProductPreview
                              product={product}
                              selectedDoor={selectedDoor}
                              selectedCounter={selectedCounter}
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                sx={{
                                  fontWeight: 950,
                                  fontSize: 13,
                                  lineHeight: "17px",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {product.name}
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ mt: 0.5, flexWrap: "wrap" }}
                              >
                                <Chip
                                  size="small"
                                  label={`${product.dimensions?.width || 0} x ${
                                    product.dimensions?.height || 0
                                  }`}
                                  sx={{
                                    height: 22,
                                    borderRadius: 0.8,
                                    fontWeight: 800,
                                  }}
                                />
                                <Chip
                                  size="small"
                                  label={money(product.base_price)}
                                  color="primary"
                                  variant="outlined"
                                  sx={{
                                    height: 22,
                                    borderRadius: 0.8,
                                    fontWeight: 900,
                                  }}
                                />
                              </Stack>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 0.6 }}
                              >
                                Tıkla ekle, sürükle yerleştir
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                display: "grid",
                                placeItems: "center",
                                color: "#FFFFFF",
                                background:
                                  "linear-gradient(135deg, #2563EB, #0F766E)",
                                boxShadow: "0 8px 18px rgba(37,99,235,0.18)",
                                flexShrink: 0,
                              }}
                            >
                              <AddRoundedIcon sx={{ fontSize: 19 }} />
                            </Box>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        </Stack>
      </ClickAwayListener>
    </Drawer>
  );
};

export default KitchenPaletteDrawer;

