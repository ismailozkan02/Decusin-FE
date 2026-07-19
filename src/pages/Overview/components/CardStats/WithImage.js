import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import CustomChip from "components/Chip";
import { Link } from "@mui/material";

const WithImage = ({ data }) => {
  // ** Vars
  const { title, chipColor, chipText, stats, trend, trendNumber } = data;

  return (
    <Card sx={{ height: "100%", overflow: "visible", position: "relative" }}>
      {/* silinecek */}
      <Link href="/videocall">
        <CardContent>
          <Typography sx={{ mb: 6.5, fontWeight: 600 }}>{title}</Typography>
          <Box sx={{ mb: 1.5, rowGap: 1, width: "55%", display: "flex", flexWrap: "wrap", alignItems: "flex-start" }}>
            <Typography variant="h5" sx={{ mr: 1.5 }}>
              {stats}
            </Typography>
            <Typography
              component="sup"
              variant="caption"
              sx={{ color: trend === "negative" ? "error.main" : "success.main" }}
            >
              {trendNumber}
            </Typography>
          </Box>
          <CustomChip
            size="small"
            skin="light"
            label={chipText}
            color={chipColor}
            sx={{ height: 20, fontWeight: 500, fontSize: "0.75rem", "& .MuiChip-label": { lineHeight: "1.25rem" } }}
          />
        </CardContent>{" "}
      </Link>
    </Card>
  );
};

WithImage.defaultProps = {
  trend: "positive",
  chipColor: "primary",
};

export default WithImage;
