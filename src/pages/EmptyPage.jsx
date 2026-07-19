import { Box } from "@mui/material";
import Page from "components/Page";

const EmptyPage = () => (
  <Page noHeader title="">
    <Box sx={{ minHeight: 280 }} />
  </Page>
);

export default EmptyPage;
