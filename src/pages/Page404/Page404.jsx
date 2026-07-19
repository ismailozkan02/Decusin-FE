import { Link as RouterLink } from "react-router-dom";
import { m } from "framer-motion";
import { FormattedMessage } from "react-intl";
import { styled } from "@mui/material/styles";
import { Box, Button, Container, Typography } from "@mui/material";
import { PageNotFoundIllustration } from "assets";
import { MotionContainer, varBounce } from "components/animate";
import Page from "components/Page";
import useLocale from "hooks/useLocale";

const RootStyle = styled("div")(({ theme }) => ({
  display: "flex",
  minHeight: "100vh",
  alignItems: "center",
  paddingTop: theme.spacing(10),
  paddingBottom: theme.spacing(10),
}));

const Page404 = () => {
  const { formatMessage } = useLocale();

  return (
    <Page
      noHeader
      title={formatMessage("nav.404", "Page Not Found")}
      sx={{ height: 1 }}
    >
      <RootStyle>
        <Container component={MotionContainer}>
          <Box sx={{ maxWidth: 480, margin: "auto", textAlign: "center" }}>
            <m.div>
              <Typography variant={"h3"} paragraph>
                <FormattedMessage
                  id={"label.page_not_found"}
                  defaultMessage={"Page not found!"}
                />
              </Typography>
            </m.div>
            <Typography sx={{ color: "text.secondary" }}>
              <FormattedMessage
                id={"message.page_not_found"}
                defaultMessage={
                  "We couldn’t find the page you’re looking for. Perhaps you’ve mistyped the URL? Be sure to check your spelling."
                }
              />
            </Typography>
            <m.div>
              <PageNotFoundIllustration
                sx={{ height: 260, my: { xs: 5, sm: 10 } }}
              />
            </m.div>
            <Button
              to={"/"}
              size={"large"}
              variant={"contained"}
              component={RouterLink}
            >
              <FormattedMessage
                id={"button.go_to_home"}
                defaultMessage={"Go To Overview"}
              />
            </Button>
          </Box>
        </Container>
      </RootStyle>
    </Page>
  );
};

export default Page404;
