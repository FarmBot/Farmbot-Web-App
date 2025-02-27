import React from "react";
import { render } from "@testing-library/react";
import { WaterTube } from "../water_tube";

describe("<WaterTube />", () => {
  it("renders", () => {
    const wrapper = render(<WaterTube
      name="mock-tube"
      args={[]}
      waterFlow={false} />);
    expect(wrapper.container).toContainHTML("mock-tube-tube");
    expect(wrapper.container).toContainHTML("mock-tube-water-stream");
  });

  it("handles undefined args", () => {
    const wrapper = render(<WaterTube
      name="mock-tube"
      args={undefined}
      waterFlow={false} />);
    expect(wrapper.container).toContainHTML("mock-tube-tube");
    expect(wrapper.container).toContainHTML("mock-tube-water-stream");
  });
});
