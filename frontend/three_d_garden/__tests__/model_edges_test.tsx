import React from "react";
import * as fiber from "@react-three/fiber";
import { act, render } from "@testing-library/react";
import { range } from "lodash";
import {
  Box3, BoxGeometry, BufferAttribute, BufferGeometry, Frustum, Group,
  InstancedBufferAttribute, InstancedBufferGeometry, InstancedMesh,
  LineBasicMaterial, LineCurve3, LineSegments, Mesh, MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D, PerspectiveCamera, Plane, PlaneGeometry, Raycaster, Scene,
  SphereGeometry, TetrahedronGeometry, TubeGeometry, Vector3, WebGLRenderer,
} from "three";
import { createModelEdges, ModelEdges } from "../model_edges";
import { updateBufferGeometry } from "../bot/components/owned_extrude_geometry";
import { buildXAxisBeltPath } from "../bot/belts";
import { buildCableCarrierShape } from "../bot/components/cable_carriers";
import {
  MutableBeltGeometry, MutableCarrierGeometry,
} from "../bot/components/mutable_routing_geometry";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mergedTubeParts } from "../tube_silhouette";

const modelLines = (root: Object3D) => {
  const object = root.children.find(child => child instanceof LineSegments);
  if (!(object instanceof LineSegments)) { throw new Error("Missing model edges"); }
  return object as LineSegments<InstancedBufferGeometry, LineBasicMaterial>;
};

describe("model edges", () => {
  it("keeps the belt and carrier lines attached to their moving surface vertices", () => {
    const beltPath = (x: number) => buildXAxisBeltPath("v1.9", 500, 2987, x);
    const carrierShape = (x: number) => buildCableCarrierShape(1000, x, 70);
    const belt = new MutableBeltGeometry(beltPath(300));
    const carrier = new MutableCarrierGeometry(carrierShape(100), 20);
    const material = new MeshStandardMaterial();
    const beltMesh = new Mesh(belt, material);
    const carrierMesh = new Mesh(carrier, material);
    const scene = new Scene().add(beltMesh, carrierMesh);
    const edges = createModelEdges(scene, true);
    edges.update();
    const beltLines = modelLines(beltMesh);
    const carrierLines = modelLines(carrierMesh);
    const edgePositions = (geometry: BufferGeometry) => {
      const index = geometry.getIndex() as BufferAttribute;
      const position = geometry.getAttribute("position");
      const count = Math.min(geometry.drawRange.count, index.count);
      return Array.from(index.array.subarray(0, count), i => position.getX(i));
    };
    const beltBefore = edgePositions(beltLines.geometry);
    const carrierBefore = edgePositions(carrierLines.geometry);
    belt.update(beltPath(1300));
    carrier.update(carrierShape(500));
    expect(edgePositions(beltLines.geometry)).not.toEqual(beltBefore);
    expect(edgePositions(carrierLines.geometry)).not.toEqual(carrierBefore);
    expect(beltLines.geometry.getAttribute("position"))
      .toBe(belt.getAttribute("position"));
    expect(carrierLines.geometry.getAttribute("position"))
      .toBe(carrier.getAttribute("position"));
    edges.update();
    expect(modelLines(beltMesh)).toBe(beltLines);
    expect(modelLines(carrierMesh)).toBe(carrierLines);
    expect(beltLines.geometry.boundingSphere).toBe(belt.boundingSphere);
    expect(carrierLines.geometry.boundingBox).toBe(carrier.boundingBox);
    const dispose = jest.spyOn(beltLines.geometry, "dispose");
    edges.dispose();
    expect(dispose).not.toHaveBeenCalled();
    belt.dispose();
    carrier.dispose();
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  const tubeAt = (x: number) => new TubeGeometry(
    new LineCurve3(new Vector3(x, 0, 0), new Vector3(x, 0, 60)), 3, 4, 8);

  it("refreshes a tube silhouette when the tube changes shape in place", () => {
    const tube = tubeAt(0);
    const mesh = new Mesh(tube, new MeshStandardMaterial());
    const scene = new Scene().add(mesh);
    const edges = createModelEdges(scene, true);
    edges.update();
    const lines = modelLines(mesh);
    const geometry = lines.geometry;
    expect(scene.children).toEqual([mesh]);
    expect(new Box3().setFromObject(lines).min.x).toBeCloseTo(-4);
    const replacement = tubeAt(50);
    const dispose = jest.spyOn(geometry, "dispose");
    updateBufferGeometry(tube, replacement);
    edges.update();
    expect(modelLines(mesh)).toBe(lines);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(new Box3().setFromObject(lines).min.x).toBeCloseTo(46);
    edges.setLinesVisible(false);
    expect(lines.material.visible).toBe(false);
    edges.dispose();
    expect(mesh.children).toHaveLength(0);
  });

  it("outlines tubing in a merged surface and extracts creases from its hardware", () => {
    const box = new BoxGeometry().toNonIndexed();
    const tube = tubeAt(50);
    const source = mergeGeometries([box, tube.toNonIndexed()]);
    mergedTubeParts.set(source, {
      tubes: [tube], solidVertexCount: box.getAttribute("position").count,
    });
    const mesh = new Mesh(source, new MeshStandardMaterial());
    const scene = new Scene().add(mesh);
    const edges = createModelEdges(scene, true);
    edges.update();
    expect(modelLines(mesh).geometry.hasAttribute("firstNormal")).toBe(true);
    const creases = modelLines(scene);
    expect(creases.geometry.getAttribute("position").count).toBe(24);
    expect(new Box3().setFromObject(creases).max.x).toBe(0.5);
    edges.dispose();
  });

  it("draws the creases of visible solid models and follows their material", () => {
    const root = new Scene();
    const material = new MeshStandardMaterial({
      opacity: 0.5, clippingPlanes: [new Plane(new Vector3(1, 0, 0))],
    });
    const box = new Mesh(new BoxGeometry(), material);
    const auxiliary = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
    const ground = new Mesh(new PlaneGeometry(), material);
    const smooth = new Mesh(new SphereGeometry(10, 64, 64), material);
    const empty = new Mesh();
    const hidden = new Group();
    const hiddenBox = new Mesh(new BoxGeometry(), material);
    hidden.visible = false;
    hidden.add(hiddenBox);
    box.layers.set(3);
    root.add(box, auxiliary, ground, empty, hidden, smooth);
    const edges = createModelEdges(root, false);
    edges.update();

    const lines = modelLines(box);
    expect(lines.geometry.getAttribute("position").count).toBe(24);
    expect(lines.castShadow).toBe(false);
    expect(lines.raycast(new Raycaster(), [])).toBeUndefined();
    expect(lines.layers.mask).toBe(box.layers.mask);
    expect(lines.material.depthTest).toBe(true);
    expect(lines.material.depthWrite).toBe(false);
    expect(lines.material.clippingPlanes).toBe(material.clippingPlanes);
    expect(lines.material.opacity).toBeCloseTo(0.325);
    [auxiliary, ground, empty, hiddenBox, smooth].forEach(mesh =>
      expect(mesh.children).toHaveLength(0));

    material.opacity = 1;
    material.clippingPlanes = [];
    edges.update();
    expect(modelLines(box)).toBe(lines);
    expect(lines.material.opacity).toBeCloseTo(0.65);
    expect(lines.material.clippingPlanes).toBe(material.clippingPlanes);
    edges.dispose();
  });

  it.each([false, true])("outlines opted-in translucent meshes (scene batching: %s)",
    batchScene => {
      const material = new MeshStandardMaterial({
        transparent: true, opacity: 0.38, depthWrite: false,
      });
      const lid = new Mesh(new BoxGeometry(), material);
      lid.userData.outlineTransparent = true;
      lid.userData.preciseModelEdges = true;
      const glass = new Mesh(new BoxGeometry(), material);
      const scene = new Scene().add(lid, glass);
      const edges = createModelEdges(scene, batchScene);

      edges.update();

      const lines = modelLines(batchScene ? scene : lid);
      expect(lines.geometry.getAttribute("position").count).toEqual(24);
      expect(lines.material.opacity).toBeCloseTo(0.38 * 0.65);
      expect(lid.material.transparent).toEqual(true);
      expect(lid.material.depthWrite).toEqual(false);
      expect(glass.children).toHaveLength(0);
      edges.dispose();
    });

  it("preserves actual creases without joining nearby details", () => {
    const geometry = new BufferGeometry();
    const position = new BufferAttribute(new Float32Array([
      0, 0, 0, 1, 0, 0, 0.5, 1, 0, 0.5, -1, 0,
      0, 0.00003, 0, 1, 0.00003, 0, 0.5, 0.00003, 1, 0.5, 0.00003, -1,
      2, 0, 0, 3, 0, 0, 2.5, 1, 0, 2.5, 0, 1,
    ]), 3);
    geometry.setAttribute("position", position);
    geometry.setIndex([0, 1, 2, 5, 4, 7, 1, 0, 3, 4, 5, 6, 8, 9, 10, 9, 8, 11]);
    const mesh = new Mesh(geometry, new MeshStandardMaterial());
    mesh.userData.preciseModelEdges = true;
    const edges = createModelEdges(new Scene().add(mesh), false);

    edges.update();

    const lines = modelLines(mesh);
    const vertices = lines.geometry.getAttribute("position");
    const segment = (attribute: typeof vertices, a: number, b: number) =>
      [a, b].map(i => new Vector3().fromBufferAttribute(attribute, i).toArray()
        .join(",")).sort().join("|");
    const actual = range(vertices.count / 2).map(index =>
      segment(vertices, 2 * index, 2 * index + 1));
    const expected = [
      [0, 2], [2, 1], [1, 3], [3, 0], [4, 6], [6, 5], [5, 7], [7, 4],
      [8, 10], [10, 9], [9, 11], [11, 8], [8, 9],
    ].map(([a, b]) => segment(position, a, b));
    expect(actual.sort()).toEqual(expected.sort());
    expect(geometry.getAttribute("position")).toBe(position);
    expect(position.getX(9)).toEqual(3);
    edges.dispose();
  });

  it("shares cached edges only between matching precision settings", () => {
    const source = new BoxGeometry();
    const material = new MeshStandardMaterial();
    const standard = new Mesh(source, material);
    const fine = new Mesh(source, material);
    const otherFine = new Mesh(source, material);
    fine.userData.preciseModelEdges = true;
    otherFine.userData.preciseModelEdges = true;
    const scene = new Scene().add(standard, fine, otherFine);
    const edges = createModelEdges(scene, false);
    edges.update();

    const fineGeometry = modelLines(fine).geometry;
    const standardGeometry = modelLines(standard).geometry;
    const disposeFine = jest.spyOn(fineGeometry, "dispose");
    expect(modelLines(otherFine).geometry).toBe(fineGeometry);
    expect(standardGeometry).not.toBe(fineGeometry);

    fine.userData.preciseModelEdges = false;
    edges.update();
    expect(modelLines(fine).geometry).toBe(standardGeometry);
    expect(disposeFine).not.toHaveBeenCalled();
    otherFine.removeFromParent();
    expect(disposeFine).toHaveBeenCalledTimes(1);
    edges.dispose();
  });

  it("shares the source edges across views and releases them after the last use", () => {
    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial();
    const box = new Mesh(geometry, material);
    const secondBox = new Mesh(geometry, material);
    const root = new Scene().add(box);
    const edges = createModelEdges(root, false);
    const otherEdges = createModelEdges(new Scene().add(secondBox), false);
    edges.update();
    otherEdges.update();
    const first = modelLines(box);
    const second = modelLines(secondBox);
    const original = first.geometry;
    expect(original).toBe(second.geometry);
    const dispose = jest.spyOn(original, "dispose");
    const disposeMaterial = jest.spyOn(first.material, "dispose");

    box.geometry = new BoxGeometry(2, 2, 2);
    edges.update();
    expect(dispose).toHaveBeenCalledTimes(0);
    expect(modelLines(box).geometry).not.toBe(original);

    otherEdges.dispose();
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(secondBox.children).toHaveLength(0);
    box.visible = false;
    edges.update();
    expect(box.children).toHaveLength(0);
    expect(disposeMaterial).toHaveBeenCalledTimes(1);
    edges.dispose();
  });

  it("uses the parent instance transforms and culling bounds in one line draw", () => {
    const mesh = new InstancedMesh(new BoxGeometry(),
      new MeshStandardMaterial(), 3);
    const root = new Scene().add(mesh);
    const edges = createModelEdges(root, false);
    edges.update();
    const lines = modelLines(mesh);
    expect(lines.geometry).toBeInstanceOf(InstancedBufferGeometry);
    expect(lines.geometry.instanceCount).toBe(3);
    expect(lines.geometry.getAttribute("edgeInstanceMatrix")).toBe(mesh.instanceMatrix);
    mesh.count = 2;
    mesh.instanceMatrix = new InstancedBufferAttribute(new Float32Array(48), 16);
    edges.update();
    expect(lines.geometry.instanceCount).toBe(2);
    expect(lines.geometry.getAttribute("edgeInstanceMatrix")).toBe(mesh.instanceMatrix);
    const testBounds = jest.spyOn(mesh, "intersectsFrustum").mockReturnValue(false);
    const frustum = new Frustum();
    expect(lines.intersectsFrustum(frustum)).toBe(false);
    expect(testBounds).toHaveBeenCalledWith(frustum);
    type CompileArgs = Parameters<typeof lines.material.onBeforeCompile>;
    const shader = {
      uniforms: {},
      vertexShader: "#include <common>\n#include <begin_vertex>",
      fragmentShader: "",
    } as CompileArgs[0];
    lines.material.onBeforeCompile(shader, {} as CompileArgs[1]);
    expect(shader.vertexShader).toContain("attribute mat4 edgeInstanceMatrix;");
    expect(shader.vertexShader).toContain("edgeInstanceMatrix * vec4(transformed");

    edges.dispose();
    expect(lines.geometry.hasAttribute("edgeInstanceMatrix")).toBe(false);
  });

  it("batches a moving assembly and updates only the edited part's line buffer", () => {
    const assembly = new Group();
    assembly.name = "gantry-assembly";
    const material = new MeshStandardMaterial();
    const first = new Mesh(new BoxGeometry(), material);
    const second = new Mesh<BufferGeometry>(new BoxGeometry(), material);
    second.position.x = 10;
    assembly.add(first, second);
    const scene = new Scene().add(assembly);
    const edges = createModelEdges(scene, false);
    const update = () => {
      scene.updateMatrixWorld();
      edges.update();
    };
    update();
    const lines = modelLines(assembly);
    const geometry = lines.geometry;
    const positions = geometry.getAttribute("position") as BufferAttribute;
    expect(positions.count).toBe(48);
    expect(first.children).toHaveLength(0);
    expect(second.children).toHaveLength(0);
    expect(new Box3().setFromObject(lines).max.x).toBeCloseTo(10.5);

    const version = positions.version;
    positions.clearUpdateRanges();
    assembly.position.x = 30;
    update();
    expect(positions.version).toBe(version);
    expect(new Box3().setFromObject(lines).max.x).toBeCloseTo(40.5);

    second.position.x = 20;
    update();
    expect(geometry.getAttribute("position")).toBe(positions);
    expect(positions.updateRanges).toEqual([{ start: 72, count: 72 }]);
    expect(new Box3().setFromObject(lines).max.x).toBeCloseTo(50.5);

    second.geometry = new TetrahedronGeometry();
    update();
    expect(geometry.getAttribute("position").count).toBe(36);
    second.removeFromParent();
    update();
    expect(modelLines(assembly).geometry.getAttribute("position").count).toBe(24);
    assembly.removeFromParent();
    expect(assembly.children).toEqual([first]);
    edges.dispose();
  });

  it("keeps selection roots and incompatible clipping in distinct draws", () => {
    const scene = new Scene();
    const selected = new Group();
    selected.userData.toolSlotId = 1;
    const highlight = new Group();
    highlight.name = "utm-highlight-selection";
    const plane = new Plane(new Vector3(1, 0, 0));
    const material = new MeshStandardMaterial({ clippingPlanes: [plane] });
    const box = () => {
      const copy = material.clone();
      copy.clippingPlanes = [plane];
      return new Mesh(new BoxGeometry(), copy);
    };
    const uncut = box();
    uncut.material.clippingPlanes = [];
    const separate = box();
    separate.layers.set(3);
    selected.add(box(), box());
    highlight.add(box());
    scene.add(box(), box(), uncut, separate, selected, highlight);
    const edges = createModelEdges(scene, true);
    edges.update();
    const batches = scene.children.filter(child => child instanceof LineSegments);
    expect(batches).toHaveLength(3);
    expect(batches.map(batch => (batch as LineSegments).geometry
      .getAttribute("position").count).sort()).toEqual([24, 24, 48]);
    expect(modelLines(selected).geometry.getAttribute("position").count).toBe(48);
    expect(modelLines(highlight).geometry.getAttribute("position").count).toBe(24);

    const insert = box();
    selected.add(insert);
    edges.update();
    expect(modelLines(selected).geometry.getAttribute("position").count).toBe(72);
    edges.dispose();
  });

  it("updates the active scene before rendering and removes edges on unmount", () => {
    const mesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial());
    const scene = new Scene().add(mesh);
    const state = { scene } as fiber.RootState;
    const useThree = jest.spyOn(fiber, "useThree").mockImplementation(
      (selector = value => value) => selector(state));
    const useFrame = jest.spyOn(fiber, "useFrame").mockImplementation(jest.fn());
    try {
      const { unmount } = render(<ModelEdges />);
      const [draw, priority] = useFrame.mock.calls[0];
      expect(priority).toBe(-1);
      const camera = new PerspectiveCamera();
      const renderScene = () => scene.onBeforeRender({} as WebGLRenderer, scene,
        camera, mesh.geometry, mesh.material, new Group());
      act(() => draw(state, 0));
      renderScene();
      const lines = modelLines(scene);
      expect(lines.material.visible).toBe(true);
      scene.overrideMaterial = new MeshBasicMaterial();
      renderScene();
      expect(lines.material.visible).toBe(false);
      // eslint-disable-next-line no-null/no-null
      scene.overrideMaterial = null;
      renderScene();
      expect(lines.material.visible).toBe(true);
      unmount();
      expect(scene.children).toEqual([mesh]);
    } finally {
      useFrame.mockRestore();
      useThree.mockRestore();
    }
  });
});
