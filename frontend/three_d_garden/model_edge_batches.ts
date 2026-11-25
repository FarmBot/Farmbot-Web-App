import {
  BufferAttribute, BufferGeometry, DynamicDrawUsage, LineBasicMaterial,
  LineSegments, Material, Matrix4, Object3D,
} from "three";

export interface EdgePart {
  geometry: BufferGeometry;
  matrix: Matrix4;
  moved: boolean;
  changedGeometry: boolean;
}

type EdgeLines = LineSegments<BufferGeometry, LineBasicMaterial>;

export const syncEdgeStyle = (lines: EdgeLines, material: Material, mask: number) => {
  lines.layers.mask = mask;
  lines.material.opacity = material.opacity * 0.65;
  lines.material.clippingPlanes = material.clippingPlanes;
  lines.material.clipIntersection = material.clipIntersection;
};

const matchesClipping = (a: Material, b: Material) => {
  const aPlanes = a.clippingPlanes;
  const bPlanes = b.clippingPlanes;
  return a.clipIntersection == b.clipIntersection && (aPlanes == bPlanes
    || (aPlanes && bPlanes && aPlanes.length == bPlanes.length
      && aPlanes.every((plane, index) => plane == bPlanes[index])));
};

const copyPart = (
  target: BufferAttribute,
  offset: number,
  part: EdgePart,
) => {
  const source = part.geometry.getAttribute("position").array;
  const destination = target.array;
  const matrix = part.matrix.elements;
  const start = offset * 3;
  // Edge positions are XYZ float triples and Object3D matrices are affine.
  for (let index = 0; index < source.length; index += 3) {
    const x = source[index];
    const y = source[index + 1];
    const z = source[index + 2];
    const at = start + index;
    destination[at] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
    destination[at + 1] =
      matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
    destination[at + 2] =
      matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
  }
};

export const createModelEdgeBatch = (
  root: Object3D,
  lines: EdgeLines,
) => {
  const merged = lines.geometry;
  let current: EdgePart[] = [];
  let next: EdgePart[] = [];
  let style: Material | undefined;
  let layers = 0;
  let layoutDirty = false;
  let transformDirty = false;
  lines.matrixAutoUpdate = false;

  const updateGeometry = (layoutChanged: boolean) => {
    const first = next[0];
    if (next.length == 1) {
      // Keep the shared buffer and apply this part's transform on the GPU.
      lines.geometry = first.geometry;
      lines.matrix.copy(first.matrix);
      lines.matrixWorldNeedsUpdate = true;
      return;
    }
    lines.geometry = merged;
    lines.matrix.identity();
    lines.matrixWorldNeedsUpdate = true;
    let positions = merged.getAttribute("position") as BufferAttribute;
    if (layoutChanged) {
      const count = next.reduce((total, part) =>
        total + part.geometry.getAttribute("position").count, 0);
      if (positions?.count != count) {
        merged.dispose();
        positions = new BufferAttribute(new Float32Array(count * 3), 3)
          .setUsage(DynamicDrawUsage);
        merged.setAttribute("position", positions);
      }
      positions.clearUpdateRanges();
    }
    let offset = 0;
    next.forEach(part => {
      const count = part.geometry.getAttribute("position").count;
      if (layoutChanged || part.moved) { copyPart(positions, offset, part); }
      if (!layoutChanged && part.moved) {
        positions.addUpdateRange(offset * 3, count * 3);
      }
      offset += count;
    });
    positions.needsUpdate = true;
    // Three.js recomputes the culling bounds after local geometry changes.
    // eslint-disable-next-line no-null/no-null
    merged.boundingSphere = null;
    // eslint-disable-next-line no-null/no-null
    merged.boundingBox = null;
  };

  return {
    lines,
    accepts: (material: Material, mask: number) =>
      next.length == 0 || (style?.opacity == material.opacity
        && layers == mask && matchesClipping(style, material)),
    add: (part: EdgePart, material: Material, mask: number) => {
      style = material;
      layers = mask;
      layoutDirty ||= part != current[next.length] || part.changedGeometry;
      transformDirty ||= part.moved;
      part.changedGeometry = false;
      next.push(part);
    },
    update: () => {
      const material = style;
      if (next.length == 0 || !material) { return false; }
      syncEdgeStyle(lines, material, layers);
      const layoutChanged = layoutDirty || current.length != next.length;
      const updateTransform = layoutChanged || transformDirty;
      if (updateTransform) { updateGeometry(layoutChanged); }
      if (lines.parent != root) {
        root.add(lines);
      }
      if (updateTransform) { lines.updateMatrixWorld(true); }
      [next, current] = [current, next];
      next.length = 0;
      layoutDirty = false;
      transformDirty = false;
      return true;
    },
    dispose: () => {
      lines.removeFromParent();
      merged.dispose();
      lines.material.dispose();
    },
  };
};
