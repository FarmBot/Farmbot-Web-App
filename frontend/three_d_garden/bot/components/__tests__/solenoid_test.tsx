import React from "react";
import { render } from "@testing-library/react";
import { useGLTF } from "@react-three/drei";
import { Curve, Euler, Vector3 } from "three";
import { ASSETS, LIB_DIR } from "../../../constants";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { clone } from "lodash";
import { Solenoid, SolenoidProps, solenoidPropsEqual } from "../solenoid";
import {
  actRenderer,
  createRenderer,
} from "../../../../__test_support__/test_renderer";
import { WaterTube } from "../water_tube";
import * as waterTubes from "../water_tube";

describe("<Solenoid />", () => {
  const useGltfMock = useGLTF as unknown as jest.Mock;

  beforeEach(() => {
    useGltfMock.mockClear();
  });

  const fakeProps = (): SolenoidProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  const expectPosition = (
    element: Element | null | undefined,
    expected: [number, number, number],
  ) => {
    expect(element).toBeTruthy();
    const position = element!.getAttribute("position")!.split(",").map(Number);
    expect(position).toHaveLength(3);
    expected.forEach((value, index) => {
      expect(position[index]).toBeCloseTo(value, 3);
    });
  };

  it("renders solenoid", () => {
    const { container } = render(<Solenoid {...fakeProps()} />);
    expect(container).toContainHTML("solenoid");
  });

  it.each([
    ["v1.2", "solenoid"],
    ["v1.3", "solenoid"],
    ["v1.7", "solenoid"],
    ["v1.8", "solenoid"],
    ["v1.9", "solenoidV19"],
  ])("loads the solenoid model for %s", (kitVersion, model) => {
    const p = fakeProps();
    p.config.kitVersion = kitVersion;
    p.renderTubes = false;
    const { container } = render(<Solenoid {...p} />);
    expect(ASSETS.models[model]).toBeDefined();
    expect(useGltfMock).toHaveBeenCalledWith(ASSETS.models[model], LIB_DIR);
    const rotationX = kitVersion == "v1.9" ? Math.PI / 2 : 0;
    const rotationZ = kitVersion == "v1.9" ? 0 : -Math.PI / 2;
    expect(container.querySelector("[name='solenoid']"))
      .toHaveAttribute("rotation", `${rotationX},0,${rotationZ}`);
  });

  it("updates the solenoid model when the kit version changes", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    p.renderTubes = false;
    const { rerender } = render(<Solenoid {...p} />);
    expect(useGltfMock).toHaveBeenLastCalledWith(
      ASSETS.models.solenoid, LIB_DIR,
    );
    rerender(<Solenoid {...p}
      config={{ ...p.config, kitVersion: "v1.9" }} />);
    expect(useGltfMock).toHaveBeenLastCalledWith(
      ASSETS.models.solenoidV19, LIB_DIR,
    );
    rerender(<Solenoid {...p} />);
    expect(useGltfMock).toHaveBeenLastCalledWith(
      ASSETS.models.solenoid, LIB_DIR,
    );
  });

  it("skips loading the model when the body is disabled", () => {
    const p = fakeProps();
    p.renderBody = false;
    const { container } = render(<Solenoid {...p} />);
    expect(useGltfMock).not.toHaveBeenCalled();
    expect(container.querySelector("[name='solenoid']")).toBeNull();
  });

  it.each([
    ["v1.9", true, -17.645, -28, 7],
    ["v1.9", false, -17.645, -8, 7],
    ["v1.8", true, -115, 20, INITIAL.columnLength - 200],
  ] as const)(
    "places %s with tracks=%s beside its mounting hardware",
    (kitVersion, tracks, x, outerY, z) => {
      const p = fakeProps();
      p.config.kitVersion = kitVersion;
      p.config.tracks = tracks;
      p.frame = "gantry";
      const { container } = render(<Solenoid {...p} />);
      expectPosition(container.querySelector("[name='solenoid']"),
        [x, outerY - p.config.bedYOffset, z]);
    },
  );

  it("places the valve in world coordinates with bed offsets", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.9";
    p.config.tracks = true;
    p.frame = "world";
    const { container } = render(<Solenoid {...p} />);
    expectPosition(container.querySelector("[name='solenoid']"), [
      p.configPosition.x - 17.645 + p.config.bedXOffset
        - p.config.bedLengthOuter / 2,
      -28 - p.config.bedWidthOuter / 2,
      7,
    ]);
  });

  it("aligns both mounting screws with the wheel plate holes", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.9";
    p.config.tracks = true;
    p.frame = "gantry";
    const { container } = render(<Solenoid {...p} />);
    const mesh = container.querySelector("[name='solenoid']")!;
    const position = new Vector3().fromArray(
      mesh.getAttribute("position")!.split(",").map(Number),
    );
    const [rx, ry, rz] = mesh.getAttribute("rotation")!.split(",").map(Number);
    const rotation = new Euler(rx, ry, rz);
    // Screw bearing faces in the GLB, converted from meters to millimeters.
    [0, 40].forEach((screwY, index) => {
      const bearing = new Vector3(0, screwY, -2)
        .applyEuler(rotation).add(position);
      expect(bearing.x).toBeCloseTo(-17.645, 3);
      expect(bearing.y).toBeCloseTo(-26 - p.config.bedYOffset, 3);
      expect(bearing.z).toBeCloseTo(7 + index * 40, 3);
      const tip = new Vector3(0, screwY, -6)
        .applyEuler(rotation).add(position);
      expect(tip.x).toBeCloseTo(bearing.x, 3);
      expect(tip.z).toBeCloseTo(bearing.z, 3);
      expect(tip.y).toBeCloseTo(-22 - p.config.bedYOffset, 3);
    });
  });

  it("keeps the v1.9 valve on the plate as the gantry moves", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.9";
    p.config.tracks = true;
    p.frame = "gantry";
    const { container, rerender } = render(<Solenoid {...p} />);
    const position: [number, number, number] =
      [-17.645, -28 - p.config.bedYOffset, 7];
    expectPosition(container.querySelector("[name='solenoid']"), position);
    rerender(<Solenoid {...p} configPosition={{
      ...p.configPosition, x: p.configPosition.x + 100,
    }} />);
    expectPosition(container.querySelector("[name='solenoid']"), position);
    const upperTube = container.querySelector(
      "[name='upper-solenoid-water-tube']",
    );
    expectPosition(upperTube?.parentElement,
      [-28.895, -41 - p.config.bedYOffset, 59.5]);
  });

  it("updates placement when tracks change", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.9";
    p.config.tracks = true;
    p.frame = "gantry";
    const { container, rerender } = render(<Solenoid {...p} />);
    rerender(<Solenoid {...p} config={{ ...p.config, tracks: false }} />);
    expectPosition(container.querySelector("[name='solenoid']"),
      [-17.645, -8 - p.config.bedYOffset, 7]);
  });

  it.each([true, false])(
    "bends directly from the valve to the carrier with tracks=%s", tracks => {
      const p = fakeProps();
      p.config.kitVersion = "v1.9";
      p.config.tracks = tracks;
      p.frame = "machine";
      let path: Curve<Vector3> | undefined;
      const tube = jest.spyOn(waterTubes, "WaterTube")
        .mockImplementation(props => {
          if (props.tubeName == "lower-solenoid-water-tube") {
            path = props.tubePath;
          }
          return <></>;
        });
      try {
        render(<Solenoid {...p} />);
        expect(path).toBeDefined();
        const endY = -16 + (tracks ? 0 : 20);
        expect(path!.getPoint(0)).toEqual(new Vector3(0, 0, 0));
        expect(path!.getPoint(1)).toEqual(new Vector3(31.105, endY, 43.5));
        let previous = path!.getPoint(0);
        for (let i = 1; i <= 100; i++) {
          const point = path!.getPoint(i / 100);
          expect(point.x).toBeGreaterThanOrEqual(previous.x);
          expect(point.x).toBeLessThanOrEqual(31.105);
          expect(point.y).toBeGreaterThanOrEqual(Math.min(0, endY));
          expect(point.y).toBeLessThanOrEqual(Math.max(0, endY));
          expect(point.z).toBeGreaterThanOrEqual(previous.z);
          expect(point.z).toBeLessThanOrEqual(43.5);
          previous = point;
        }
        expect(path!.getTangent(0).x).toBeCloseTo(1);
        expect(path!.getTangent(1).z).toBeCloseTo(1);
      } finally {
        tube.mockRestore();
      }
    },
  );

  it.each([
    [500, true],
    [650, true],
    [800, false],
  ] as const)(
    "routes behind the box with columnLength=%s and tracks=%s",
    (columnLength, tracks) => {
      const p = fakeProps();
      p.config.kitVersion = "v1.9";
      p.config.columnLength = columnLength;
      p.config.tracks = tracks;
      p.frame = "machine";
      let path: Curve<Vector3> | undefined;
      const tube = jest.spyOn(waterTubes, "WaterTube")
        .mockImplementation(props => {
          if (props.tubeName == "upper-solenoid-water-tube") {
            path = props.tubePath;
          }
          return <></>;
        });
      try {
        render(<Solenoid {...p} />);
        expect(path).toBeDefined();
        const start = new Vector3(
          p.configPosition.x - 28.895,
          -41 + (tracks ? 0 : 20) - p.config.bedYOffset,
          59.5,
        );
        // GLB enclosure bounds, including its lid, expanded by the tube radius.
        const minZ = columnLength - 190 - 137.454 - 5;
        const maxZ = columnLength - 190 + 150.087 + 5;
        const backY = -20 - p.config.bedYOffset;
        let alongsideBox = 0;
        let alongExtrusion = 0;
        for (let i = 0; i <= 1000; i++) {
          const point = path!.getPoint(i / 1000).add(start);
          if (point.z >= minZ && point.z <= maxZ) {
            expect(point.y).toBeGreaterThanOrEqual(backY + 5 - 0.001);
          }
          if (point.z >= minZ && point.z <= columnLength - 70) {
            expect(point.y).toBeCloseTo(backY + 5, 3);
            expect(point.x).toBeCloseTo(p.configPosition.x - 33, 3);
            expect(point.y).toBeCloseTo(
              -15 - p.config.bedYOffset, 3,
            );
            alongsideBox++;
          }
          if (point.z >= columnLength - 34 && point.z <= columnLength + 44) {
            expect(point.x).toBeCloseTo(p.configPosition.x - 73, 3);
            expect(point.y).toBeCloseTo(
              5 + (tracks ? 0 : 20) - p.config.bedYOffset, 3,
            );
            alongExtrusion++;
          }
          const maxY = Math.max(
            35, -15 - p.config.bedYOffset,
            5 + (tracks ? 0 : 20) - p.config.bedYOffset,
          );
          expect(point.y).toBeLessThanOrEqual(maxY + 0.001);
        }
        expect(alongsideBox).toBeGreaterThan(0);
        expect(alongExtrusion).toBeGreaterThan(0);
        const carrierEntry = path!.getPoint(1).add(start);
        expect(carrierEntry.x).toBeCloseTo(p.configPosition.x - 60, 3);
        expect(carrierEntry.y).toBeCloseTo(35, 3);
        expect(carrierEntry.z).toBeCloseTo(columnLength + 90, 3);
        expect(path!.getTangent(0).z).toBeCloseTo(1);
        expect(path!.getTangent(1).y).toBeCloseTo(1);
      } finally {
        tube.mockRestore();
      }
    },
  );

  it("reuses water tube paths while position is unchanged", () => {
    const p = fakeProps();
    const wrapper = createRenderer(<Solenoid {...p} />);
    const before = wrapper.root.findAllByType(WaterTube)
      .map(node => node.props.tubePath);
    actRenderer(() => wrapper.update(<Solenoid {...p} />));
    const after = wrapper.root.findAllByType(WaterTube)
      .map(node => node.props.tubePath);
    expect(after).toEqual(before);
  });

  it("reuses water tube paths during unrelated config churn", () => {
    const p = fakeProps();
    const wrapper = createRenderer(<Solenoid {...p} />);
    const before = wrapper.root.findAllByType(WaterTube)
      .map(node => node.props.tubePath);
    actRenderer(() => wrapper.update(<Solenoid {...p}
      config={{ ...p.config, sun: p.config.sun + 1 }} />));
    const after = wrapper.root.findAllByType(WaterTube)
      .map(node => node.props.tubePath);
    expect(after).toEqual(before);
  });

  it("compares only solenoid inputs that affect rendering", () => {
    const previous = fakeProps();
    expect(solenoidPropsEqual(previous, {
      ...previous,
      config: { ...previous.config, sun: previous.config.sun + 1 },
    })).toBeTruthy();
    expect(solenoidPropsEqual(previous, {
      ...previous,
      config: { ...previous.config, waterFlow: !previous.config.waterFlow },
    })).toBeFalsy();
    expect(solenoidPropsEqual(previous, {
      ...previous,
      configPosition: {
        ...previous.configPosition,
        z: previous.configPosition.z + 1,
      },
    })).toBeFalsy();
    expect(solenoidPropsEqual(previous, {
      ...previous,
      config: {
        ...previous.config,
        zGantryOffset: previous.config.zGantryOffset + 1,
      },
    })).toBeFalsy();
  });
});
