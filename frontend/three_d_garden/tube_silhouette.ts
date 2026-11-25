import {
  BufferAttribute, BufferGeometry, LineBasicMaterial, Triangle, TubeGeometry,
  Vector3,
} from "three";

interface TubeParts {
  solidVertexCount: number;
  tubes: TubeGeometry[];
}

// A merged surface can still use separate crease and tube silhouette edges.
export const mergedTubeParts = new WeakMap<BufferGeometry, TubeParts>();

interface TubeEdge {
  start: number;
  end: number;
  firstNormal: Vector3;
  secondNormal?: Vector3;
}

const tubeEdges = (tube: TubeGeometry) => {
  const { radialSegments, tubularSegments, closed } = tube.parameters;
  const stride = radialSegments + 1;
  const index = tube.getIndex();
  const position = tube.getAttribute("position");
  const edges = new Map<number, TubeEdge>();
  const triangle = new Triangle();
  const normal = new Vector3();
  const weld = (vertex: number) => {
    const ring = Math.floor(vertex / stride);
    const weldedRing = closed && ring == tubularSegments ? 0 : ring;
    return weldedRing * radialSegments + vertex % stride % radialSegments;
  };
  const addFace = (start: number, end: number) => {
    // Weld the duplicate UV seam vertices at the same point on the tube.
    const a = weld(start);
    const b = weld(end);
    const key = Math.min(a, b) * position.count + Math.max(a, b);
    const edge = edges.get(key);
    if (edge) {
      edge.secondNormal = normal.clone();
    } else {
      edges.set(key, { start, end, firstNormal: normal.clone() });
    }
  };
  if (!index) { return edges; }
  for (let offset = 0; offset < index.count; offset += 3) {
    const a = index.getX(offset);
    const b = index.getX(offset + 1);
    const c = index.getX(offset + 2);
    triangle.a.fromBufferAttribute(position, a);
    triangle.b.fromBufferAttribute(position, b);
    triangle.c.fromBufferAttribute(position, c);
    triangle.getNormal(normal);
    if (normal.lengthSq() == 0) { continue; }
    addFace(a, b);
    addFace(b, c);
    addFace(c, a);
  }
  return edges;
};

export const createTubeSilhouette = (tubes: TubeGeometry[]) => {
  const positions: number[] = [];
  const midpoints: number[] = [];
  const firstNormals: number[] = [];
  const secondNormals: number[] = [];
  const start = new Vector3();
  const end = new Vector3();
  const midpoint = new Vector3();
  const noNeighbor = new Vector3();
  tubes.forEach(tube => {
    const vertices = tube.getAttribute("position");
    tubeEdges(tube).forEach(edge => {
      const { firstNormal, secondNormal } = edge;
      // A coplanar triangle pair cannot contribute to a silhouette.
      if (secondNormal && firstNormal.dot(secondNormal) > 1 - 1e-10) { return; }
      start.fromBufferAttribute(vertices, edge.start);
      end.fromBufferAttribute(vertices, edge.end);
      midpoint.addVectors(start, end).multiplyScalar(0.5);
      const second = secondNormal || noNeighbor;
      positions.push(start.x, start.y, start.z, end.x, end.y, end.z);
      midpoints.push(midpoint.x, midpoint.y, midpoint.z,
        midpoint.x, midpoint.y, midpoint.z);
      firstNormals.push(firstNormal.x, firstNormal.y, firstNormal.z,
        firstNormal.x, firstNormal.y, firstNormal.z);
      secondNormals.push(second.x, second.y, second.z, second.x, second.y, second.z);
    });
  });
  return new BufferGeometry()
    .setAttribute("position", new BufferAttribute(new Float32Array(positions), 3))
    .setAttribute("edgeMidpoint", new BufferAttribute(new Float32Array(midpoints), 3))
    .setAttribute("firstNormal",
      new BufferAttribute(new Float32Array(firstNormals), 3))
    .setAttribute("secondNormal",
      new BufferAttribute(new Float32Array(secondNormals), 3));
};

export const configureTubeSilhouette = (material: LineBasicMaterial) => {
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
        attribute vec3 edgeMidpoint;
        attribute vec3 firstNormal;
        attribute vec3 secondNormal;`)
      .replace("#include <project_vertex>", `#include <project_vertex>
        vec3 toEye = projectionMatrix[2][3] == 0.0
          ? vec3(0.0, 0.0, 1.0)
          : -(modelViewMatrix * vec4(edgeMidpoint, 1.0)).xyz;
        bool firstFacesEye = dot(normalMatrix * firstNormal, toEye) >= 0.0;
        bool secondFacesEye = dot(normalMatrix * secondNormal, toEye) >= 0.0;
        // Cull same-facing neighbors. A zero second normal marks an open rim.
        if (firstFacesEye == secondFacesEye && dot(secondNormal, secondNormal) > 0.0) {
          gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
        }`);
  };
};
