import can from "utils/can";
import useAuth from "hooks/useAuth";

const CanViewNavLink = ({ children, navLink }) => {
  const { me } = useAuth();

  return can(me, navLink?.path, "read") && <>{children}</>;
};

export default CanViewNavLink;
