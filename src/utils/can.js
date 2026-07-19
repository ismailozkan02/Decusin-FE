export default function can(me, path, permissions) {
  if (!path) return false;
  if (!me) return false;
  if (me.role === "root" || me.role === "admin") return true;
  if (Array.isArray(me.permissions) && me.permissions.includes("*")) return true;

  // console.log("path", path);
  path = path.replace(/^[/]+|[/]$/, "");
  // console.log("path 2", path);

  const page =
    Array.isArray(me?.permissions) &&
    me.permissions.find(
      (permission) => String(permission.name).toLocaleLowerCase() === String(path).toLocaleLowerCase()
    );
  // console.log("page", page);

  if (!Array.isArray(permissions)) {
    permissions = [permissions];
  }

  let granted = false;

  if (page && Array.isArray(page.list)) {
    for (const permission of permissions) {
      if (!granted) {
        const grant = page.list.find((item) => item.name === permission);

        if (grant) {
          granted = grant.granted;
        }
      }
    }
  }

  return granted;
}
