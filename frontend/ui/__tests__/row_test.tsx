import React from "react";
import { render } from "@testing-library/react";
import { Row } from "../row";

describe("<Row />", () => {
  it("renders", () => {
    const { container } = render(<Row>text</Row>);
    expect(container.textContent).toContain("text");
  });
});
