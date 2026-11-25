import { range } from "lodash";
import {
  BufferAttribute, BufferGeometry, DynamicDrawUsage, TubeGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { perfCount } from "../../../performance/perf";
import { easyCubicBezierCurve3 } from "../../helpers";
import { mergedTubeParts } from "../../tube_silhouette";

const jetCount = 16;

const buildJet = (index: number, nozzleRadius: number, soilDistance: number) => {
  const angle = (index * Math.PI * 2) / jetCount;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const path = easyCubicBezierCurve3(
    [nozzleRadius * sin, nozzleRadius * cos, 0],
    [10 * sin, 0, -10],
    [0, 0, 10],
    [25 * sin, 25 * cos, soilDistance],
  );
  return new TubeGeometry(path, 8, 1.5, 6);
};

export class WaterSprayGeometry extends BufferGeometry {
  private readonly jets: TubeGeometry[];

  constructor(private nozzleRadius: number, private soilDistance: number) {
    super();
    perfCount("bot.geometry.waterSpray");
    this.jets = range(jetCount).map(i => buildJet(i, nozzleRadius, soilDistance));
    // All jets have the same indexed topology and attribute layout.
    const merged = mergeGeometries(this.jets);
    this.setIndex(merged.getIndex());
    this.setAttribute("uv", merged.getAttribute("uv"));
    ["position", "normal"].forEach(name => {
      const attribute = merged.getAttribute(name) as BufferAttribute;
      this.setAttribute(name, attribute.setUsage(DynamicDrawUsage));
    });
    mergedTubeParts.set(this, { solidVertexCount: 0, tubes: this.jets });
  }

  update(nozzleRadius: number, soilDistance: number) {
    if (this.nozzleRadius === nozzleRadius && this.soilDistance === soilDistance) {
      return;
    }
    this.nozzleRadius = nozzleRadius;
    this.soilDistance = soilDistance;
    perfCount("bot.geometry.waterSpray");
    const { position, normal } = this.attributes;
    this.jets.forEach((_, index) => {
      const jet = buildJet(index, nozzleRadius, soilDistance);
      this.jets[index] = jet;
      const vertices = jet.getAttribute("position").array;
      const normals = jet.getAttribute("normal").array;
      position.array.set(vertices, index * vertices.length);
      normal.array.set(normals, index * normals.length);
    });
    position.needsUpdate = true;
    normal.needsUpdate = true;
    this.computeBoundingBox();
    this.computeBoundingSphere();
  }
}
