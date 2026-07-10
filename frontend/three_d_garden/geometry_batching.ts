import * as THREE from "three";
import { mergeGeometries } from
  "three/examples/jsm/utils/BufferGeometryUtils.js";

type Vector3Tuple = [number, number, number];

export interface SolidGeometryPart {
  color: THREE.ColorRepresentation;
  geometry: THREE.BufferGeometry | undefined;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: number | Vector3Tuple;
}

const partMatrix = (part: SolidGeometryPart) => {
  const position = new THREE.Vector3(...(part.position || [0, 0, 0]));
  const rotation = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(...(part.rotation || [0, 0, 0])),
  );
  const scale = typeof part.scale == "number"
    ? new THREE.Vector3(part.scale, part.scale, part.scale)
    : new THREE.Vector3(...(part.scale || [1, 1, 1]));
  return new THREE.Matrix4().compose(position, rotation, scale);
};

const prepareGeometry = (part: SolidGeometryPart) => {
  if (!part.geometry?.getAttribute("position")) { return undefined; }
  const geometry = part.geometry.index
    ? part.geometry.toNonIndexed()
    : part.geometry.clone();
  Object.keys(geometry.attributes)
    .filter(name => !["normal", "position"].includes(name))
    .forEach(name => geometry.deleteAttribute(name));
  if (!geometry.getAttribute("normal")) {
    geometry.computeVertexNormals();
  }
  geometry.applyMatrix4(partMatrix(part));
  const color = new THREE.Color(part.color);
  const colors = new Float32Array(
    geometry.getAttribute("position").count * 3,
  );
  for (let index = 0; index < colors.length; index += 3) {
    color.toArray(colors, index);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
};

export const mergeSolidGeometries = (parts: SolidGeometryPart[]) => {
  const geometries = parts
    .map(prepareGeometry)
    .filter((geometry): geometry is THREE.BufferGeometry => !!geometry);
  if (geometries.length != parts.length || geometries.length == 0) {
    geometries.forEach(geometry => geometry.dispose());
    return undefined;
  }
  const merged = mergeGeometries(geometries, false) || undefined;
  geometries.forEach(geometry => geometry.dispose());
  return merged;
};

const frontSideMaterialCache = new WeakMap<
  THREE.Material,
  THREE.Material
>();

export const frontSideMaterial = <T extends THREE.Material>(material: T): T => {
  if (typeof material?.clone != "function") { return material; }
  const cached = frontSideMaterialCache.get(material);
  if (cached) { return cached as T; }
  const clone = material.clone();
  clone.side = THREE.FrontSide;
  frontSideMaterialCache.set(material, clone);
  return clone;
};

const vertexColorMaterialCache = new WeakMap<
  THREE.MeshStandardMaterial,
  THREE.MeshStandardMaterial
>();

export const solidVertexColorMaterial = (
  material: THREE.MeshStandardMaterial,
) => {
  if (typeof material?.clone != "function") { return material; }
  const cached = vertexColorMaterialCache.get(material);
  if (cached) { return cached; }
  const clone = material.clone();
  clone.color.set("white");
  clone.vertexColors = true;
  vertexColorMaterialCache.set(material, clone);
  return clone;
};
