import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { Alert, AlertTitle, Container, Typography } from "@mui/material";
import useAuth from "hooks/useAuth";
import can from "utils/can";

const PermissionBasedGuard = ({ path, permissions, children }) => {
  const { me } = useAuth();

  if (!can(me, path, permissions)) {
    return (
      <Container>
        <Alert severity={"error"}>
          <AlertTitle>
            <FormattedMessage
              id={"permissionDenied"}
              defaultMessage={"Permission Denied"}
            />
          </AlertTitle>
          <Typography>
            <FormattedMessage
              id={"notAuthorized"}
              defaultMessage={"You do not have permission to access this page"}
            />
          </Typography>
        </Alert>
      </Container>
    );
  }

  return <>{children}</>;
};

PermissionBasedGuard.propTypes = {
  path: PropTypes.string,
  permissions: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]), // Example 'read' or ['read', 'create']
  children: PropTypes.node,
};

export default PermissionBasedGuard;
