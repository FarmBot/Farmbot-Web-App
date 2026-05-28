import React from "react";
import { render } from "@testing-library/react";
import {
  StarterTray, StarterTrays, starterTraysPropsEqual,
} from "../starter_tray";
import { InstancedMesh, Quaternion, Vector3 } from "three";
import * as threeFiber from "@react-three/fiber";

const mockMesh = () => ({
  setMatrixAt: jest.fn(),
  instanceMatrix: { needsUpdate: false },
}) as unknown as InstancedMesh;

describe("<StarterTray />", () => {
  it("renders a single starter tray", () => {
    const { container } = render(<StarterTray />);

    expect(container).toContainHTML("starter-tray");
    expect(container).toContainHTML("starter-trays");
    expect(container.querySelectorAll("instancedmesh").length).toEqual(2);
  });
});

describe("<StarterTrays />", () => {
  it("renders instanced starter trays and seedlings", () => {
    const { container } = render(<StarterTrays positions={[
      [100, 200, 300],
      [400, 500, 600],
    ]} />);

    expect(container).toContainHTML("starter-tray-bases");
    expect(container).toContainHTML("starter-tray-seedlings");
    expect(container.querySelectorAll("instancedmesh").length).toEqual(2);
    expect(container.querySelectorAll(".billboard").length).toEqual(0);
    expect(container.querySelectorAll(".image").length).toEqual(0);
  });

  it("compares starter tray positions", () => {
    const positions: [number, number, number][] = [
      [100, 200, 300],
      [400, 500, 600],
    ];
    expect(starterTraysPropsEqual({ positions }, {
      positions: [
        [100, 200, 300],
        [400, 500, 600],
      ],
    })).toBeTruthy();
    expect(starterTraysPropsEqual({ positions }, {
      positions: [
        [100, 200, 300],
      ],
    })).toBeFalsy();
    expect(starterTraysPropsEqual({ positions }, {
      positions: [
        [100, 200, 300],
        [400, 501, 600],
      ],
    })).toBeFalsy();
  });

  it("updates tray and seedling instance matrices", () => {
    const trayMesh = mockMesh();
    const seedlingMesh = mockMesh();
    const useRef = React.useRef;
    const useEffectSpy = jest.spyOn(React, "useEffect")
      .mockImplementationOnce(effect => {
        effect();
      });
    const useRefSpy = jest.spyOn(React, "useRef")
      .mockImplementationOnce(() => ({ current: trayMesh }))
      .mockImplementationOnce(() => ({ current: seedlingMesh }))
      .mockImplementation(useRef);

    render(<StarterTrays positions={[
      [100, 200, 300],
      [400, 500, 600],
    ]} />);

    expect(trayMesh.setMatrixAt).toHaveBeenCalledTimes(2);
    expect(seedlingMesh.setMatrixAt).toHaveBeenCalledTimes(140);
    expect(trayMesh.instanceMatrix.needsUpdate).toBeTruthy();
    expect(seedlingMesh.instanceMatrix.needsUpdate).toBeTruthy();
    useRefSpy.mockRestore();
    useEffectSpy.mockRestore();
  });

  it("reuses seedling matrices until the camera changes", () => {
    const trayMesh = mockMesh();
    const seedlingMesh = mockMesh();
    const refs: React.RefObject<unknown>[] = [];
    let frameFn: Parameters<typeof threeFiber.useFrame>[0] | undefined;
    const useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(fn => {
        frameFn = fn;
        // eslint-disable-next-line no-null/no-null
        return null;
      });
    const useRef = React.useRef;
    const useRefSpy = jest.spyOn(React, "useRef")
      .mockImplementation(initialValue => {
        if (initialValue == undefined && refs.length < 2) {
          const ref = { current: initialValue };
          refs.push(ref);
          return ref;
        }
        return useRef(initialValue);
      });

    render(<StarterTrays positions={[
      [100, 200, 300],
      [400, 500, 600],
    ]} />);
    refs[0].current = trayMesh;
    refs[1].current = seedlingMesh;

    const camera = { quaternion: new Quaternion() };
    frameFn?.({ camera } as never, 0, undefined);
    frameFn?.({ camera } as never, 0, undefined);
    expect(seedlingMesh.setMatrixAt).toHaveBeenCalledTimes(140);

    camera.quaternion.setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 4);
    frameFn?.({ camera } as never, 0, undefined);
    expect(seedlingMesh.setMatrixAt).toHaveBeenCalledTimes(280);

    useRefSpy.mockRestore();
    useFrameSpy.mockRestore();
  });
});
