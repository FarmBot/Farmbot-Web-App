import React from "react";
import { render } from "@testing-library/react";
import { useFrame, useThree } from "@react-three/fiber";
import { countSceneObjects, FPSProbe } from "../fps_probe";

jest.mock("@react-three/fiber", () => ({
  useFrame: jest.fn(),
  useThree: jest.fn(),
}));

const mockUseFrame = useFrame as jest.Mock;
const mockUseThree = useThree as jest.Mock;

describe("FPSProbe", () => {
  beforeEach(() => {
    mockUseFrame.mockReset();
    mockUseThree.mockReset();
    mockUseThree.mockReturnValue({
      gl: {
        info: {
          render: { calls: 0, triangles: 0, points: 0, lines: 0 },
          memory: { geometries: 0, textures: 0 },
        },
      },
      scene: { traverse: jest.fn() },
    });
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
    mockUseThree.mockReturnValue({
      gl: {
        info: {
          render: { calls: 5, triangles: 8, points: 13, lines: 21 },
          memory: { geometries: 3, textures: 7 },
        },
      },
      scene: { traverse: jest.fn() },
    });
    const logSpy = jest.spyOn(console, "log")
      .mockImplementation(() => undefined);
    render(<FPSProbe />);
    const frameHandler = mockUseFrame.mock.calls[0][0] as () => void;
    frameHandler();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Calls: 5"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Triangles: 8"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Points: 13"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Lines: 21"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Geometries: 3"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Textures: 7"),
    );
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
