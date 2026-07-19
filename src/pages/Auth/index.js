import Page from "components/Page";
import useLocale from "hooks/useLocale";
import Login from "./Login";

const Index = () => {
  const { formatMessage } = useLocale();

  return (
    <Page noHeader title={formatMessage("Login", "Login")}>
      <Login />
    </Page>
  );
};

export default Index;
