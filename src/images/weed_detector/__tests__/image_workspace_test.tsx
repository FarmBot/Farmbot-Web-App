import * as React from "react";
import { ImageWorkspace } from "../image_workspace";

describe("<Body/>", () => {
  function fakeProps() {
    return {
      onFlip: jest.fn(),
      onProcessPhoto: jest.fn(),
      onChange: jest.fn(),
      currentImage: undefined,
      images: [],
      iteration: 9,
      morph: 9,
      blur: 9,
      H_LO: 2,
      S_LO: 4,
      V_LO: 6,
      H_HI: 8,
      S_HI: 10,
      V_HI: 12
    }
  }

  it("triggers onChange() event", () => {
    jest.clearAllMocks();
    let props = fakeProps();
    let iw = new ImageWorkspace();
    iw.props = props;
    iw.onHslChange("H")([4, 5]);
    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange).toHaveBeenCalledWith("H_HI", 5)
    expect(props.onChange).toHaveBeenCalledWith("H_LO", 4);
  });
});
