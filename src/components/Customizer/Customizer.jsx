// yandaki tema butonu

import { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  Box,
  Divider,
  Drawer as MuiDrawer,
  FormControlLabel,
  IconButton,
  InputLabel,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Check from "mdi-material-ui/Check";
import Close from "mdi-material-ui/Close";
import CogOutline from "mdi-material-ui/CogOutline";
import ScrollBar from "components/ScrollBar";
import useLocale from "hooks/useLocale";
import useTheming from "hooks/useTheming";

const Toggler = styled(Box)(({ theme }) => ({
  right: 0,
  top: "50%",
  display: "flex",
  cursor: "pointer",
  position: "fixed",
  padding: theme.spacing(2),
  zIndex: theme.zIndex.modal,
  transform: "translateY(-50%)",
  backgroundColor: theme.palette.primary.main,
  borderTopLeftRadius: theme.shape.borderRadius,
  borderBottomLeftRadius: theme.shape.borderRadius,
}));

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  width: 400,
  zIndex: theme.zIndex.modal,
  "& .MuiFormControlLabel-root": {
    marginRight: "0.6875rem",
  },
  "& .MuiDrawer-paper": {
    border: 0,
    width: 400,
    zIndex: theme.zIndex.modal,
    boxShadow: theme.shadows[9],
  },
}));

const CustomizerSpacing = styled("div")(({ theme }) => ({
  padding: theme.spacing(5, 6),
}));

const ColorBox = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  display: "flex",
  cursor: "pointer",
  alignItems: "center",
  justifyContent: "center",
  margin: theme.spacing(0, 1.5),
  color: theme.palette.common.white,
  transition: "box-shadow .25s ease",
  borderRadius: theme.shape.borderRadius,
}));

const Customizer = () => {
  const { formatMessage } = useLocale();
  const { mode, skin, appBar, layout, themeColor, navCollapsed, contentWidth, verticalNavToggleType, onSave } =
    useTheming();
  const [open, setOpen] = useState(false);

  return (
    <div className={"customizer"}>
      <Toggler className={"customizer-toggler"} onClick={() => setOpen(true)}>
        <CogOutline sx={{ height: 20, width: 20, color: "common.white" }} />
      </Toggler>
      <Drawer open={open} hideBackdrop anchor={"right"} variant={"persistent"}>
        <Box
          className={"customizer-header"}
          sx={{
            position: "relative",
            p: (theme) => theme.spacing(3.5, 5),
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant={"h6"} sx={{ fontWeight: 600, textTransform: "uppercase" }}>
            <FormattedMessage id={"label.theme_customizer"} defaultMessage={"Theme Customizer"} />
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            <FormattedMessage id={"label.customize_and_preview"} defaultMessage={"Customize & Preview"} />
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              right: 20,
              top: "50%",
              position: "absolute",
              color: "text.secondary",
              transform: "translateY(-50%)",
            }}
          >
            <Close fontSize={"small"} />
          </IconButton>
        </Box>
        <ScrollBar>
          <CustomizerSpacing className={"customizer-body"}>
            <Typography
              component={"p"}
              variant={"caption"}
              sx={{ mb: 4, color: "text.disabled", textTransform: "uppercase" }}
            >
              <FormattedMessage id={"label.theming"} defaultMessage={"Theming"} />
            </Typography>
            <Box sx={{ mb: 4 }}>
              <Typography>
                <FormattedMessage id={"label.skin"} defaultMessage={"Skin"} />
              </Typography>
              <RadioGroup
                row
                value={skin}
                onChange={(e) => onSave("skin", e.target.value)}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: ".875rem",
                    color: "text.secondary",
                  },
                }}
              >
                <FormControlLabel
                  value={"default"}
                  label={formatMessage("label.default", "Default")}
                  control={<Radio />}
                />
                <FormControlLabel
                  value={"bordered"}
                  label={formatMessage("label.bordered", "Bordered")}
                  control={<Radio />}
                />
                {layout === "horizontal" ? null : (
                  <FormControlLabel
                    value={"semi-dark"}
                    label={formatMessage("label.semi_dark", "Semi Dark")}
                    control={<Radio />}
                  />
                )}
              </RadioGroup>
            </Box>
            <Box sx={{ mb: 4 }}>
              <Typography>
                <FormattedMessage id={"label.mode"} defaultMessage={"Mode"} />
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <InputLabel
                  htmlFor={"change-mode"}
                  sx={{
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "text.secondary",
                  }}
                >
                  <FormattedMessage id={"label.light"} defaultMessage={"Light"} />
                </InputLabel>
                <Switch
                  id={"change-mode"}
                  checked={mode === "dark"}
                  onChange={(e) => onSave("mode", e.target.checked ? "dark" : "light")}
                />
                <InputLabel
                  htmlFor={"change-mode"}
                  sx={{
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "text.secondary",
                  }}
                >
                  <FormattedMessage id={"label.dark"} defaultMessage={"Dark"} />
                </InputLabel>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ mb: 2.5 }}>
                <FormattedMessage id={"label.primary_color"} defaultMessage={"Primary Color"} />
              </Typography>
              <Box sx={{ display: "flex" }}>
                <ColorBox
                  onClick={() => onSave("themeColor", "custom")}
                  sx={{
                    ml: 0,
                    backgroundColor: "#1E5B4A",
                    ...(themeColor === "custom" ? { boxShadow: 9 } : { "&:hover": { boxShadow: 4 } }),
                  }}
                >
                  {themeColor === "custom" ? <Check fontSize={"small"} /> : null}
                </ColorBox>
                <ColorBox
                  onClick={() => onSave("themeColor", "primary")}
                  sx={{
                   
                    backgroundColor: "#9155FD",
                    ...(themeColor === "primary" ? { boxShadow: 9 } : { "&:hover": { boxShadow: 4 } }),
                  }}
                >
                  {themeColor === "primary" ? <Check fontSize={"small"} /> : null}
                </ColorBox>
                <ColorBox
                  onClick={() => onSave("themeColor", "secondary")}
                  sx={{
                    backgroundColor: "secondary.main",
                    ...(themeColor === "secondary" ? { boxShadow: 9 } : { "&:hover": { boxShadow: 4 } }),
                  }}
                >
                  {themeColor === "secondary" ? <Check fontSize={"small"} /> : null}
                </ColorBox>
                <ColorBox
                  onClick={() => onSave("themeColor", "success")}
                  sx={{
                    backgroundColor: "success.main",
                    ...(themeColor === "success" ? { boxShadow: 9 } : { "&:hover": { boxShadow: 4 } }),
                  }}
                >
                  {themeColor === "success" ? <Check fontSize={"small"} /> : null}
                </ColorBox>
                <ColorBox
                  onClick={() => onSave("themeColor", "error")}
                  sx={{
                    backgroundColor: "error.main",
                    ...(themeColor === "error" ? { boxShadow: 9 } : { "&:hover": { boxShadow: 4 } }),
                  }}
                >
                  {themeColor === "error" ? <Check fontSize={"small"} /> : null}
                </ColorBox>
                <ColorBox
                  onClick={() => onSave("themeColor", "warning")}
                  sx={{
                    backgroundColor: "warning.main",
                    ...(themeColor === "warning" ? { boxShadow: 9 } : { "&:hover": { boxShadow: 4 } }),
                  }}
                >
                  {themeColor === "warning" ? <Check fontSize={"small"} /> : null}
                </ColorBox>
                <ColorBox
                  onClick={() => onSave("themeColor", "info")}
                  sx={{
                    mr: 0,
                    backgroundColor: "info.main",
                    ...(themeColor === "info" ? { boxShadow: 9 } : { "&:hover": { boxShadow: 4 } }),
                  }}
                >
                  {themeColor === "info" ? <Check fontSize="small" /> : null}
                </ColorBox>
              </Box>
            </Box>
          </CustomizerSpacing>
          <Divider sx={{ m: 0 }} />
          <CustomizerSpacing className={"customizer-body"}>
            <Typography
              component={"p"}
              variant={"caption"}
              sx={{ mb: 4, color: "text.disabled", textTransform: "uppercase" }}
            >
              <FormattedMessage id={"label.layout"} defaultMessage={"Layout"} />
            </Typography>
            <Box sx={{ mb: 4 }}>
              <Typography>
                <FormattedMessage id={"label.content_width"} defaultMessage={"Content Width"} />
              </Typography>
              <RadioGroup
                row
                value={contentWidth}
                onChange={(e) => onSave("contentWidth", e.target.value)}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: ".875rem",
                    color: "text.secondary",
                  },
                }}
              >
                <FormControlLabel value={"full"} label={formatMessage("label.full", "Full")} control={<Radio />} />
                <FormControlLabel value={"boxed"} label={formatMessage("label.boxed", "Boxed")} control={<Radio />} />
              </RadioGroup>
            </Box>
          </CustomizerSpacing>
          <Divider sx={{ m: 0 }} />
          <CustomizerSpacing className={"customizer-body"}>
            <Typography
              component={"p"}
              variant={"caption"}
              sx={{ mb: 4, color: "text.disabled", textTransform: "uppercase" }}
            >
              <FormattedMessage id={"label.menu"} defaultMessage={"Menu"} />
            </Typography>
            <Box
              sx={{
                mb: layout === "horizontal" && appBar === "hidden" ? {} : 4,
              }}
            >
              <Typography>
                <FormattedMessage id={"label.menu_layout"} defaultMessage={"Menu Layout"} />
              </Typography>
              <RadioGroup
                row
                value={layout}
                onChange={(e) => onSave("layout", e.target.value)}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: ".875rem",
                    color: "text.secondary",
                  },
                }}
              >
                <FormControlLabel
                  value={"vertical"}
                  label={formatMessage("label.vertical", "Vertical")}
                  control={<Radio />}
                />
                <FormControlLabel
                  value={"horizontal"}
                  label={formatMessage("label.horizontal", "Horizontal")}
                  control={<Radio />}
                />
              </RadioGroup>
            </Box>
            {layout === "horizontal" ? null : (
              <Box sx={{ mb: 4 }}>
                <Typography>
                  <FormattedMessage id={"label.menu_toggle"} defaultMessage={"Menu Toggle"} />
                </Typography>
                <RadioGroup
                  row
                  value={verticalNavToggleType}
                  onChange={(e) => onSave("verticalNavToggleType", e.target.value)}
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: ".875rem",
                      color: "text.secondary",
                    },
                  }}
                >
                  <FormControlLabel
                    value={"accordion"}
                    label={formatMessage("label.accordion", "Accordion")}
                    control={<Radio />}
                  />
                  <FormControlLabel
                    value={"collapse"}
                    label={formatMessage("label.collapse", "Collapse")}
                    control={<Radio />}
                  />
                </RadioGroup>
              </Box>
            )}
            {layout === "horizontal" ? null : (
              <Box
                sx={{
                  mb: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  <FormattedMessage id={"label.menu_collapsed"} defaultMessage={"Menu Collapsed"} />
                </Typography>
                <Switch checked={navCollapsed} onChange={(e) => onSave("navCollapsed", e.target.checked)} />
              </Box>
            )}
          </CustomizerSpacing>
        </ScrollBar>
      </Drawer>
    </div>
  );
};

export default Customizer;
