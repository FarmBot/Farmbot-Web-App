import React from "react";
import { render } from "@testing-library/react";
import { SelectedObjectRings } from "../overlay";

describe("selection overlay", () => {
  it("renders no rings for an empty selection", () => {
    const { container } = render(<SelectedObjectRings objects={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
