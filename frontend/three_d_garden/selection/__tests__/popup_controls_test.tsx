import React from "react";
import { render } from "@testing-library/react";
import { ObjectPopupControls } from "../popup_controls";

describe("selection popup controls", () => {
  it("renders no controls for connectivity objects", () => {
    const props = {
      object: { kind: "connectivity" },
    } as unknown as React.ComponentProps<typeof ObjectPopupControls>;
    const { container } = render(<ObjectPopupControls {...props} />);

    expect(container).toBeEmptyDOMElement();
  });
});
