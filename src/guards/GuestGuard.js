import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import { DASHBOARD } from 'routes/paths';

const GuestGuard = ({ children }) => {
  const { me } = useAuth();

  if (me) {
    return <Navigate to={DASHBOARD.root}/>;
  }

  return <>{children}</>;
};

GuestGuard.propTypes = {
  children: PropTypes.node
};

export default GuestGuard;
