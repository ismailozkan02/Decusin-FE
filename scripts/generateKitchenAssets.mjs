import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const modelDir = join(root, "public", "models", "kitchen");
const imageDir = join(root, "public", "images", "kitchen");

mkdirSync(modelDir, { recursive: true });
mkdirSync(imageDir, { recursive: true });

const colors = {
  shell: [0.84, 0.8, 0.72, 1],
  light: [0.96, 0.95, 0.91, 1],
  dark: [0.12, 0.16, 0.22, 1],
  oak: [0.62, 0.4, 0.2, 1],
  glass: [0.58, 0.72, 0.82, 0.45],
  metal: [0.7, 0.73, 0.76, 1],
  stone: [0.82, 0.82, 0.78, 1],
};

const materialNames = Object.keys(colors);
const faces = [
  [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]],
  [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]],
  [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]],
  [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]],
  [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]],
  [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]],
];

const box = ({ x = 0, y = 0, z = 0, w = 1, h = 1, d = 1, material = "shell" }) => {
  const positions = [];
  const indices = [];
  faces.forEach((face) => {
    const start = positions.length / 3;
    face.forEach(([px, py, pz]) => positions.push(x + px * w / 2, y + py * h / 2, z + pz * d / 2));
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  });
  return { positions, indices, material };
};

const align4 = (buffer) => {
  const pad = (4 - (buffer.length % 4)) % 4;
  return pad ? Buffer.concat([buffer, Buffer.alloc(pad)]) : buffer;
};

const bounds = (positions) => {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], positions[i + axis]);
      max[axis] = Math.max(max[axis], positions[i + axis]);
    }
  }
  return { min, max };
};

const writeModel = (name, boxes) => {
  const chunks = [];
  const bufferViews = [];
  const accessors = [];
  const primitives = [];
  let byteOffset = 0;

  boxes.forEach((item) => {
    const positionBuffer = align4(Buffer.from(new Float32Array(item.positions).buffer));
    const indexBuffer = align4(Buffer.from(new Uint16Array(item.indices).buffer));
    const positionView = bufferViews.length;
    const indexView = bufferViews.length + 1;
    const positionAccessor = accessors.length;
    const indexAccessor = accessors.length + 1;
    const boxBounds = bounds(item.positions);

    chunks.push(positionBuffer);
    bufferViews.push({ buffer: 0, byteOffset, byteLength: positionBuffer.length, target: 34962 });
    byteOffset += positionBuffer.length;
    chunks.push(indexBuffer);
    bufferViews.push({ buffer: 0, byteOffset, byteLength: indexBuffer.length, target: 34963 });
    byteOffset += indexBuffer.length;

    accessors.push({
      bufferView: positionView,
      componentType: 5126,
      count: item.positions.length / 3,
      type: "VEC3",
      min: boxBounds.min,
      max: boxBounds.max,
    });
    accessors.push({ bufferView: indexView, componentType: 5123, count: item.indices.length, type: "SCALAR" });
    primitives.push({
      attributes: { POSITION: positionAccessor },
      indices: indexAccessor,
      material: materialNames.indexOf(item.material),
    });
  });

  const binary = Buffer.concat(chunks);
  const gltf = {
    asset: { version: "2.0", generator: "Decusin procedural kitchen asset generator" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name, mesh: 0 }],
    meshes: [{ name, primitives }],
    materials: materialNames.map((materialName) => ({
      name: materialName,
      pbrMetallicRoughness: {
        baseColorFactor: colors[materialName],
        metallicFactor: materialName === "metal" ? 0.65 : 0,
        roughnessFactor: materialName === "glass" ? 0.18 : 0.58,
      },
      alphaMode: materialName === "glass" ? "BLEND" : "OPAQUE",
    })),
    buffers: [{ uri: `data:application/octet-stream;base64,${binary.toString("base64")}`, byteLength: binary.length }],
    bufferViews,
    accessors,
  };
  writeFileSync(join(modelDir, `${name}.gltf`), `${JSON.stringify(gltf, null, 2)}\n`);
};

const svg = (name, title, accent, body) => {
  writeFileSync(join(imageDir, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#edf5fd"/></linearGradient>
    <linearGradient id="face" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${accent}"/><stop offset="1" stop-color="#d9d2c7"/></linearGradient>
  </defs>
  <rect width="640" height="420" rx="26" fill="url(#bg)"/>
  <ellipse cx="320" cy="346" rx="230" ry="28" fill="#cbd5e1" opacity=".42"/>
  ${body}
</svg>\n`);
};

writeModel("base-cabinet-premium", [
  box({ y: 0.36, w: 1.2, h: 0.72, d: 0.52, material: "shell" }),
  box({ x: -0.31, y: 0.34, z: 0.272, w: 0.54, h: 0.58, d: 0.03, material: "light" }),
  box({ x: 0.31, y: 0.34, z: 0.272, w: 0.54, h: 0.58, d: 0.03, material: "light" }),
  box({ x: -0.07, y: 0.45, z: 0.295, w: 0.035, h: 0.18, d: 0.02, material: "metal" }),
  box({ x: 0.07, y: 0.45, z: 0.295, w: 0.035, h: 0.18, d: 0.02, material: "metal" }),
  box({ y: 0.74, z: 0.02, w: 1.28, h: 0.05, d: 0.58, material: "stone" }),
]);
writeModel("base-cabinet-drawer-premium", [
  box({ y: 0.36, w: 1.35, h: 0.72, d: 0.54, material: "shell" }),
  box({ y: 0.56, z: 0.292, w: 1.2, h: 0.22, d: 0.03, material: "light" }),
  box({ y: 0.31, z: 0.292, w: 1.2, h: 0.22, d: 0.03, material: "light" }),
  box({ y: 0.12, z: 0.292, w: 1.2, h: 0.15, d: 0.03, material: "light" }),
  box({ y: 0.56, z: 0.315, w: 0.5, h: 0.018, d: 0.02, material: "metal" }),
  box({ y: 0.31, z: 0.315, w: 0.5, h: 0.018, d: 0.02, material: "metal" }),
]);
writeModel("wall-cabinet-glass-premium", [
  box({ y: 0.36, w: 1.05, h: 0.72, d: 0.34, material: "shell" }),
  box({ x: -0.27, y: 0.36, z: 0.185, w: 0.45, h: 0.58, d: 0.025, material: "glass" }),
  box({ x: 0.27, y: 0.36, z: 0.185, w: 0.45, h: 0.58, d: 0.025, material: "glass" }),
  box({ y: 0.67, z: 0.2, w: 0.9, h: 0.025, d: 0.02, material: "metal" }),
]);
writeModel("tall-pantry-premium", [
  box({ y: 1.05, w: 0.72, h: 2.1, d: 0.56, material: "shell" }),
  box({ y: 1.55, z: 0.295, w: 0.62, h: 0.9, d: 0.03, material: "light" }),
  box({ y: 0.58, z: 0.295, w: 0.62, h: 0.9, d: 0.03, material: "light" }),
  box({ x: 0.24, y: 1.55, z: 0.32, w: 0.035, h: 0.42, d: 0.02, material: "metal" }),
]);
writeModel("island-cabinet-premium", [
  box({ y: 0.42, w: 1.8, h: 0.72, d: 0.9, material: "oak" }),
  box({ y: 0.8, w: 1.95, h: 0.08, d: 1, material: "stone" }),
  box({ x: -0.58, y: 0.38, z: 0.47, w: 0.46, h: 0.54, d: 0.03, material: "light" }),
  box({ y: 0.38, z: 0.47, w: 0.46, h: 0.54, d: 0.03, material: "light" }),
  box({ x: 0.58, y: 0.38, z: 0.47, w: 0.46, h: 0.54, d: 0.03, material: "light" }),
]);
writeModel("countertop-stone-premium", [
  box({ y: 0.03, w: 1.6, h: 0.06, d: 0.62, material: "stone" }),
  box({ y: 0.075, z: -0.22, w: 1.55, h: 0.018, d: 0.03, material: "metal" }),
]);
writeModel("open-shelf-premium", [
  box({ y: 0.04, w: 1.2, h: 0.08, d: 0.28, material: "oak" }),
  box({ x: -0.54, y: 0.22, w: 0.05, h: 0.36, d: 0.25, material: "metal" }),
  box({ x: 0.54, y: 0.22, w: 0.05, h: 0.36, d: 0.25, material: "metal" }),
]);
writeModel("sink-steel-premium", [
  box({ y: 0.08, w: 0.72, h: 0.08, d: 0.5, material: "metal" }),
  box({ y: 0.12, w: 0.52, h: 0.12, d: 0.34, material: "dark" }),
  box({ x: 0.24, y: 0.28, z: -0.08, w: 0.04, h: 0.34, d: 0.04, material: "metal" }),
]);

svg("base-cabinet-premium", "Premium alt dolap", "#f4efe7", '<path d="M126 330h380l38 34H88z" fill="#b7c2d1"/><rect x="140" y="92" width="360" height="230" rx="12" fill="url(#face)" stroke="#a9b4c4" stroke-width="6"/><rect x="166" y="126" width="145" height="162" rx="7" fill="#f8fafc" opacity=".7"/><rect x="330" y="126" width="145" height="162" rx="7" fill="#f8fafc" opacity=".7"/><rect x="294" y="150" width="9" height="66" rx="5" fill="#64748b"/><rect x="337" y="150" width="9" height="66" rx="5" fill="#64748b"/><rect x="132" y="82" width="376" height="28" rx="10" fill="#e7e5df"/>');
svg("base-cabinet-drawer-premium", "Cekmeceli alt dolap", "#f5f1ea", '<path d="M112 330h416l36 34H76z" fill="#b7c2d1"/><rect x="128" y="98" width="386" height="224" rx="12" fill="url(#face)" stroke="#a9b4c4" stroke-width="6"/><rect x="158" y="126" width="326" height="54" rx="7" fill="#f8fafc" opacity=".72"/><rect x="158" y="194" width="326" height="54" rx="7" fill="#f8fafc" opacity=".72"/><rect x="158" y="262" width="326" height="36" rx="7" fill="#f8fafc" opacity=".72"/><rect x="250" y="148" width="140" height="8" rx="4" fill="#64748b"/><rect x="250" y="216" width="140" height="8" rx="4" fill="#64748b"/>');
svg("wall-cabinet-glass-premium", "Camli ust dolap", "#eef4f8", '<path d="M156 330h328l30 30H126z" fill="#cbd5e1"/><rect x="160" y="82" width="320" height="250" rx="12" fill="url(#face)" stroke="#a8b5c5" stroke-width="6"/><rect x="190" y="116" width="112" height="176" rx="7" fill="#bfe3f7" opacity=".62" stroke="#7ba5bd" stroke-width="4"/><rect x="338" y="116" width="112" height="176" rx="7" fill="#bfe3f7" opacity=".62" stroke="#7ba5bd" stroke-width="4"/><rect x="224" y="304" width="190" height="9" rx="4" fill="#64748b"/>');
svg("tall-pantry-premium", "Boy dolabi", "#eee8dd", '<path d="M214 356h212l34 28H176z" fill="#cbd5e1"/><rect x="222" y="38" width="196" height="318" rx="12" fill="url(#face)" stroke="#a8b5c5" stroke-width="6"/><rect x="246" y="68" width="148" height="132" rx="7" fill="#f8fafc" opacity=".64"/><rect x="246" y="214" width="148" height="112" rx="7" fill="#f8fafc" opacity=".64"/><rect x="362" y="104" width="9" height="68" rx="5" fill="#64748b"/><rect x="362" y="238" width="9" height="56" rx="5" fill="#64748b"/>');
svg("island-cabinet-premium", "Ada modulu", "#c79a63", '<path d="M100 318h436l40 38H58z" fill="#b7c2d1"/><rect x="116" y="138" width="408" height="174" rx="16" fill="url(#face)" stroke="#9b6b38" stroke-width="6"/><rect x="88" y="104" width="464" height="44" rx="16" fill="#e5e7eb" stroke="#cbd5e1" stroke-width="5"/><rect x="150" y="174" width="94" height="96" rx="7" fill="#f8fafc" opacity=".42"/><rect x="273" y="174" width="94" height="96" rx="7" fill="#f8fafc" opacity=".42"/><rect x="396" y="174" width="94" height="96" rx="7" fill="#f8fafc" opacity=".42"/>');
svg("countertop-stone-premium", "Tas tezgah", "#e5e7eb", '<path d="M116 244h410l42 46H74z" fill="#cbd5e1"/><rect x="110" y="154" width="420" height="70" rx="18" fill="url(#face)" stroke="#aeb7c5" stroke-width="6"/><path d="M152 180c40-18 70 18 112 0s78-8 118 7 70-22 116-2" fill="none" stroke="#94a3b8" stroke-width="5" opacity=".45"/>');
svg("open-shelf-premium", "Acik raf", "#a86f38", '<path d="M128 308h384l34 32H92z" fill="#cbd5e1"/><rect x="138" y="166" width="364" height="42" rx="10" fill="url(#face)" stroke="#8b5a2b" stroke-width="6"/><rect x="166" y="206" width="26" height="112" rx="9" fill="#64748b"/><rect x="448" y="206" width="26" height="112" rx="9" fill="#64748b"/><rect x="188" y="154" width="48" height="12" rx="6" fill="#d6a36c"/><rect x="310" y="154" width="58" height="12" rx="6" fill="#d6a36c"/>');
svg("sink-steel-premium", "Celik evye", "#d7dee7", '<path d="M168 306h306l32 30H134z" fill="#cbd5e1"/><rect x="156" y="154" width="328" height="116" rx="28" fill="url(#face)" stroke="#94a3b8" stroke-width="8"/><rect x="224" y="180" width="184" height="66" rx="22" fill="#1f2937" opacity=".78"/><path d="M394 158c26-36 62-20 62 14" fill="none" stroke="#64748b" stroke-width="12" stroke-linecap="round"/>');
