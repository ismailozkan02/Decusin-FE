import { useState } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from 'components/LoadingScreen';
import useAuth from 'hooks/useAuth';
import { AUTH } from 'routes/paths';

const AuthGuard = ({ children }) => {
  const { checked, me } = useAuth();
  const { pathname } = useLocation();
  const [requestedLocation, setRequestedLocation] = useState(null);

  if (!checked) {
    return <LoadingScreen/>;
  }

  if (!me) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }

    return (
      <Navigate to={`${AUTH.login}${pathname !== requestedLocation ? `?next=${pathname}` : ''}`}/>
    );
  }

  if (requestedLocation && (pathname !== requestedLocation)) {
    setRequestedLocation(null);

    return (
      <Navigate to={requestedLocation}/>
    );
  }

  return <>{children}</>;
};

AuthGuard.propTypes = {
  children: PropTypes.node
};

export default AuthGuard;
