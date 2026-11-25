import { BufferAttribute, BufferGeometry, MeshStandardMaterial } from "three";

// The shipped tool meshes are in meters. These are the top lettering depths.
const TOP_LETTER_FLOOR_MM = {
  rotaryTool: -0.5,
  seedBin: undefined,
  seedTray: 12,
  seeder: 14.5,
  soilSensor: 14.5,
  wateringNozzle: -5.5,
  weeder: 2.5,
};

type LetteredTool = keyof typeof TOP_LETTER_FLOOR_MM;
type LetteredPart = LetteredTool | "utm";

const LETTER_SHADE = 100;
const ALL_OTHER_SURFACES = 255;
const FRONT_OF_UTM = Math.cos(55 * Math.PI / 180);
const CENTERED_TOOL: [number, number] = [0, 0];
const TOOL_CENTERS_MM: Partial<Record<LetteredTool, [number, number]>> = {
  wateringNozzle: [10.825, 6.25],
  weeder: [-25, 20],
};

const isUtmLogo = (x: number, y: number, z: number) => {
  // The logo is recessed into the side of the cylinder centered at (0, 12.5).
  const dy = y - 12.5;
  const radius = Math.hypot(x, dy);
  const front = -(Math.sqrt(3) * x + dy) / 2;
  return radius > 34.35 && radius < 34.7 && front > radius * FRONT_OF_UTM
    && z > -12 && z < 14.5;
};

const isToolLetter = (tool: LetteredTool, x: number, y: number, z: number) => {
  const height = TOP_LETTER_FLOOR_MM[tool];
  if (height !== undefined && Math.abs(z - height) < 0.03) { return true; }
  // The tool names are cut 1 mm into the 35 mm radius housings.
  const [centerX, centerY] = TOOL_CENTERS_MM[tool] ?? CENTERED_TOOL;
  return Math.abs(Math.hypot(x - centerX, y - centerY) - 34) < 0.08;
};

export const letteredToolGeometry = (
  geometry: BufferGeometry | undefined,
  part: LetteredPart,
  material?: MeshStandardMaterial,
) => {
  const position = geometry?.getAttribute("position");
  if (!geometry || !position) { return geometry; }
  if (!geometry.hasAttribute("color")) {
    // The asset cache shares this attribute between garden and panel instances.
    const colors = new Uint8Array(position.count * 3);
    for (let index = 0; index < position.count; index++) {
      const x = position.getX(index) * 1000;
      const y = position.getY(index) * 1000;
      const z = position.getZ(index) * 1000;
      const letter = part == "utm"
        ? isUtmLogo(x, y, z)
        : isToolLetter(part, x, y, z);
      const shade = letter ? LETTER_SHADE : ALL_OTHER_SURFACES;
      colors.fill(shade, index * 3, index * 3 + 3);
    }
    geometry.setAttribute("color", new BufferAttribute(colors, 3, true));
  }
  if (material && !material.vertexColors) {
    material.vertexColors = true;
    material.needsUpdate = true;
  }
  return geometry;
};
