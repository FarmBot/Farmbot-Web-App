import * as React from "react";
import * as X from "../tile_write_peripheral";

describe("<TileWritePeripheral/>", () => {
  it("validates inputs", () => {
    expect(X.TileWritePeripheral({
      currentSequence: {},
      currentStep: {},
      dispatch: jest.fn(),
      index: 0,
      resources: {},
    }));
  })
});
