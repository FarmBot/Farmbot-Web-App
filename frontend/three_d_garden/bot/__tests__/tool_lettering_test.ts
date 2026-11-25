import { BufferGeometry, Float32BufferAttribute, MeshStandardMaterial } from "three";
import { letteredToolGeometry } from "../tool_lettering";

const geometryWithPositions = (positions: number[]) =>
  new BufferGeometry().setAttribute("position",
    new Float32BufferAttribute(positions.map(value => value / 1000), 3));

describe("letteredToolGeometry()", () => {
  it.each([
    ["rotaryTool", -0.5],
    ["seedTray", 12],
    ["seeder", 14.5],
    ["soilSensor", 14.5],
    ["wateringNozzle", -5.5],
    ["weeder", 2.5],
  ] as const)("darkens the recessed %s lettering", (part, depth) => {
    const geometry = geometryWithPositions([2, 3, depth, 2, 3, depth + 0.5]);
    letteredToolGeometry(geometry, part);
    const colors = geometry.getAttribute("color");
    expect(colors.normalized).toBe(true);
    expect([colors.getX(0), colors.getY(0), colors.getZ(0)])
      .toEqual([100 / 255, 100 / 255, 100 / 255]);
    expect([colors.getX(1), colors.getY(1), colors.getZ(1)]).toEqual([1, 1, 1]);
  });

  it.each([
    ["seedBin", 0, 0],
    ["wateringNozzle", 10.825, 6.25],
    ["weeder", -25, 20],
  ] as const)("darkens %s lettering cut into the curved side", (part, x, y) => {
    const geometry = geometryWithPositions([x + 34, y, 5, x + 35, y, 5]);
    letteredToolGeometry(geometry, part);
    expect(Array.from(geometry.getAttribute("color").array))
      .toEqual([100, 100, 100, 255, 255, 255]);
  });

  it("darkens the UTM logo and reuses the colors across material variants", () => {
    const geometry = geometryWithPositions([
      -34.5, 12.5, 1,
      -35, 12.5, 1,
      -34.2, 12.5, 1,
      34.5, 12.5, 1,
      -34.5, 12.5, 17,
      -34.5, 12.5, -15,
    ]);
    const position = geometry.getAttribute("position");
    const material = new MeshStandardMaterial({ color: "#ccc" });
    expect(letteredToolGeometry(geometry, "utm", material)).toBe(geometry);
    const colors = geometry.getAttribute("color");
    expect(Array.from(colors.array)).toEqual([
      100, 100, 100, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255,
    ]);
    expect(geometry.getAttribute("position")).toBe(position);
    expect(material.vertexColors).toBe(true);
    expect(material.color.getHexString()).toBe("cccccc");
    const version = material.version;
    letteredToolGeometry(geometry, "utm", material);
    expect(material.version).toBe(version);
    const darkBody = new MeshStandardMaterial({ color: "#333" });
    letteredToolGeometry(geometry, "utm", darkBody);
    expect(darkBody.vertexColors).toBe(true);
    expect(geometry.getAttribute("color")).toBe(colors);
  });

  it("uses geometry without positions as supplied", () => {
    const geometry = new BufferGeometry();
    const material = new MeshStandardMaterial();
    expect(letteredToolGeometry(undefined, "utm", material)).toBeUndefined();
    expect(letteredToolGeometry(geometry, "utm", material)).toBe(geometry);
    expect(material.vertexColors).toBe(false);
  });
});
