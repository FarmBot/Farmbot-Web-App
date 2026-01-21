import { applyFixedNormalShader } from "../fixed_normal_material";

describe("applyFixedNormalShader()", () => {
  it("injects fixed normal once per shader", () => {
    const shader = { fragmentShader: "#include <normal_fragment_begin>" };
    const normalLine = "normal = vec3(0.0, 1.0, 0.0);";
    applyFixedNormalShader(shader);
    expect(shader.fragmentShader).toContain(normalLine);
    const updatedShader = shader.fragmentShader;
    applyFixedNormalShader(shader);
    expect(shader.fragmentShader).toEqual(updatedShader);
  });
});
