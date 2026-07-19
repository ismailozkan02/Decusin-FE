import useAuth from "hooks/useAuth";
import can from "utils/can";

const CanViewNavGroup = ({ children, navGroup }) => {
  const { me } = useAuth();
  const canViewMenuGroup = (item) => {
    if (item?.public) return true;

    if (!Array.isArray(item.children)) {
      return can(me, item?.path, "read");
    }

    const hasAnyVisibleChild = item.children.some((child) => {
      if (Array.isArray(child.children)) {
        return canViewMenuGroup(child);
      }

      if (child?.public) return true;

      return can(me, child.path, "read");
    });

    if (!item.path) {
      return hasAnyVisibleChild;
    }

    return can(me, item?.path, "read") && hasAnyVisibleChild;
  };

  return navGroup && canViewMenuGroup(navGroup) ? <>{children}</> : null;
};

export default CanViewNavGroup;
