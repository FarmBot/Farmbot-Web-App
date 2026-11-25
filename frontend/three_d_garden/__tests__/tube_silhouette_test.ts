import {
  CatmullRomCurve3, LineBasicMaterial, LineCurve3, TubeGeometry, Vector3,
} from "three";
import {
  configureTubeSilhouette, createTubeSilhouette,
} from "../tube_silhouette";

const path = () => new LineCurve3(new Vector3(), new Vector3(0, 0, 60));

describe("tube silhouettes", () => {
  it("uses only two side edges per segment and the open rims from the side", () => {
    const lines = createTubeSilhouette([new TubeGeometry(path(), 3, 4, 8)]);
    const positions = lines.getAttribute("position");
    const midpoints = lines.getAttribute("edgeMidpoint");
    const first = lines.getAttribute("firstNormal");
    const second = lines.getAttribute("secondNormal");
    const view = new Vector3(2, 3, 0);
    const firstNormal = new Vector3();
    const secondNormal = new Vector3();
    let rims = 0;
    let outline = 0;
    let internal = 0;
    for (let i = 0; i < positions.count; i += 2) {
      firstNormal.fromBufferAttribute(first, i);
      secondNormal.fromBufferAttribute(second, i);
      expect(midpoints.getX(i)).toBeCloseTo(
        (positions.getX(i) + positions.getX(i + 1)) / 2);
      if (secondNormal.lengthSq() == 0) {
        rims++;
      } else if ((firstNormal.dot(view) >= 0) != (secondNormal.dot(view) >= 0)) {
        expect(positions.getX(i)).toBeCloseTo(positions.getX(i + 1));
        expect(positions.getY(i)).toBeCloseTo(positions.getY(i + 1));
        outline++;
      } else {
        internal++;
      }
    }
    expect(rims).toBe(16);
    expect(outline).toBe(6);
    expect(internal).toBeGreaterThan(0);
  });

  it("welds both seams of a closed tube", () => {
    const loop = new CatmullRomCurve3([
      new Vector3(50, 0, 0), new Vector3(0, 50, 0),
      new Vector3(-50, 0, 0), new Vector3(0, -50, 0),
    ], true);
    const lines = createTubeSilhouette([new TubeGeometry(loop, 20, 2, 8, true)]);
    const normals = lines.getAttribute("secondNormal");
    expect(normals.count).toBeGreaterThan(0);
    const normal = new Vector3();
    for (let i = 0; i < normals.count; i += 2) {
      expect(normal.fromBufferAttribute(normals, i).lengthSq()).toBeCloseTo(1);
    }
  });

  it("omits missing or collapsed faces", () => {
    const unindexed = new TubeGeometry(path(), 2, 3, 8);
    // eslint-disable-next-line no-null/no-null
    unindexed.setIndex(null);
    const collapsed = new TubeGeometry(path(), 2, 0, 8);
    const lines = createTubeSilhouette([unindexed, collapsed]);
    expect(lines.getAttribute("position").count).toBe(0);
  });

  it("configures view-dependent culling on the line shader", () => {
    const material = new LineBasicMaterial();
    configureTubeSilhouette(material);
    type Args = Parameters<typeof material.onBeforeCompile>;
    const shader = {
      uniforms: {},
      vertexShader: "#include <common>\n#include <project_vertex>",
      fragmentShader: "",
    } as Args[0];
    material.onBeforeCompile(shader, {} as Args[1]);
    expect(shader.vertexShader).toContain("projectionMatrix[2][3] == 0.0");
    expect(shader.vertexShader).toContain("firstFacesEye == secondFacesEye");
    expect(shader.vertexShader).toContain("gl_Position = vec4(0.0, 0.0, 2.0, 1.0);");
  });
});
