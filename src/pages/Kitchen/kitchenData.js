export const TABS = {
  designer: 0,
  catalog: 1,
  pricing: 2,
  projects: 3,
  customers: 4,
};

export const fallbackTemplates = [
  { id: "template-linear-300", name: "Düz mutfak 300 cm", type: "linear" },
  { id: "template-l-360-240", name: "L mutfak 360 x 240 cm", type: "l_shape" },
  { id: "template-island-420", name: "Ada mutfak 420 cm", type: "island" },
];

export const fallbackCatalog = [
  {
    id: "product-001-door_base",
    sku: "ALT-KPK-01",
    name: "Alt dolap - Tek kapaklı 60 cm",
    category: "base_cabinet",
    subcategory: "door_base",
    dimensions: {
      width: 60,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 39,
      max_width: 108,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-09-walnut-marble-rounded-cabinet.png",
    model_url: "/models/kitchen/products/furnimesh/real-09-walnut-marble-rounded-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 4720
  },
  {
    id: "product-002-door_base",
    sku: "ALT-KPK-02",
    name: "Alt dolap - Çift kapaklı 80 cm",
    category: "base_cabinet",
    subcategory: "door_base",
    dimensions: {
      width: 80,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 52,
      max_width: 144,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-10-industrial-black-metal-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-10-industrial-black-metal-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 5240
  },
  {
    id: "product-003-door_base",
    sku: "ALT-KPK-03",
    name: "Alt dolap - 2 kapaklı geniş modül",
    category: "base_cabinet",
    subcategory: "door_base",
    dimensions: {
      width: 100,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 65,
      max_width: 180,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-11-traditional-dark-wood-cabinet.avif",
    model_url: "/models/kitchen/products/furnimesh/real-11-traditional-dark-wood-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 5760
  },
  {
    id: "product-004-door_base",
    sku: "ALT-KPK-04",
    name: "Alt dolap - Kulplu lake modül",
    category: "base_cabinet",
    subcategory: "door_base",
    dimensions: {
      width: 90,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-12-modern-fluted-wood-cabinet.png",
    model_url: "/models/kitchen/products/furnimesh/real-12-modern-fluted-wood-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 6280
  },
  {
    id: "product-005-door_base",
    sku: "ALT-KPK-05",
    name: "Alt dolap - Kulpsuz düz modül",
    category: "base_cabinet",
    subcategory: "door_base",
    dimensions: {
      width: 90,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-13-natural-rattan-woven-cabinet.png",
    model_url: "/models/kitchen/products/furnimesh/real-13-natural-rattan-woven-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 6800
  },
  {
    id: "product-006-drawer_base",
    sku: "ALT-CKM-01",
    name: "Alt dolap - 2 çekmeceli modül",
    category: "base_cabinet",
    subcategory: "drawer_base",
    dimensions: {
      width: 60,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 39,
      max_width: 108,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-14-modern-two-tone-cabinet.png",
    model_url: "/models/kitchen/products/furnimesh/real-14-modern-two-tone-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 7320
  },
  {
    id: "product-007-drawer_base",
    sku: "ALT-CKM-02",
    name: "Alt dolap - 3 çekmeceli modül",
    category: "base_cabinet",
    subcategory: "drawer_base",
    dimensions: {
      width: 80,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 52,
      max_width: 144,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-15-distressed-wood-bronze-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-15-distressed-wood-bronze-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 7840
  },
  {
    id: "product-008-drawer_base",
    sku: "ALT-CKM-03",
    name: "Alt dolap - Geniş çekmece modülü",
    category: "base_cabinet",
    subcategory: "drawer_base",
    dimensions: {
      width: 100,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 65,
      max_width: 180,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-16-rustic-sage-green-cabinet.png",
    model_url: "/models/kitchen/products/furnimesh/real-16-rustic-sage-green-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 8360
  },
  {
    id: "product-009-drawer_base",
    sku: "ALT-CKM-04",
    name: "Alt dolap - Derin tencere çekmecesi",
    category: "base_cabinet",
    subcategory: "drawer_base",
    dimensions: {
      width: 90,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-17-two-tone-laminate-cabinet.webp",
    model_url: "/models/kitchen/products/furnimesh/real-17-two-tone-laminate-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 8880
  },
  {
    id: "product-010-drawer_base",
    sku: "ALT-CKM-05",
    name: "Alt dolap - İç çekmeceli premium modül",
    category: "base_cabinet",
    subcategory: "drawer_base",
    dimensions: {
      width: 90,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-18-black-arched-wood-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-18-black-arched-wood-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 9400
  },
  {
    id: "product-011-corner_base",
    sku: "ALT-KOSE-01",
    name: "Köşe alt dolap - L modül",
    category: "base_cabinet",
    subcategory: "corner_base",
    dimensions: {
      width: 90,
      height: 72,
      depth: 90,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-19-arched-black-wood-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-19-arched-black-wood-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 9920
  },
  {
    id: "product-012-corner_base",
    sku: "ALT-KOSE-02",
    name: "Köşe alt dolap - Kör köşe modül",
    category: "base_cabinet",
    subcategory: "corner_base",
    dimensions: {
      width: 110,
      height: 72,
      depth: 65,
      unit: "cm"
    },
    constraints: {
      min_width: 72,
      max_width: 198,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-20-light-oak-modern-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-20-light-oak-modern-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 10440
  },
  {
    id: "product-013-corner_base",
    sku: "ALT-KOSE-03",
    name: "Köşe alt dolap - Karusel uyumlu",
    category: "base_cabinet",
    subcategory: "corner_base",
    dimensions: {
      width: 90,
      height: 72,
      depth: 90,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-21-rustic-dark-wood-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-21-rustic-dark-wood-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 10960
  },
  {
    id: "product-014-corner_base",
    sku: "ALT-KOSE-04",
    name: "Köşe alt dolap - Çift kapaklı",
    category: "base_cabinet",
    subcategory: "corner_base",
    dimensions: {
      width: 100,
      height: 72,
      depth: 80,
      unit: "cm"
    },
    constraints: {
      min_width: 65,
      max_width: 180,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-22-distressed-abstract-metallic-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-22-distressed-abstract-metallic-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 11480
  },
  {
    id: "product-015-corner_base",
    sku: "ALT-KOSE-05",
    name: "Köşe alt dolap - Tezgah altı köşe",
    category: "base_cabinet",
    subcategory: "corner_base",
    dimensions: {
      width: 95,
      height: 72,
      depth: 95,
      unit: "cm"
    },
    constraints: {
      min_width: 62,
      max_width: 171,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-23-modern-walnut-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-23-modern-walnut-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 12000
  },
  {
    id: "product-016-glass_base",
    sku: "ALT-CAM-01",
    name: "Alt dolap - Cam vitrin kapaklı",
    category: "base_cabinet",
    subcategory: "glass_base",
    dimensions: {
      width: 80,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 52,
      max_width: 144,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-24-washed-wood-cabinet.png",
    model_url: "/models/kitchen/products/furnimesh/real-24-washed-wood-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 12520
  },
  {
    id: "product-017-glass_base",
    sku: "ALT-CAM-02",
    name: "Alt dolap - Füme cam kapaklı",
    category: "base_cabinet",
    subcategory: "glass_base",
    dimensions: {
      width: 90,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-25-modern-white-spiral-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-25-modern-white-spiral-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 13040
  },
  {
    id: "product-018-glass_base",
    sku: "ALT-CAM-03",
    name: "Alt dolap - Alüminyum cam çerçeveli",
    category: "base_cabinet",
    subcategory: "glass_base",
    dimensions: {
      width: 100,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 65,
      max_width: 180,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-26-black-metal-office-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-26-black-metal-office-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 13560
  },
  {
    id: "product-019-glass_base",
    sku: "ALT-CAM-04",
    name: "Alt dolap - Dar cam kapaklı",
    category: "base_cabinet",
    subcategory: "glass_base",
    dimensions: {
      width: 60,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 39,
      max_width: 108,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-27-cream-gold-contemporary-cabinet.png",
    model_url: "/models/kitchen/products/furnimesh/real-27-cream-gold-contemporary-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 14080
  },
  {
    id: "product-020-glass_base",
    sku: "ALT-CAM-05",
    name: "Alt dolap - Çift cam kapaklı",
    category: "base_cabinet",
    subcategory: "glass_base",
    dimensions: {
      width: 120,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 78,
      max_width: 216,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-28-wavy-dark-wood-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-28-wavy-dark-wood-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 14600
  },
  {
    id: "product-021-handleless_base",
    sku: "ALT-LIFT-01",
    name: "Alt dolap - Bas-aç kulpsuz modül",
    category: "base_cabinet",
    subcategory: "handleless_base",
    dimensions: {
      width: 80,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 52,
      max_width: 144,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-29-organic-sculptural-cabinet.png",
    model_url: "/models/kitchen/products/furnimesh/real-29-organic-sculptural-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 15120
  },
  {
    id: "product-022-handleless_base",
    sku: "ALT-LIFT-02",
    name: "Alt dolap - Mat lake kulpsuz",
    category: "base_cabinet",
    subcategory: "handleless_base",
    dimensions: {
      width: 90,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-30-dark-wood-woven-cabinet.png",
    model_url: "/models/kitchen/products/furnimesh/real-30-dark-wood-woven-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 15640
  },
  {
    id: "product-023-handleless_base",
    sku: "ALT-LIFT-03",
    name: "Alt dolap - Profil kulplu modern",
    category: "base_cabinet",
    subcategory: "handleless_base",
    dimensions: {
      width: 100,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 65,
      max_width: 180,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-31-antique-wood-amp-glass-cabinet.png",
    model_url: "/models/kitchen/products/furnimesh/real-31-antique-wood-amp-glass-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 16160
  },
  {
    id: "product-024-handleless_base",
    sku: "ALT-LIFT-04",
    name: "Alt dolap - Yatay kapak çizgili",
    category: "base_cabinet",
    subcategory: "handleless_base",
    dimensions: {
      width: 120,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 78,
      max_width: 216,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-32-modern-fluted-black-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-32-modern-fluted-black-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 16680
  },
  {
    id: "product-025-handleless_base",
    sku: "ALT-LIFT-05",
    name: "Alt dolap - Minimal düz panel",
    category: "base_cabinet",
    subcategory: "handleless_base",
    dimensions: {
      width: 80,
      height: 72,
      depth: 56,
      unit: "cm"
    },
    constraints: {
      min_width: 52,
      max_width: 144,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/furnimesh/real-33-patterned-fabric-wood-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-33-patterned-fabric-wood-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 17200
  },
  {
    id: "product-026-tall_base",
    sku: "ALT-BOY-01",
    name: "Alt dolap - Boy kiler modülü",
    category: "base_cabinet",
    subcategory: "tall_base",
    dimensions: {
      width: 60,
      height: 210,
      depth: 58,
      unit: "cm"
    },
    constraints: {
      min_width: 39,
      max_width: 108,
      min_height: 137,
      max_height: 357
    },
    image_url: "/images/kitchen/products/furnimesh/real-34-utilitarian-silver-metal-cabinet.png",
    model_url: "/models/kitchen/products/furnimesh/real-34-utilitarian-silver-metal-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 17720
  },
  {
    id: "product-027-tall_base",
    sku: "ALT-BOY-02",
    name: "Alt dolap - Fırın boy modülü",
    category: "base_cabinet",
    subcategory: "tall_base",
    dimensions: {
      width: 60,
      height: 210,
      depth: 58,
      unit: "cm"
    },
    constraints: {
      min_width: 39,
      max_width: 108,
      min_height: 137,
      max_height: 357
    },
    image_url: "/images/kitchen/products/furnimesh/real-35-shagreen-brass-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-35-shagreen-brass-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 18240
  },
  {
    id: "product-028-tall_base",
    sku: "ALT-BOY-03",
    name: "Alt dolap - Buzdolabı yanı kolon",
    category: "base_cabinet",
    subcategory: "tall_base",
    dimensions: {
      width: 45,
      height: 210,
      depth: 58,
      unit: "cm"
    },
    constraints: {
      min_width: 30,
      max_width: 81,
      min_height: 137,
      max_height: 357
    },
    image_url: "/images/kitchen/products/furnimesh/real-36-traditional-dark-wood-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-36-traditional-dark-wood-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 18760
  },
  {
    id: "product-029-tall_base",
    sku: "ALT-BOY-04",
    name: "Alt dolap - Camlı boy kolon",
    category: "base_cabinet",
    subcategory: "tall_base",
    dimensions: {
      width: 60,
      height: 210,
      depth: 45,
      unit: "cm"
    },
    constraints: {
      min_width: 39,
      max_width: 108,
      min_height: 137,
      max_height: 357
    },
    image_url: "/images/kitchen/products/furnimesh/real-37-organic-wavy-wood-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-37-organic-wavy-wood-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 19280
  },
  {
    id: "product-030-tall_base",
    sku: "ALT-BOY-05",
    name: "Alt dolap - Kulpsuz boy kolon",
    category: "base_cabinet",
    subcategory: "tall_base",
    dimensions: {
      width: 60,
      height: 220,
      depth: 58,
      unit: "cm"
    },
    constraints: {
      min_width: 39,
      max_width: 108,
      min_height: 143,
      max_height: 374
    },
    image_url: "/images/kitchen/products/furnimesh/real-38-industrial-distressed-wood-cabinet.jpg",
    model_url: "/models/kitchen/products/furnimesh/real-38-industrial-distressed-wood-cabinet.glb",
    source: "FurniMesh tekil alt dolap modeli",
    base_price: 19800
  },
  {
    id: "product-031-solid_wall",
    sku: "UST-KPK-01",
    name: "Üst dolap - Tek kapaklı 60 cm",
    category: "wall_cabinet",
    subcategory: "solid_wall",
    dimensions: {
      width: 60,
      height: 72,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 39,
      max_width: 108,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-11-wall-frame-36x15.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 20320
  },
  {
    id: "product-032-solid_wall",
    sku: "UST-KPK-02",
    name: "Üst dolap - Çift kapaklı 80 cm",
    category: "wall_cabinet",
    subcategory: "solid_wall",
    dimensions: {
      width: 80,
      height: 72,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 52,
      max_width: 144,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-12-corner-ringhult-26x20.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 20840
  },
  {
    id: "product-033-solid_wall",
    sku: "UST-KPK-03",
    name: "Üst dolap - Geniş kapaklı 100 cm",
    category: "wall_cabinet",
    subcategory: "solid_wall",
    dimensions: {
      width: 100,
      height: 72,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 65,
      max_width: 180,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-13-corner-enkoeping-26x20.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 21360
  },
  {
    id: "product-034-solid_wall",
    sku: "UST-KPK-04",
    name: "Üst dolap - Dar kapaklı 45 cm",
    category: "wall_cabinet",
    subcategory: "solid_wall",
    dimensions: {
      width: 45,
      height: 72,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 30,
      max_width: 81,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-14-corner-bodbyn-26x20.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 21880
  },
  {
    id: "product-035-solid_wall",
    sku: "UST-KPK-05",
    name: "Üst dolap - Yüksek kapaklı 90 cm",
    category: "wall_cabinet",
    subcategory: "solid_wall",
    dimensions: {
      width: 90,
      height: 90,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 59,
      max_height: 153
    },
    image_url: "/images/kitchen/products/upper-wall/upper-15-corner-shelves-ringhult-26x30.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 22400
  },
  {
    id: "product-036-glass_wall",
    sku: "UST-CAM-01",
    name: "Camlı üst dolap - Şeffaf cam",
    category: "wall_cabinet",
    subcategory: "glass_wall",
    dimensions: {
      width: 60,
      height: 72,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 39,
      max_width: 108,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-16-corner-axstad-white-36x20.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 22920
  },
  {
    id: "product-037-glass_wall",
    sku: "UST-CAM-02",
    name: "Camlı üst dolap - Füme cam",
    category: "wall_cabinet",
    subcategory: "glass_wall",
    dimensions: {
      width: 80,
      height: 72,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 52,
      max_width: 144,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-17-corner-glass-lerhyttan.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 23440
  },
  {
    id: "product-038-glass_wall",
    sku: "UST-CAM-03",
    name: "Camlı üst dolap - Çift cam kapak",
    category: "wall_cabinet",
    subcategory: "glass_wall",
    dimensions: {
      width: 100,
      height: 72,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 65,
      max_width: 180,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-18-wall-voxtorp-18x15.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 23960
  },
  {
    id: "product-039-glass_wall",
    sku: "UST-CAM-04",
    name: "Camlı üst dolap - Vitrin modülü",
    category: "wall_cabinet",
    subcategory: "glass_wall",
    dimensions: {
      width: 60,
      height: 90,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 39,
      max_width: 108,
      min_height: 59,
      max_height: 153
    },
    image_url: "/images/kitchen/products/upper-wall/upper-19-wall-vallstena-18x30.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 24480
  },
  {
    id: "product-040-glass_wall",
    sku: "UST-CAM-05",
    name: "Camlı üst dolap - Alüminyum çerçeve",
    category: "wall_cabinet",
    subcategory: "glass_wall",
    dimensions: {
      width: 90,
      height: 72,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-20-corner-havstorp-26x30.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 25000
  },
  {
    id: "product-041-lift_wall",
    sku: "UST-LIFT-01",
    name: "Lift üst dolap - Yatay kapak",
    category: "wall_cabinet",
    subcategory: "lift_wall",
    dimensions: {
      width: 90,
      height: 45,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 30,
      max_height: 77
    },
    image_url: "/images/kitchen/products/upper-wall/upper-01-wall-frame-21x40.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 25520
  },
  {
    id: "product-042-lift_wall",
    sku: "UST-LIFT-02",
    name: "Lift üst dolap - Aventos kapak",
    category: "wall_cabinet",
    subcategory: "lift_wall",
    dimensions: {
      width: 100,
      height: 45,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 65,
      max_width: 180,
      min_height: 30,
      max_height: 77
    },
    image_url: "/images/kitchen/products/upper-wall/upper-02-wall-frame-36x40.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 26040
  },
  {
    id: "product-043-lift_wall",
    sku: "UST-LIFT-03",
    name: "Kulpsuz üst dolap - Düz kapak",
    category: "wall_cabinet",
    subcategory: "lift_wall",
    dimensions: {
      width: 80,
      height: 72,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 52,
      max_width: 144,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-03-wall-veddinge-15x20.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 26560
  },
  {
    id: "product-044-lift_wall",
    sku: "UST-LIFT-04",
    name: "Kulpsuz üst dolap - Mat lake",
    category: "wall_cabinet",
    subcategory: "lift_wall",
    dimensions: {
      width: 90,
      height: 72,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 59,
      max_width: 162,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-04-wall-ringhult-15x20.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 27080
  },
  {
    id: "product-045-lift_wall",
    sku: "UST-LIFT-05",
    name: "Üst dolap - Bas-aç mekanizmalı",
    category: "wall_cabinet",
    subcategory: "lift_wall",
    dimensions: {
      width: 70,
      height: 72,
      depth: 34,
      unit: "cm"
    },
    constraints: {
      min_width: 46,
      max_width: 126,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-05-wall-ringhult-21x30.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 27600
  },
  {
    id: "product-046-corner_wall",
    sku: "UST-KOSE-01",
    name: "Köşe üst dolap - Tek kapaklı",
    category: "wall_cabinet",
    subcategory: "corner_wall",
    dimensions: {
      width: 65,
      height: 72,
      depth: 65,
      unit: "cm"
    },
    constraints: {
      min_width: 42,
      max_width: 117,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-06-wall-ringhult-15x30.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 28120
  },
  {
    id: "product-047-corner_wall",
    sku: "UST-KOSE-02",
    name: "Köşe üst dolap - Cam kapaklı",
    category: "wall_cabinet",
    subcategory: "corner_wall",
    dimensions: {
      width: 65,
      height: 72,
      depth: 65,
      unit: "cm"
    },
    constraints: {
      min_width: 42,
      max_width: 117,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-07-wall-veddinge-18x40.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 28640
  },
  {
    id: "product-048-corner_wall",
    sku: "UST-KOSE-03",
    name: "Köşe üst dolap - Raflı modül",
    category: "wall_cabinet",
    subcategory: "corner_wall",
    dimensions: {
      width: 80,
      height: 72,
      depth: 65,
      unit: "cm"
    },
    constraints: {
      min_width: 52,
      max_width: 144,
      min_height: 47,
      max_height: 122
    },
    image_url: "/images/kitchen/products/upper-wall/upper-08-wall-frame-30x20.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 29160
  },
  {
    id: "product-049-corner_wall",
    sku: "UST-KOSE-04",
    name: "Köşe üst dolap - Lift kapaklı",
    category: "wall_cabinet",
    subcategory: "corner_wall",
    dimensions: {
      width: 80,
      height: 60,
      depth: 65,
      unit: "cm"
    },
    constraints: {
      min_width: 52,
      max_width: 144,
      min_height: 39,
      max_height: 102
    },
    image_url: "/images/kitchen/products/upper-wall/upper-09-corner-frame-26x40.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 29680
  },
  {
    id: "product-050-corner_wall",
    sku: "UST-KOSE-05",
    name: "Köşe üst dolap - Yüksek modül",
    category: "wall_cabinet",
    subcategory: "corner_wall",
    dimensions: {
      width: 80,
      height: 90,
      depth: 65,
      unit: "cm"
    },
    constraints: {
      min_width: 52,
      max_width: 144,
      min_height: 59,
      max_height: 153
    },
    image_url: "/images/kitchen/products/upper-wall/upper-10-wall-nickebo-anthracite.jpg",
    source: "IKEA SEKTION upper wall cabinet image",
    base_price: 30200
  }
];

export const fallbackMaterials = [
  {
    id: "mat-door-lake-white",
    code: "LAKE-WHITE",
    name: "Beyaz lake kapak",
    type: "door",
    color_hex: "#F8FAFC",
    preview_model_url: "/models/kitchen/products/furnimesh/real-09-walnut-marble-rounded-cabinet.glb",
    price_modifier: 0.18,
    modifier_type: "percent",
  },
  {
    id: "mat-door-wood-oak",
    code: "WOOD-OAK",
    name: "Meşe kapak",
    type: "door",
    color_hex: "#B6814A",
    price_modifier: 0.12,
    modifier_type: "percent",
  },
  {
    id: "mat-door-anthracite",
    code: "MAT-ANT",
    name: "Antrasit mat kapak",
    type: "door",
    color_hex: "#374151",
    price_modifier: 0.1,
    modifier_type: "percent",
  },
  {
    id: "mat-door-sage",
    code: "SAGE-GREEN",
    name: "Ada çayı yeşili kapak",
    type: "door",
    color_hex: "#8FAF9B",
    price_modifier: 0.14,
    modifier_type: "percent",
  },
  {
    id: "mat-door-navy",
    code: "NAVY-SATIN",
    name: "Lacivert saten kapak",
    type: "door",
    color_hex: "#1E3A5F",
    price_modifier: 0.16,
    modifier_type: "percent",
  },
  {
    id: "mat-glass-smoked",
    code: "GLASS-SMOKE",
    name: "Füme cam",
    type: "glass",
    color_hex: "#6B7280",
    preview_model_url: "/models/kitchen/products/furnimesh/real-23-modern-walnut-cabinet.glb",
    price_modifier: 900,
    modifier_type: "fixed",
  },
  {
    id: "mat-glass-clear",
    code: "GLASS-CLEAR",
    name: "Seffaf cam",
    type: "glass",
    color_hex: "#BAE6FD",
    price_modifier: 650,
    modifier_type: "fixed",
  },
  {
    id: "mat-glass-fluted",
    code: "GLASS-FLUTED",
    name: "Fitilli cam",
    type: "glass",
    color_hex: "#CBD5E1",
    price_modifier: 1200,
    modifier_type: "fixed",
  },
  {
    id: "mat-counter-quartz",
    code: "QUARTZ",
    name: "Kuvars tezgah",
    type: "countertop",
    color_hex: "#E5E7EB",
    preview_model_url: "/models/kitchen/products/furnimesh/real-09-walnut-marble-rounded-cabinet.glb",
    price_modifier: 0.32,
    modifier_type: "percent",
  },
  {
    id: "mat-counter-wood",
    code: "WOOD-TOP",
    name: "Ahsap tezgah",
    type: "countertop",
    color_hex: "#9A6A3A",
    price_modifier: 0.18,
    modifier_type: "percent",
  },
  {
    id: "mat-counter-black",
    code: "BLACK-GRANITE",
    name: "Siyah granit tezgah",
    type: "countertop",
    color_hex: "#111827",
    price_modifier: 0.42,
    modifier_type: "percent",
  },
];

export const templateScenes = {
  "template-linear-300": [
    {
      catalog_item_id: "product-001-door_base",
      position: { x: 130, y: 320, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-lake-white" },
      quantity: 1,
    },
    {
      catalog_item_id: "product-001-door_base",
      position: { x: 200, y: 320, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-lake-white" },
      quantity: 1,
    },
    {
      catalog_item_id: "product-021-glass_wall",
      position: { x: 145, y: 140, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 80, height: 72, depth: 34, unit: "cm" },
      options: {
        door_material_id: "mat-door-lake-white",
        glass_material_id: "mat-glass-smoked",
      },
      quantity: 1,
    },
  ],
  "template-l-360-240": [
    {
      catalog_item_id: "product-001-door_base",
      position: { x: 120, y: 320, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-lake-white" },
      quantity: 1,
    },
    {
      catalog_item_id: "product-001-door_base",
      position: { x: 188, y: 320, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-lake-white" },
      quantity: 1,
    },
    {
      catalog_item_id: "product-021-glass_wall",
      position: { x: 130, y: 140, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 80, height: 72, depth: 34, unit: "cm" },
      options: {
        door_material_id: "mat-door-lake-white",
        glass_material_id: "mat-glass-smoked",
      },
      quantity: 1,
    },
    {
      catalog_item_id: "product-021-glass_wall",
      position: { x: 300, y: 220, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 80, height: 72, depth: 34, unit: "cm" },
      options: {
        door_material_id: "mat-door-wood-oak",
        glass_material_id: "mat-glass-smoked",
      },
      quantity: 1,
    },
  ],
  "template-island-420": [
    {
      catalog_item_id: "product-001-door_base",
      position: { x: 150, y: 305, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 80, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-wood-oak" },
      quantity: 1,
    },
    {
      catalog_item_id: "product-001-door_base",
      position: { x: 245, y: 305, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 80, height: 72, depth: 56, unit: "cm" },
      options: { door_material_id: "mat-door-wood-oak" },
      quantity: 1,
    },
    {
      catalog_item_id: "product-031-stone_counter",
      position: { x: 135, y: 280, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 210, height: 16, depth: 80, unit: "cm" },
      options: { countertop_material_id: "mat-counter-quartz" },
      quantity: 1,
    },
    {
      catalog_item_id: "product-041-sink_appliance",
      position: { x: 390, y: 265, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 45, depth: 45, unit: "cm" },
      options: {},
      quantity: 1,
    },
  ],
};

export const catalogGroups = [
  {
    key: "base_cabinet",
    title: "Alt Dolaplar",
    subcategories: [
      {
        key: "door_base",
        title: "Kapaklı Alt Dolaplar"
      },
      {
        key: "drawer_base",
        title: "Çekmeceli Alt Dolaplar"
      },
      {
        key: "corner_base",
        title: "Köşe Alt Dolaplar"
      },
      {
        key: "glass_base",
        title: "Camlı Alt Dolaplar"
      },
      {
        key: "handleless_base",
        title: "Kulpsuz Alt Dolaplar"
      },
      {
        key: "tall_base",
        title: "Boy Alt Dolaplar"
      }
    ]
  },
  {
    key: "wall_cabinet",
    title: "Üst Dolaplar",
    subcategories: [
      {
        key: "solid_wall",
        title: "Kapaklı Üst Dolaplar"
      },
      {
        key: "glass_wall",
        title: "Camlı Üst Dolaplar"
      },
      {
        key: "lift_wall",
        title: "Lift / Kulpsuz Üst Dolaplar"
      },
      {
        key: "corner_wall",
        title: "Köşe Üst Dolaplar"
      }
    ]
  }
];
