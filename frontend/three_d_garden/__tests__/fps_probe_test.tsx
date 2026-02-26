import React from "react";
import { render } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import { countSceneObjects, FPSProbe } from "../fps_probe";

describe("FPSProbe", () => {
  let useFrameSpy: jest.SpyInstance;
  let useThreeSpy: jest.SpyInstance;

  beforeEach(() => {
    useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(jest.fn());
    useThreeSpy = jest.spyOn(threeFiber, "useThree")
      .mockReturnValue({
        gl: {
          info: {
            render: { calls: 0, triangles: 0, points: 0, lines: 0 },
            memory: { geometries: 0, textures: 0 },
          },
        },
        scene: { traverse: jest.fn() },
      });
  });

  afterEach(() => {
    useFrameSpy.mockRestore();
    useThreeSpy.mockRestore();
  });

  it("sets window.__fps", () => {
    let t = 0;
    const nowSpy = jest.spyOn(performance, "now").mockImplementation(() => {
      t += 3000;
      return t;
    });
    render(<FPSProbe />);
    expect(window.__fps).toEqual(0);
    nowSpy.mockRestore();
  });

  it("logs render and memory counts", () => {
    let t = 0;
    const nowSpy = jest.spyOn(performance, "now").mockImplementation(() => {
      t += 2000;
      return t;
    });
    const objects = [
      { type: "Mesh", name: "soil" },
      { type: "Group", name: "bed" },
      { type: "Mesh", name: "soil" },
      { type: "Group", name: "bed" },
      { type: "Mesh", name: "tool" },
      { name: "mystery" },
    ];
    useThreeSpy.mockReturnValue({
      gl: {
        info: {
          render: { calls: 5, triangles: 8, points: 13, lines: 21 },
          memory: { geometries: 3, textures: 7 },
        },
      },
      pointer: { x: 0, y: 0 },
      camera: {},
      size: { width: 800, height: 600 },
      scene: {
        traverse: (callback: (object: typeof objects[number]) => void) => {
          objects.forEach(callback);
        },
      },
    });
    const logSpy = jest.spyOn(console, "log")
      .mockImplementation(() => undefined);
    render(<FPSProbe />);
    const frameHandler = useFrameSpy.mock.calls[0][0] as () => void;
    frameHandler();
    [
      "Calls: 5",
      "Triangles: 8",
      "Points: 13",
      "Lines: 21",
      "Geometries: 3",
      "Textures: 7",
      "Scene types: Mesh: 3, Group: 2, Unknown: 1",
      "Scene names: soil: 2, bed: 2, tool: 1, mystery: 1",
    ].forEach(line => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(line),
      );
    });
    logSpy.mockRestore();
    nowSpy.mockRestore();
  });

  it("counts scene objects", () => {
    const objects = [
      { isMesh: true, type: "Mesh", name: "soil" },
      { isInstancedMesh: true, type: "InstancedMesh", name: "plants" },
      { isMesh: true, type: "Mesh", name: "soil" },
      { type: "Group" },
    ];
    const scene = {
      traverse: (callback: (object: typeof objects[number]) => void) => {
        objects.forEach(callback);
      },
    };
    const counts = countSceneObjects(scene);
    expect(counts.total).toEqual(4);
    expect(counts.meshes).toEqual(2);
    expect(counts.instancedMeshes).toEqual(1);
    expect(counts.typeCounts.Mesh).toEqual(2);
    expect(counts.typeCounts.Group).toEqual(1);
    expect(counts.nameCounts.soil).toEqual(2);
  });
});
