import React from "react";
import { act, render } from "@testing-library/react";
import { useFrame } from "@react-three/fiber";
import {
  buildXAxisBeltPath, buildYAxisBeltPath, buildZAxisBeltPath,
  buildBeltGeometry, XAxisBelt, XAxisBeltPair, YAxisBelt, ZAxisBelt,
  xAxisBeltPairPropsEqual, xAxisBeltPropsEqual, yAxisBeltPropsEqual,
} from "../belts";
import { BufferGeometry, Vector3 } from "three";
import { BeltPath } from "../belt_path";

describe("belts", () => {
  it.each([0, 700, 1230])("builds routes at axis position %s", position => {
    expect(buildXAxisBeltPath("v1.9", 500, 2987, position)
      .getSegments()).not.toHaveLength(0);
    expect(buildYAxisBeltPath("v1.9", 1500, 1230, position)
      .getSegments()).not.toHaveLength(0);
    expect(buildZAxisBeltPath(1230, 500, position, -200)
      .getSegments()).not.toHaveLength(0);
  });

  it("preserves higher tessellation for larger pulley arcs", () => {
    const path = (radius: number) => new BeltPath()
      .start(-100, 0, 0)
      .pulley(0, 0, 0, radius, -1)
      .end(100, 0, 0);
    const smallPulley = buildBeltGeometry(path(2));
    const largePulley = buildBeltGeometry(path(20));

    expect(largePulley.getAttribute("position").count)
      .toBeGreaterThan(smallPulley.getAttribute("position").count);
    smallPulley.dispose();
    largePulley.dispose();
  });

  it("renders the Y-axis belt as one continuous extrusion", () => {
    const { container, rerender } = render(<YAxisBelt
      beamLength={1500}
      botSizeY={1230}
      y={700}
      position={[1, 2, 3]} />);

    expect(container.querySelector("group")?.getAttribute("name"))
      .toEqual("yBelt");
    expect(container.querySelector("group")?.getAttribute("position"))
      .toContain("1,2,3");
    expect(container.querySelectorAll("mesh[name^='yBeltSegment']"))
      .toHaveLength(1);
    expect(container).toContainHTML("yBeltSegment0");

    rerender(<YAxisBelt
      beamLength={1500}
      botSizeY={1230}
      y={701}
      position={[1, 2, 3]} />);
    expect(container.querySelectorAll("mesh[name^='yBeltSegment']"))
      .toHaveLength(1);
  });

  it.each(["x1Belt", "x2Belt"] as const)("renders %s", name => {
    const { container } = render(<XAxisBelt
      name={name}
      position={[4, 5, 6]}
      length={2987}
      x={300}
      columnLength={500} />);

    expect(container.querySelector("group")?.getAttribute("name"))
      .toEqual(name);
    expect(container.querySelectorAll(`mesh[name^='${name}Segment']`))
      .toHaveLength(1);
    expect(container).toContainHTML(`${name}Segment0`);
  });

  it("renders the static X pair and Z belt", () => {
    const { container } = render(<>
      <XAxisBeltPair
        positions={[[1, 2, 3], [4, 5, 6]]}
        length={2987}
        x={300}
        columnLength={500} />
      <ZAxisBelt
        botSizeY={1230}
        botSizeZ={500}
        negativeZ={false}
        position={[7, 8, 9]}
        y={700}
        z={-200} />
    </>);

    expect(container.querySelectorAll("mesh")).toHaveLength(3);
  });

  it("compares scalar values instead of position tuple identity", () => {
    const x = {
      name: "x1Belt" as const,
      position: [1, 2, 3] as [number, number, number],
      length: 100,
      x: 10,
      columnLength: 20,
    };
    expect(xAxisBeltPropsEqual(x, { ...x, position: [1, 2, 3] }))
      .toBeTruthy();
    expect(xAxisBeltPropsEqual(x, { ...x, x: 11 })).toBeFalsy();

    const y = {
      beamLength: 100,
      botSizeY: 200,
      y: 10,
      position: [1, 2, 3] as [number, number, number],
    };
    expect(yAxisBeltPropsEqual(y, { ...y, position: [1, 2, 3] }))
      .toBeTruthy();
    expect(yAxisBeltPropsEqual(y, { ...y, position: [2, 2, 3] }))
      .toBeFalsy();

    const pair = {
      positions: [[1, 2, 3], [4, 5, 6]] as [
        [number, number, number],
        [number, number, number],
      ],
      length: 100,
      x: 10,
      columnLength: 20,
    };
    expect(xAxisBeltPairPropsEqual(pair, {
      ...pair,
      positions: [[1, 2, 3], [4, 5, 6]],
    })).toBeTruthy();
  });

  it("releases geometry on replacement and unmount", () => {
    const disposeSpy = jest.spyOn(BufferGeometry.prototype, "dispose");
    const props = {
      name: "x1Belt" as const,
      position: [4, 5, 6] as [number, number, number],
      length: 2987,
      x: 300,
      columnLength: 500,
    };
    const { rerender, unmount } = render(<XAxisBelt {...props} />);
    rerender(<XAxisBelt {...props} x={301} />);
    expect(disposeSpy).toHaveBeenCalled();
    const replacementDisposals = disposeSpy.mock.calls.length;
    unmount();
    expect(disposeSpy).toHaveBeenCalledTimes(replacementDisposals + 1);
    disposeSpy.mockRestore();
  });

  it("replaces moving geometry inside the render frame", () => {
    const frameCallbacks: Parameters<typeof useFrame>[0][] = [];
    (useFrame as jest.Mock).mockImplementation(
      (callback: Parameters<typeof useFrame>[0]) => {
        frameCallbacks.push(callback);
        return undefined;
      });
    const positionRef = {
      current: { x: 300, y: 0, z: 0 },
    };
    const disposeSpy = jest.spyOn(BufferGeometry.prototype, "dispose");
    const { container, unmount } = render(<XAxisBelt
      name={"x1Belt"}
      position={[4, 5, 6]}
      positionRef={positionRef}
      length={2987}
      x={300}
      columnLength={500} />);
    const group = container.querySelector("group") as unknown as {
      position: Vector3;
    };
    group.position = new Vector3();
    positionRef.current = { x: 301, y: 0, z: 0 };

    act(() => frameCallbacks.forEach(callback =>
      callback({} as never, 0)));

    expect(disposeSpy).not.toHaveBeenCalled();
    unmount();
    expect(disposeSpy).toHaveBeenCalledTimes(1);
    disposeSpy.mockRestore();
    (useFrame as jest.Mock).mockReset();
  });
});
