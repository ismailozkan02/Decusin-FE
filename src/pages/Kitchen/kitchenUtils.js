export const money = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const categoryLabel = (value) =>
  ({
    base_cabinet: "Alt dolap",
    wall_cabinet: "Üst dolap",
    countertop: "Tezgah",
    appliance: "Evye / cihaz",
    sink: "Lavabo / evye",
    cooktop: "Set üstü ocak",
    shelf: "Raf / boy modül",
    accessory: "Aksesuar",
  })[value] || value;

export const getProductSubcategory = (product) => {
  if (product?.subcategory) return product.subcategory;

  const id = `${product?.id || ""} ${product?.sku || ""} ${product?.name || ""}`
    .toLocaleLowerCase("tr-TR");

  if (product?.category === "base_cabinet") {
    if (id.includes("boy") || id.includes("tall")) return "tall_base";
    if (id.includes("ada") || id.includes("island")) return "island_base";
    if (id.includes("köşe") || id.includes("kose") || id.includes("corner"))
      return "corner_base";
    if (
      id.includes("cekmec") ||
      id.includes("drawer") ||
      id.includes("derin")
    )
      return "drawer_base";

    return "door_base";
  }

  if (product?.category === "wall_cabinet") {
    if (id.includes("köşe") || id.includes("kose") || id.includes("corner"))
      return "corner_wall";
    if (id.includes("lift") || id.includes("kulpsuz")) return "lift_wall";
    if (id.includes("cam") || id.includes("glass")) return "glass_wall";

    return "solid_wall";
  }

  if (product?.category === "sink") return "sink_modules";
  if (product?.category === "cooktop") return "cooktop_modules";
  if (product?.category === "countertop") return "countertop_modules";

  return "standard";
};

export const getSubcategoryLabel = (catalogGroups, product) => {
  const group = catalogGroups.find((item) => item.key === product?.category);
  const subcategory = group?.subcategories?.find(
    (item) => item.key === getProductSubcategory(product),
  );

  return subcategory?.title || null;
};

export const materialModifierLabel = (material) =>
  material.modifier_type === "percent"
    ? `%${Math.round(Number(material.price_modifier || 0) * 100)}`
    : money(material.price_modifier);

