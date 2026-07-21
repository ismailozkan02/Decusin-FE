export const money = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const categoryLabel = (value) =>
  ({
    base_cabinet: "Alt dolap",
    wall_cabinet: "Ust dolap",
    countertop: "Tezgah",
    appliance: "Cihaz / aksesuar",
    shelf: "Ic raf",
  })[value] || value;

export const getProductSubcategory = (product) => {
  if (product?.subcategory) return product.subcategory;

  const id = `${product?.id || ""} ${product?.sku || ""} ${product?.name || ""}`
    .toLocaleLowerCase("tr-TR");

  if (product?.category === "base_cabinet") {
    if (id.includes("boy") || id.includes("tall")) return "tall_base";
    if (id.includes("ada") || id.includes("island")) return "island_base";
    if (id.includes("kose") || id.includes("köşe") || id.includes("corner"))
      return "corner_base";
    if (id.includes("klasik") || id.includes("classic")) return "classic_base";
    if (
      id.includes("cekmec") ||
      id.includes("drawer") ||
      id.includes("derin")
    )
      return "drawer_base";

    return "door_base";
  }

  if (product?.category === "wall_cabinet") {
    if (id.includes("kose") || id.includes("köşe") || id.includes("corner"))
      return "corner_wall";
    if (id.includes("lift")) return "lift_wall";
    if (id.includes("modul") || id.includes("modüler")) return "modular_wall";
    if (id.includes("klasik") || id.includes("classic")) return "classic_wall";
    if (id.includes("cam") || id.includes("glass")) return "glass_wall";

    return "door_wall";
  }

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
