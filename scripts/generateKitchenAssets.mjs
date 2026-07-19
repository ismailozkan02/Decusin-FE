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
writeModel("wall-cabinet-left-premium", [
  box({ y: 0.36, w: 0.72, h: 0.72, d: 0.34, material: "shell" }),
  box({ x: -0.02, y: 0.36, z: 0.185, w: 0.58, h: 0.6, d: 0.025, material: "light" }),
  box({ x: 0.2, y: 0.38, z: 0.205, w: 0.035, h: 0.22, d: 0.02, material: "metal" }),
]);
writeModel("wall-cabinet-right-premium", [
  box({ y: 0.36, w: 0.72, h: 0.72, d: 0.34, material: "shell" }),
  box({ x: 0.02, y: 0.36, z: 0.185, w: 0.58, h: 0.6, d: 0.025, material: "light" }),
  box({ x: -0.2, y: 0.38, z: 0.205, w: 0.035, h: 0.22, d: 0.02, material: "metal" }),
]);
writeModel("wall-cabinet-long-premium", [
  box({ y: 0.36, w: 1.55, h: 0.72, d: 0.34, material: "shell" }),
  box({ y: 0.52, z: 0.185, w: 1.36, h: 0.2, d: 0.025, material: "light" }),
  box({ y: 0.28, z: 0.185, w: 1.36, h: 0.2, d: 0.025, material: "light" }),
  box({ y: 0.52, z: 0.205, w: 0.52, h: 0.018, d: 0.02, material: "metal" }),
  box({ y: 0.28, z: 0.205, w: 0.52, h: 0.018, d: 0.02, material: "metal" }),
]);
writeModel("wall-cabinet-corner-premium", [
  box({ x: -0.18, y: 0.36, w: 0.66, h: 0.72, d: 0.34, material: "shell" }),
  box({ x: 0.16, y: 0.36, z: 0.18, w: 0.34, h: 0.72, d: 0.68, material: "shell" }),
  box({ x: -0.19, y: 0.36, z: 0.185, w: 0.48, h: 0.58, d: 0.025, material: "light" }),
  box({ x: 0.34, y: 0.36, z: 0.02, w: 0.025, h: 0.58, d: 0.46, material: "light" }),
]);
writeModel("wall-shelf-hooks-premium", [
  box({ y: 0.42, w: 1.1, h: 0.08, d: 0.26, material: "oak" }),
  box({ x: -0.48, y: 0.22, w: 0.05, h: 0.36, d: 0.24, material: "metal" }),
  box({ x: 0.48, y: 0.22, w: 0.05, h: 0.36, d: 0.24, material: "metal" }),
  box({ x: -0.28, y: 0.1, z: 0.12, w: 0.035, h: 0.16, d: 0.03, material: "metal" }),
  box({ y: 0.1, z: 0.12, w: 0.035, h: 0.16, d: 0.03, material: "metal" }),
  box({ x: 0.28, y: 0.1, z: 0.12, w: 0.035, h: 0.16, d: 0.03, material: "metal" }),
]);
writeModel("wall-shelf-corner-premium", [
  box({ x: -0.2, y: 0.2, w: 0.76, h: 0.08, d: 0.26, material: "oak" }),
  box({ x: 0.16, y: 0.2, z: 0.22, w: 0.26, h: 0.08, d: 0.76, material: "oak" }),
  box({ x: -0.5, y: 0.42, w: 0.05, h: 0.36, d: 0.22, material: "metal" }),
  box({ x: 0.34, y: 0.42, z: 0.5, w: 0.22, h: 0.36, d: 0.05, material: "metal" }),
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
writeModel("countertop-long-slab-premium", [
  box({ y: 0.04, w: 2.8, h: 0.08, d: 0.64, material: "stone" }),
  box({ y: 0.095, z: -0.27, w: 2.72, h: 0.02, d: 0.03, material: "metal" }),
  box({ y: 0.095, z: 0.27, w: 2.72, h: 0.02, d: 0.03, material: "metal" }),
]);
writeModel("countertop-l-slab-premium", [
  box({ x: 0.18, y: 0.04, w: 2.2, h: 0.08, d: 0.64, material: "stone" }),
  box({ x: -0.76, y: 0.04, z: 0.54, w: 0.64, h: 0.08, d: 1.42, material: "stone" }),
  box({ x: 0.18, y: 0.095, z: -0.27, w: 2.1, h: 0.02, d: 0.03, material: "metal" }),
  box({ x: -0.45, y: 0.095, z: 1.12, w: 0.03, h: 0.02, d: 0.7, material: "metal" }),
]);
writeModel("countertop-sink-cut-premium", [
  box({ y: 0.04, w: 1.8, h: 0.08, d: 0.66, material: "stone" }),
  box({ y: 0.095, z: 0.02, w: 0.62, h: 0.035, d: 0.38, material: "metal" }),
  box({ y: 0.125, z: 0.02, w: 0.46, h: 0.045, d: 0.26, material: "dark" }),
  box({ x: 0.42, y: 0.24, z: -0.1, w: 0.035, h: 0.28, d: 0.035, material: "metal" }),
  box({ x: 0.33, y: 0.34, z: -0.1, w: 0.18, h: 0.035, d: 0.035, material: "metal" }),
]);
writeModel("cooktop-black-premium", [
  box({ y: 0.035, w: 0.68, h: 0.05, d: 0.48, material: "dark" }),
  box({ x: -0.18, y: 0.07, z: -0.12, w: 0.16, h: 0.018, d: 0.16, material: "metal" }),
  box({ x: 0.18, y: 0.07, z: -0.12, w: 0.16, h: 0.018, d: 0.16, material: "metal" }),
  box({ x: -0.18, y: 0.07, z: 0.12, w: 0.16, h: 0.018, d: 0.16, material: "metal" }),
  box({ x: 0.18, y: 0.07, z: 0.12, w: 0.16, h: 0.018, d: 0.16, material: "metal" }),
]);
writeModel("faucet-chrome-premium", [
  box({ y: 0.04, w: 0.18, h: 0.08, d: 0.14, material: "metal" }),
  box({ y: 0.26, w: 0.045, h: 0.38, d: 0.045, material: "metal" }),
  box({ x: 0.11, y: 0.44, w: 0.24, h: 0.045, d: 0.045, material: "metal" }),
  box({ x: 0.23, y: 0.34, w: 0.045, h: 0.18, d: 0.045, material: "metal" }),
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
writeModel("kitchen-layout-linear-premium", [
  box({ y: 1.25, z: -0.35, w: 3.4, h: 2.5, d: 0.08, material: "light" }),
  box({ y: -0.03, z: 0.7, w: 3.4, h: 0.06, d: 1.9, material: "stone" }),
  box({ x: -1.05, y: 0.36, w: 0.92, h: 0.72, d: 0.56, material: "shell" }),
  box({ x: 0, y: 0.36, w: 0.92, h: 0.72, d: 0.56, material: "shell" }),
  box({ x: 1.05, y: 0.36, w: 0.92, h: 0.72, d: 0.56, material: "shell" }),
  box({ x: -1.05, y: 0.73, w: 0.98, h: 0.06, d: 0.62, material: "stone" }),
  box({ x: 0, y: 0.73, w: 0.98, h: 0.06, d: 0.62, material: "stone" }),
  box({ x: 1.05, y: 0.73, w: 0.98, h: 0.06, d: 0.62, material: "stone" }),
  box({ x: -0.7, y: 1.45, z: 0.02, w: 0.86, h: 0.56, d: 0.32, material: "light" }),
  box({ x: 0.35, y: 1.45, z: 0.02, w: 0.86, h: 0.56, d: 0.32, material: "light" }),
  box({ x: 1.2, y: 0.24, z: 0.31, w: 0.48, h: 0.08, d: 0.34, material: "metal" }),
]);
writeModel("kitchen-layout-l-premium", [
  box({ y: 1.25, z: -0.4, w: 3.3, h: 2.5, d: 0.08, material: "light" }),
  box({ x: -1.62, y: 1.25, z: 0.62, w: 0.08, h: 2.5, d: 2.1, material: "light" }),
  box({ x: -1.05, y: 0.36, w: 0.9, h: 0.72, d: 0.56, material: "shell" }),
  box({ x: 0, y: 0.36, w: 0.9, h: 0.72, d: 0.56, material: "shell" }),
  box({ x: 1.05, y: 0.36, w: 0.9, h: 0.72, d: 0.56, material: "shell" }),
  box({ x: -1.45, y: 0.36, z: 0.55, w: 0.5, h: 0.72, d: 0.82, material: "shell" }),
  box({ y: 0.76, w: 3.0, h: 0.06, d: 0.62, material: "stone" }),
  box({ x: -1.46, y: 0.76, z: 0.58, w: 0.58, h: 0.06, d: 1.48, material: "stone" }),
  box({ x: -0.62, y: 1.46, z: 0.01, w: 0.84, h: 0.56, d: 0.32, material: "glass" }),
  box({ x: 0.42, y: 1.46, z: 0.01, w: 0.84, h: 0.56, d: 0.32, material: "light" }),
]);
writeModel("kitchen-layout-island-premium", [
  box({ y: 1.25, z: -0.45, w: 3.6, h: 2.5, d: 0.08, material: "light" }),
  box({ y: -0.03, z: 0.85, w: 3.8, h: 0.06, d: 2.2, material: "stone" }),
  box({ x: -0.95, y: 0.36, w: 0.86, h: 0.72, d: 0.56, material: "shell" }),
  box({ x: 0, y: 0.36, w: 0.86, h: 0.72, d: 0.56, material: "shell" }),
  box({ x: 0.95, y: 0.36, w: 0.86, h: 0.72, d: 0.56, material: "shell" }),
  box({ x: 0, y: 0.42, z: 1.1, w: 1.75, h: 0.72, d: 0.82, material: "oak" }),
  box({ x: 0, y: 0.8, z: 1.1, w: 1.9, h: 0.08, d: 0.95, material: "stone" }),
  box({ x: -0.52, y: 1.45, z: 0.02, w: 0.86, h: 0.56, d: 0.32, material: "light" }),
  box({ x: 0.52, y: 1.45, z: 0.02, w: 0.86, h: 0.56, d: 0.32, material: "light" }),
  box({ x: 1.3, y: 1.05, z: -0.05, w: 0.54, h: 1.55, d: 0.48, material: "metal" }),
]);

svg("base-cabinet-premium", "Premium alt dolap", "#f4efe7", '<path d="M126 330h380l38 34H88z" fill="#b7c2d1"/><rect x="140" y="92" width="360" height="230" rx="12" fill="url(#face)" stroke="#a9b4c4" stroke-width="6"/><rect x="166" y="126" width="145" height="162" rx="7" fill="#f8fafc" opacity=".7"/><rect x="330" y="126" width="145" height="162" rx="7" fill="#f8fafc" opacity=".7"/><rect x="294" y="150" width="9" height="66" rx="5" fill="#64748b"/><rect x="337" y="150" width="9" height="66" rx="5" fill="#64748b"/><rect x="132" y="82" width="376" height="28" rx="10" fill="#e7e5df"/>');
svg("base-cabinet-drawer-premium", "Cekmeceli alt dolap", "#f5f1ea", '<path d="M112 330h416l36 34H76z" fill="#b7c2d1"/><rect x="128" y="98" width="386" height="224" rx="12" fill="url(#face)" stroke="#a9b4c4" stroke-width="6"/><rect x="158" y="126" width="326" height="54" rx="7" fill="#f8fafc" opacity=".72"/><rect x="158" y="194" width="326" height="54" rx="7" fill="#f8fafc" opacity=".72"/><rect x="158" y="262" width="326" height="36" rx="7" fill="#f8fafc" opacity=".72"/><rect x="250" y="148" width="140" height="8" rx="4" fill="#64748b"/><rect x="250" y="216" width="140" height="8" rx="4" fill="#64748b"/>');
svg("wall-cabinet-glass-premium", "Camli ust dolap", "#eef4f8", '<path d="M156 330h328l30 30H126z" fill="#cbd5e1"/><rect x="160" y="82" width="320" height="250" rx="12" fill="url(#face)" stroke="#a8b5c5" stroke-width="6"/><rect x="190" y="116" width="112" height="176" rx="7" fill="#bfe3f7" opacity=".62" stroke="#7ba5bd" stroke-width="4"/><rect x="338" y="116" width="112" height="176" rx="7" fill="#bfe3f7" opacity=".62" stroke="#7ba5bd" stroke-width="4"/><rect x="224" y="304" width="190" height="9" rx="4" fill="#64748b"/>');
svg("wall-cabinet-left-premium", "Sol tek kapak ust dolap", "#f3f0ea", '<path d="M208 330h224l28 28H180z" fill="#cbd5e1"/><rect x="218" y="84" width="204" height="244" rx="12" fill="url(#face)" stroke="#a8b5c5" stroke-width="6"/><rect x="250" y="118" width="136" height="174" rx="7" fill="#f8fafc" opacity=".72"/><rect x="352" y="164" width="10" height="72" rx="5" fill="#64748b"/>');
svg("wall-cabinet-right-premium", "Sag tek kapak ust dolap", "#f3f0ea", '<path d="M208 330h224l28 28H180z" fill="#cbd5e1"/><rect x="218" y="84" width="204" height="244" rx="12" fill="url(#face)" stroke="#a8b5c5" stroke-width="6"/><rect x="250" y="118" width="136" height="174" rx="7" fill="#f8fafc" opacity=".72"/><rect x="278" y="164" width="10" height="72" rx="5" fill="#64748b"/>');
svg("wall-cabinet-long-premium", "Uzun ust dolap", "#f3f0ea", '<path d="M118 330h404l34 30H84z" fill="#cbd5e1"/><rect x="126" y="98" width="388" height="224" rx="12" fill="url(#face)" stroke="#a8b5c5" stroke-width="6"/><rect x="160" y="132" width="320" height="56" rx="8" fill="#f8fafc" opacity=".72"/><rect x="160" y="212" width="320" height="56" rx="8" fill="#f8fafc" opacity=".72"/><rect x="250" y="154" width="140" height="8" rx="4" fill="#64748b"/><rect x="250" y="234" width="140" height="8" rx="4" fill="#64748b"/>');
svg("wall-cabinet-corner-premium", "Kose ust dolap", "#ede7dc", '<path d="M172 330h316l34 30H138z" fill="#cbd5e1"/><path d="M176 98h240l54 54v170H176z" fill="url(#face)" stroke="#a8b5c5" stroke-width="6"/><rect x="210" y="132" width="124" height="156" rx="7" fill="#f8fafc" opacity=".68"/><path d="M350 132h74l24 24v132h-98z" fill="#e7dfd2" stroke="#c0ab91" stroke-width="4"/>');
svg("wall-shelf-hooks-premium", "Kancali acik ust raf", "#b37b43", '<path d="M132 324h376l34 28H98z" fill="#cbd5e1"/><rect x="148" y="132" width="344" height="42" rx="10" fill="url(#face)" stroke="#8b5a2b" stroke-width="6"/><rect x="180" y="174" width="22" height="112" rx="8" fill="#64748b"/><rect x="438" y="174" width="22" height="112" rx="8" fill="#64748b"/><path d="M236 190v62m84-62v62m84-62v62" stroke="#64748b" stroke-width="10" stroke-linecap="round"/>');
svg("wall-shelf-corner-premium", "Kose acik ust raf", "#b37b43", '<path d="M164 324h312l34 28H130z" fill="#cbd5e1"/><path d="M172 154h250l58 58v42H230l-58-58z" fill="url(#face)" stroke="#8b5a2b" stroke-width="6"/><rect x="190" y="246" width="24" height="80" rx="8" fill="#64748b"/><rect x="420" y="246" width="24" height="80" rx="8" fill="#64748b"/>');
svg("tall-pantry-premium", "Boy dolabi", "#eee8dd", '<path d="M214 356h212l34 28H176z" fill="#cbd5e1"/><rect x="222" y="38" width="196" height="318" rx="12" fill="url(#face)" stroke="#a8b5c5" stroke-width="6"/><rect x="246" y="68" width="148" height="132" rx="7" fill="#f8fafc" opacity=".64"/><rect x="246" y="214" width="148" height="112" rx="7" fill="#f8fafc" opacity=".64"/><rect x="362" y="104" width="9" height="68" rx="5" fill="#64748b"/><rect x="362" y="238" width="9" height="56" rx="5" fill="#64748b"/>');
svg("island-cabinet-premium", "Ada modulu", "#c79a63", '<path d="M100 318h436l40 38H58z" fill="#b7c2d1"/><rect x="116" y="138" width="408" height="174" rx="16" fill="url(#face)" stroke="#9b6b38" stroke-width="6"/><rect x="88" y="104" width="464" height="44" rx="16" fill="#e5e7eb" stroke="#cbd5e1" stroke-width="5"/><rect x="150" y="174" width="94" height="96" rx="7" fill="#f8fafc" opacity=".42"/><rect x="273" y="174" width="94" height="96" rx="7" fill="#f8fafc" opacity=".42"/><rect x="396" y="174" width="94" height="96" rx="7" fill="#f8fafc" opacity=".42"/>');
svg("countertop-stone-premium", "Tas tezgah", "#e5e7eb", '<path d="M116 244h410l42 46H74z" fill="#cbd5e1"/><rect x="110" y="154" width="420" height="70" rx="18" fill="url(#face)" stroke="#aeb7c5" stroke-width="6"/><path d="M152 180c40-18 70 18 112 0s78-8 118 7 70-22 116-2" fill="none" stroke="#94a3b8" stroke-width="5" opacity=".45"/>');
svg("countertop-long-slab-premium", "Uzun duz tezgah", "#e8e8e3", '<path d="M76 246h488l42 46H34z" fill="#cbd5e1"/><rect x="74" y="150" width="492" height="74" rx="18" fill="url(#face)" stroke="#aeb7c5" stroke-width="6"/><path d="M122 178c54-22 92 18 148 0s108-9 164 8 82-20 116-4" fill="none" stroke="#94a3b8" stroke-width="5" opacity=".45"/><rect x="104" y="222" width="432" height="12" rx="6" fill="#94a3b8" opacity=".38"/>');
svg("countertop-l-slab-premium", "L tezgah", "#e8e8e3", '<path d="M96 298h430l42 44H54z" fill="#cbd5e1"/><path d="M100 126h382v70H220v132h-92V196h-28z" fill="url(#face)" stroke="#aeb7c5" stroke-width="6" stroke-linejoin="round"/><path d="M142 154c45-16 72 15 122 0s92-6 135 7" fill="none" stroke="#94a3b8" stroke-width="5" opacity=".42"/><path d="M158 218c22 28-16 46 0 82" fill="none" stroke="#94a3b8" stroke-width="5" opacity=".42"/>');
svg("countertop-sink-cut-premium", "Evyeli tezgah", "#e7e7e0", '<path d="M96 264h448l42 42H54z" fill="#cbd5e1"/><rect x="94" y="138" width="452" height="90" rx="18" fill="url(#face)" stroke="#aeb7c5" stroke-width="6"/><rect x="250" y="158" width="142" height="48" rx="18" fill="#cbd5e1" stroke="#64748b" stroke-width="5"/><rect x="282" y="170" width="80" height="26" rx="10" fill="#1f2937" opacity=".7"/><path d="M404 150c26-32 58-16 58 16" fill="none" stroke="#64748b" stroke-width="10" stroke-linecap="round"/>');
svg("cooktop-black-premium", "Ankastre ocak", "#111827", '<path d="M174 296h292l32 32H142z" fill="#cbd5e1"/><rect x="166" y="130" width="308" height="154" rx="22" fill="url(#face)" stroke="#020617" stroke-width="8"/><circle cx="250" cy="184" r="34" fill="none" stroke="#94a3b8" stroke-width="10"/><circle cx="390" cy="184" r="34" fill="none" stroke="#94a3b8" stroke-width="10"/><circle cx="250" cy="242" r="22" fill="none" stroke="#94a3b8" stroke-width="8"/><circle cx="390" cy="242" r="22" fill="none" stroke="#94a3b8" stroke-width="8"/>');
svg("faucet-chrome-premium", "Batarya", "#d7dee7", '<ellipse cx="320" cy="326" rx="112" ry="22" fill="#cbd5e1" opacity=".55"/><rect x="292" y="240" width="56" height="52" rx="16" fill="url(#face)" stroke="#94a3b8" stroke-width="6"/><path d="M320 244V116c0-44 62-48 84-12 10 16 8 40-8 54" fill="none" stroke="#64748b" stroke-width="22" stroke-linecap="round"/><path d="M394 158h58" stroke="#64748b" stroke-width="22" stroke-linecap="round"/><path d="M450 158v38" stroke="#64748b" stroke-width="16" stroke-linecap="round"/>');
svg("open-shelf-premium", "Acik raf", "#a86f38", '<path d="M128 308h384l34 32H92z" fill="#cbd5e1"/><rect x="138" y="166" width="364" height="42" rx="10" fill="url(#face)" stroke="#8b5a2b" stroke-width="6"/><rect x="166" y="206" width="26" height="112" rx="9" fill="#64748b"/><rect x="448" y="206" width="26" height="112" rx="9" fill="#64748b"/><rect x="188" y="154" width="48" height="12" rx="6" fill="#d6a36c"/><rect x="310" y="154" width="58" height="12" rx="6" fill="#d6a36c"/>');
svg("sink-steel-premium", "Celik evye", "#d7dee7", '<path d="M168 306h306l32 30H134z" fill="#cbd5e1"/><rect x="156" y="154" width="328" height="116" rx="28" fill="url(#face)" stroke="#94a3b8" stroke-width="8"/><rect x="224" y="180" width="184" height="66" rx="22" fill="#1f2937" opacity=".78"/><path d="M394 158c26-36 62-20 62 14" fill="none" stroke="#64748b" stroke-width="12" stroke-linecap="round"/>');
svg("kitchen-layout-linear-premium", "Duz mutfak modeli", "#f2eee8", '<rect x="92" y="58" width="456" height="238" rx="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="6"/><rect x="120" y="224" width="112" height="82" rx="8" fill="url(#face)" stroke="#a8b5c5" stroke-width="5"/><rect x="246" y="224" width="112" height="82" rx="8" fill="url(#face)" stroke="#a8b5c5" stroke-width="5"/><rect x="372" y="224" width="112" height="82" rx="8" fill="url(#face)" stroke="#a8b5c5" stroke-width="5"/><rect x="106" y="204" width="394" height="22" rx="8" fill="#d7dde5"/><rect x="178" y="118" width="106" height="68" rx="8" fill="#eef4f8" stroke="#a8b5c5" stroke-width="5"/><rect x="310" y="118" width="106" height="68" rx="8" fill="#eef4f8" stroke="#a8b5c5" stroke-width="5"/>');
svg("kitchen-layout-l-premium", "L mutfak modeli", "#f2eee8", '<rect x="88" y="58" width="430" height="238" rx="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="6"/><rect x="88" y="58" width="86" height="286" rx="18" fill="#edf5fd" stroke="#cbd5e1" stroke-width="6"/><rect x="150" y="224" width="106" height="82" rx="8" fill="url(#face)" stroke="#a8b5c5" stroke-width="5"/><rect x="270" y="224" width="106" height="82" rx="8" fill="url(#face)" stroke="#a8b5c5" stroke-width="5"/><rect x="390" y="224" width="106" height="82" rx="8" fill="url(#face)" stroke="#a8b5c5" stroke-width="5"/><rect x="104" y="220" width="70" height="110" rx="8" fill="#d8d1c6" stroke="#a8b5c5" stroke-width="5"/><rect x="168" y="124" width="112" height="66" rx="8" fill="#bfe3f7" opacity=".75"/><rect x="302" y="124" width="112" height="66" rx="8" fill="#eef4f8"/>');
svg("kitchen-layout-island-premium", "Ada mutfak modeli", "#dfb37c", '<rect x="88" y="58" width="464" height="230" rx="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="6"/><rect x="138" y="220" width="104" height="78" rx="8" fill="#f2eee8" stroke="#a8b5c5" stroke-width="5"/><rect x="268" y="220" width="104" height="78" rx="8" fill="#f2eee8" stroke="#a8b5c5" stroke-width="5"/><rect x="398" y="220" width="104" height="78" rx="8" fill="#f2eee8" stroke="#a8b5c5" stroke-width="5"/><rect x="184" y="318" width="272" height="58" rx="16" fill="url(#face)" stroke="#9b6b38" stroke-width="6"/><rect x="166" y="300" width="308" height="26" rx="12" fill="#e5e7eb" stroke="#cbd5e1" stroke-width="5"/><rect x="196" y="124" width="100" height="66" rx="8" fill="#eef4f8"/><rect x="336" y="124" width="100" height="66" rx="8" fill="#eef4f8"/><rect x="470" y="92" width="46" height="138" rx="8" fill="#cbd5e1"/>');
