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

export const materialModifierLabel = (material) =>
  material.modifier_type === "percent"
    ? `%${Math.round(Number(material.price_modifier || 0) * 100)}`
    : money(material.price_modifier);
