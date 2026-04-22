import { instancedMeshKey } from "../instanced_mesh_key";
import { ThreeDGardenPlant } from "../plants";

describe("instancedMeshKey()", () => {
  const plant = (overrides: Partial<ThreeDGardenPlant> = {}): ThreeDGardenPlant => ({
    id: 1,
    label: "Spinach",
    icon: "/crops/icons/spinach.avif",
    size: 50,
    spread: 300,
    x: 100,
    y: 200,
    key: "",
    seed: 0,
    ...overrides,
  });

  it("changes when instance membership changes", () => {
    const before = instancedMeshKey([plant()]);
    const after = instancedMeshKey([
      plant({ id: undefined, x: 300, y: 400 }),
      plant(),
    ]);
    expect(after).not.toEqual(before);
  });

  it("changes when a plant moves", () => {
    const before = instancedMeshKey([plant()]);
    const after = instancedMeshKey([plant({ x: 101 })]);
    expect(after).not.toEqual(before);
  });
});
