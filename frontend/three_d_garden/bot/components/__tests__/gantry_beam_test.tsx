interface MockRef {
  current: {
    getWorldPosition: Function;
    copy: Function;
    target: {
      position: { copy: Function };
      updateMatrixWorld: Function;
    };
  } | undefined;
}
let mockRef: MockRef = {
  current: {
    getWorldPosition: jest.fn(),
    copy: jest.fn(() => ({ add: jest.fn() })),
    target: {
      position: { copy: jest.fn() },
      updateMatrixWorld: jest.fn(),
    },
  }
};
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: () => mockRef,
}));

import React from "react";
import { render } from "@testing-library/react";
import { INITIAL } from "../../../config";
import { clone } from "lodash";
import { GantryBeam, GantryBeamProps } from "../gantry_beam";
import { Shape, Texture } from "three";

describe("<GantryBeam />", () => {
  const fakeProps = (): GantryBeamProps => ({
    config: clone(INITIAL),
    beamShape: new Shape(),
    aluminumTexture: new Texture(),
  });

  it("renders beam", () => {
    const { container } = render(<GantryBeam {...fakeProps()} />);
    expect(container).toContainHTML("beam");
    expect(container).not.toContainHTML("light");
  });

  it("renders lights", () => {
    const p = fakeProps();
    p.config.light = true;
    const { container } = render(<GantryBeam {...p} />);
    expect(container).toContainHTML("beam");
    expect(container).toContainHTML("light");
  });

  it("renders alternative lights", () => {
    const p = fakeProps();
    p.config.light = true;
    p.config.kitVersion = "v1.8";
    const { container } = render(<GantryBeam {...p} />);
    expect(container).toContainHTML("beam");
    expect(container).toContainHTML("light");
  });

  it("renders debug helpers", () => {
    const p = fakeProps();
    p.config.light = true;
    p.config.lightsDebug = true;
    const { container } = render(<GantryBeam {...p} />);
    expect(container).toContainHTML("beam");
    expect(container).toContainHTML("light");
  });

  it("handles missing ref", () => {
    mockRef = { current: undefined };
    const p = fakeProps();
    p.config.light = true;
    const { container } = render(<GantryBeam {...p} />);
    expect(container).toContainHTML("beam");
    expect(container).toContainHTML("light");
  });
});
