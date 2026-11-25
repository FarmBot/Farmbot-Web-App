import React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BufferAttribute, BufferGeometry, EdgesGeometry, InstancedBufferGeometry,
  InstancedMesh, LineBasicMaterial, LineSegments, Material, Matrix4, Mesh,
  MeshLambertMaterial, MeshPhongMaterial, MeshStandardMaterial, Object3D, Scene,
  TubeGeometry,
} from "three";
import {
  createModelEdgeBatch, type EdgePart, syncEdgeStyle,
} from "./model_edge_batches";
import { SECTION_CLIPPING_EXEMPT } from "./section";
import {
  configureTubeSilhouette, createTubeSilhouette, mergedTubeParts,
} from "./tube_silhouette";

const EDGE_ANGLE = 25;
const INSTANCE_MATRIX = "edgeInstanceMatrix";
const ASSEMBLIES = new Set([
  "bed-group", "bot-static-hardware", "gantry-assembly",
  "cross-slide-assembly", "z-axis-assembly",
]);

interface EdgeGeometry {
  geometry: EdgesGeometry;
  references: number;
}

const geometryCache = new WeakMap<BufferGeometry, EdgeGeometry>();

const creaseSource = (source: BufferGeometry) => {
  const parts = mergedTubeParts.get(source);
  if (!parts) { return source; }
  const positions = source.getAttribute("position").array as Float32Array;
  return new BufferGeometry().setAttribute("position", new BufferAttribute(
    positions.subarray(0, parts.solidVertexCount * 3), 3));
};

const acquireGeometry = (source: BufferGeometry) => {
  const cached = geometryCache.get(source);
  if (cached) {
    cached.references++;
    return cached.geometry;
  }
  const geometry = new EdgesGeometry(creaseSource(source), EDGE_ANGLE);
  geometryCache.set(source, { geometry, references: 1 });
  return geometry;
};

const releaseGeometry = (source: BufferGeometry) => {
  const cached = geometryCache.get(source);
  if (cached && --cached.references == 0) {
    geometryCache.delete(source);
    cached.geometry.dispose();
  }
};

const isSolidMaterial = (material: Material | Material[]): material is Material =>
  (material instanceof MeshStandardMaterial
    || material instanceof MeshPhongMaterial
    || material instanceof MeshLambertMaterial)
  && material.visible && material.depthWrite
  && !material.alphaMap && material.alphaTest == 0;

const isBatchRoot = (object: Object3D) =>
  ASSEMBLIES.has(object.name) || object.name.endsWith("-highlight-selection")
  || typeof object.userData.toolSlotId == "number";

const createLines = (geometry: BufferGeometry) => {
  const material = new LineBasicMaterial({
    color: "#343832", transparent: true, depthWrite: false, toneMapped: false,
  });
  const lines = new LineSegments(geometry, material);
  lines.name = "model-edges";
  lines.userData[SECTION_CLIPPING_EXEMPT] = true;
  lines.raycast = () => undefined;
  return lines;
};

const createInstanceLines = (source: EdgesGeometry, mesh: InstancedMesh) => {
  const geometry = new InstancedBufferGeometry();
  geometry.setAttribute("position", source.getAttribute("position").clone());
  const lines = createLines(geometry);
  lines.intersectsFrustum = frustum => mesh.intersectsFrustum(frustum);
  lines.material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>",
        `#include <common>\nattribute mat4 ${INSTANCE_MATRIX};`)
      .replace("#include <begin_vertex>",
        `#include <begin_vertex>
        transformed = (${INSTANCE_MATRIX} * vec4(transformed, 1.0)).xyz;`);
  };
  return { geometry, lines, mesh };
};

const tubePosition = (tube: TubeGeometry) =>
  tube.getAttribute("position") as BufferAttribute;

const createTubeLines = (tubes: TubeGeometry[]) => {
  const lines = createLines(createTubeSilhouette(tubes));
  configureTubeSilhouette(lines.material);
  const positions = tubes.map(tubePosition);
  const versions = positions.map(position => position.version);
  return { lines, tubes, positions, versions };
};

type EdgeBatch = ReturnType<typeof createModelEdgeBatch>;
type EdgeLines = ReturnType<typeof createLines>;

interface Assembly {
  root: Object3D;
  batches: EdgeBatch[];
}

interface LocalTransform {
  object: Object3D;
  previous: Matrix4;
}

interface TrackedMesh {
  mesh: Mesh;
  parents: Object3D[];
  assembly: Assembly;
  transforms: LocalTransform[];
  source?: BufferGeometry;
  hasCreases?: boolean;
  part?: EdgePart;
  instances?: ReturnType<typeof createInstanceLines>;
  routing?: EdgeLines;
  outline?: ReturnType<typeof createTubeLines>;
}

const disposeLine = (lines: EdgeLines) => {
  lines.removeFromParent();
  lines.material.dispose();
};

const releasePart = (record: TrackedMesh) => {
  if (record.source && record.hasCreases) { releaseGeometry(record.source); }
  const { instances, routing, outline } = record;
  if (instances) {
    disposeLine(instances.lines);
    // The parent mesh owns this shared attribute and its GPU buffer.
    instances.geometry.deleteAttribute(INSTANCE_MATRIX);
    instances.geometry.dispose();
  }
  if (routing) { disposeLine(routing); }
  if (outline) {
    disposeLine(outline.lines);
    outline.lines.geometry.dispose();
  }
  record.source = undefined;
  record.hasCreases = false;
  record.part = undefined;
  record.instances = undefined;
  record.routing = undefined;
  record.outline = undefined;
};

const syncDirectLines = (mesh: Mesh, lines: EdgeLines, material: Material) => {
  syncEdgeStyle(lines, material, mesh.layers.mask);
  if (lines.parent != mesh) {
    mesh.add(lines);
    lines.updateMatrixWorld(true);
  }
};

const syncInstances = (
  record: NonNullable<TrackedMesh["instances"]>,
  material: Material,
) => {
  const { geometry, lines, mesh } = record;
  geometry.instanceCount = mesh.count;
  if (geometry.getAttribute(INSTANCE_MATRIX) != mesh.instanceMatrix) {
    geometry.setAttribute(INSTANCE_MATRIX, mesh.instanceMatrix);
  }
  syncDirectLines(mesh, lines, material);
};

const syncTubeLines = (
  mesh: Mesh,
  outline: NonNullable<TrackedMesh["outline"]>,
  material: Material,
) => {
  const { lines, tubes, positions, versions } = outline;
  if (tubes.some((tube, index) => {
    const position = tubePosition(tube);
    return position != positions[index] || position.version != versions[index];
  })) {
    lines.geometry.dispose();
    lines.geometry = createTubeSilhouette(tubes);
    tubes.forEach((tube, index) => {
      const position = tubePosition(tube);
      positions[index] = position;
      versions[index] = position.version;
    });
  }
  syncDirectLines(mesh, lines, material);
};

const createParts = (record: TrackedMesh, geometry: BufferGeometry) => {
  const { mesh } = record;
  record.source = geometry;
  if ("modelEdgeGeometry" in geometry
    && geometry.modelEdgeGeometry instanceof BufferGeometry) {
    record.routing = createLines(geometry.modelEdgeGeometry as BufferGeometry);
    return;
  }
  if (geometry instanceof TubeGeometry) {
    record.outline = createTubeLines([geometry]);
    return;
  }
  const tubes = mergedTubeParts.get(geometry)?.tubes;
  if (tubes) { record.outline = createTubeLines(tubes); }
  const creases = acquireGeometry(geometry);
  record.hasCreases = true;
  if (creases.getAttribute("position").count == 0) { return; }
  if (mesh instanceof InstancedMesh) {
    record.instances = createInstanceLines(creases, mesh as InstancedMesh);
  } else {
    record.part = {
      geometry: creases, matrix: new Matrix4(), moved: false, changedGeometry: true,
    };
  }
};

const syncPartTransform = (part: EdgePart, transforms: LocalTransform[]) => {
  part.moved = false;
  for (const { object, previous } of transforms) {
    if (previous.equals(object.matrix)) { continue; }
    previous.copy(object.matrix);
    part.moved = true;
  }
  if (part.moved || part.changedGeometry) {
    part.matrix.identity();
    transforms.forEach(({ previous }) => part.matrix.multiply(previous));
  }
};

export const createModelEdges = (root: Scene, batchScene: boolean) => {
  type ChildListener = (event: { child: Object3D }) => void;
  const listeners = new Map<Object3D, [ChildListener, ChildListener]>();
  const meshes = new Map<Object3D, TrackedMesh>();
  const assemblies = new Map<Object3D, Assembly>();
  const getAssembly = (object: Object3D) => {
    const existing = assemblies.get(object);
    if (existing) { return existing; }
    const assembly: Assembly = { root: object, batches: [] };
    assemblies.set(object, assembly);
    return assembly;
  };
  const remove = (object: Object3D) => {
    const callbacks = listeners.get(object);
    if (!callbacks) { return; }
    const [added, removed] = callbacks;
    object.removeEventListener("childadded", added);
    object.removeEventListener("childremoved", removed);
    listeners.delete(object);
    const record = meshes.get(object);
    if (record) {
      releasePart(record);
      meshes.delete(object);
    }
    const assembly = assemblies.get(object);
    assembly?.batches.forEach(batch => batch.dispose());
    assemblies.delete(object);
    object.children.forEach(remove);
  };
  const add = (object: Object3D, assembly?: Assembly, parents: Object3D[] = []) => {
    if (object.name == "model-edges") { return; }
    const nextAssembly = isBatchRoot(object) || (batchScene && object == root)
      ? getAssembly(object)
      : assembly;
    if (object instanceof Mesh) {
      const mesh = object as Mesh;
      const parent = parents[parents.length - 1];
      const group = parent && parent != root ? parent : mesh;
      // This part can spin relative to its tool while FarmBot operates.
      const rotates = !batchScene && mesh.name == "rotaryToolImplement";
      const owner = rotates ? getAssembly(mesh) : nextAssembly || getAssembly(group);
      const path = owner.root == mesh
        ? []
        : [...parents.slice(parents.indexOf(owner.root) + 1), mesh];
      meshes.set(mesh, {
        mesh, parents, assembly: owner,
        transforms: path.map(part => ({ object: part, previous: new Matrix4() })),
      });
    }
    const nextParents = [...parents, object];
    const added: ChildListener = event => add(event.child, nextAssembly, nextParents);
    const removed: ChildListener = event => remove(event.child);
    object.addEventListener("childadded", added);
    object.addEventListener("childremoved", removed);
    listeners.set(object, [added, removed]);
    object.children.forEach(child => add(child, nextAssembly, nextParents));
  };
  add(root);

  const assignPart = (record: TrackedMesh, material: Material) => {
    const { assembly, mesh, part } = record;
    if (!part) { return; }
    syncPartTransform(part, record.transforms);
    const mask = mesh.layers.mask;
    let batch = assembly.batches.find(candidate => candidate.accepts(material, mask));
    if (!batch) {
      batch = createModelEdgeBatch(assembly.root, createLines(new BufferGeometry()));
      assembly.batches.push(batch);
    }
    batch.add(part, material, mask);
  };

  const updateMesh = (record: TrackedMesh) => {
    const { mesh, parents } = record;
    const { material, geometry } = mesh;
    const visible = mesh.visible && parents.every(parent => parent.visible);
    if (!visible || !isSolidMaterial(material) || geometry.type == "PlaneGeometry"
      || !geometry.hasAttribute("position")) {
      if (record.source) { releasePart(record); }
      return;
    }
    if (record.source != geometry) {
      releasePart(record);
      createParts(record, geometry);
    }
    if (record.routing) { syncDirectLines(mesh, record.routing, material); }
    if (record.outline) { syncTubeLines(mesh, record.outline, material); }
    if (record.instances) {
      syncInstances(record.instances, material);
    } else {
      assignPart(record, material);
    }
  };

  const update = () => {
    meshes.forEach(updateMesh);
    assemblies.forEach(assembly => {
      const { batches } = assembly;
      for (let index = batches.length - 1; index >= 0; index--) {
        const batch = batches[index];
        if (batch.update()) { continue; }
        batch.dispose();
        batches.splice(index, 1);
      }
    });
  };

  const setLinesVisible = (visible: boolean) => {
    assemblies.forEach(({ batches }) =>
      batches.forEach(({ lines }) => { lines.material.visible = visible; }));
    meshes.forEach(({ instances, routing, outline }) => {
      if (instances) { instances.lines.material.visible = visible; }
      if (routing) { routing.material.visible = visible; }
      if (outline) { outline.lines.material.visible = visible; }
    });
  };

  return { update, setLinesVisible, dispose: () => remove(root) };
};

const bindEdgeRendering = (
  scene: Scene,
  batchScene: boolean,
  takeUpdate: () => boolean,
) => {
  const binding = createModelEdges(scene, batchScene);
  let override = false;
  const original = scene.onBeforeRender;
  const beforeRender: Scene["onBeforeRender"] = (...args) => {
    original.apply(scene, args);
    const overrideMaterial = !!scene.overrideMaterial;
    if (override != overrideMaterial) {
      // The selection passes only need the solid geometry's depth and mask.
      override = overrideMaterial;
      binding.setLinesVisible(!override);
    }
    if (!override && takeUpdate()) { binding.update(); }
  };
  scene.onBeforeRender = beforeRender;
  return () => {
    if (scene.onBeforeRender == beforeRender) { scene.onBeforeRender = original; }
    binding.dispose();
  };
};

export const ModelEdges = ({ batchScene = true }: { batchScene?: boolean }) => {
  const scene = useThree(state => state.scene);
  const dirty = React.useRef(true);
  useFrame(() => { dirty.current = true; }, -1);
  React.useLayoutEffect(() => {
    dirty.current = true;
    return bindEdgeRendering(scene, batchScene, () => {
      const update = dirty.current;
      dirty.current = false;
      return update;
    });
  }, [scene, batchScene]);
  return undefined;
};
