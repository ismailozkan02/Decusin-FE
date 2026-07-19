import MuiChip from "@mui/material/Chip";
import useBgColor from "hooks/useBgColor";

const Chip = (props) => {
  const { sx, skin, color, size, icon } = props;
  const bgColors = useBgColor();

  const colors = {
    primary: { ...bgColors.primaryLight },
    secondary: { ...bgColors.secondaryLight },
    success: { ...bgColors.successLight },
    error: { ...bgColors.errorLight },
    warning: { ...bgColors.warningLight },
    info: { ...bgColors.infoLight },
    custom: { ...bgColors.customLight },
  };

  return (
    <MuiChip
      icon={icon}
      size={size}
      {...props}
      variant="filled"
      {...(skin === "light" && { className: "MuiChip-light" })}
      sx={skin === "light" && color ? Object.assign(colors[color], sx) : sx}
    />
  );
};

export default Chip;
