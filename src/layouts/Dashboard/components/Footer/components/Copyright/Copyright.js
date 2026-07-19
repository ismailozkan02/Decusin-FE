import { useCallback, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { FormattedMessage } from "react-intl";
import { Box, Link, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { APP } from "config";
import useSettings from "hooks/useSettings";
import { DASHBOARD } from "routes/paths";
import useDialog from "hooks/useDialog";

const Copyright = () => {
  const { dispatch, getServerTimestamp, timestamp } = useSettings();
  const [now, setNow] = useState(timestamp);
  const hidden = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const { showAlert } = useDialog();

  useEffect(() => {
    document.addEventListener("visibilitychange", setTimestamp);

    const timer = setInterval(() => {
      setNow((state) => DateTime.fromMillis(state).plus({ seconds: 1 }).toMillis());
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);

      document.removeEventListener("visibilitychange", setTimestamp);
    };
  }, []);

  const setTimestamp = useCallback((e) => {
    // console.log(e);
    if (!e.currentTarget.hidden) {
      getServerTimestamp()
        .then(({ timestamp }) => {
          dispatch({
            action: "SET_TIMESTAMP",
            payload: timestamp,
          });
        })
        .catch(() => null);
    }
  }, []);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
      <Typography sx={{ mr: 2 }}>
        {`© 2022, Made with `}
        <Box component="span" sx={{ color: "error.main" }}>
          ❤️
        </Box>
        {` by `}
        <Link href={APP.FOOTER.LINK || "https://mysoly.com"} target={"_blank"}>
          {APP.FOOTER.TITLE || "MySoly"}
        </Link>
      </Typography>
      {!hidden && (
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", "& :not(:last-child)": { mr: 4 } }}>
          <Link href={"/PrivacyPolicy"}>
            <FormattedMessage id={"PrivacyPolicy"} defaultMessage={"Privacy Policy"} />
          </Link>
          <Link href={DASHBOARD.documentation} target={"_blank"}>
            <FormattedMessage id={"nav.documentation"} defaultMessage={"Documentation"} />
          </Link>
          <Link href={DASHBOARD.support} target={"_blank"}>
            <FormattedMessage id={"nav.support"} defaultMessage={"Support"} />
          </Link>
          <Typography color={"primary.main"}>
            {DateTime.fromMillis(now).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Copyright;
