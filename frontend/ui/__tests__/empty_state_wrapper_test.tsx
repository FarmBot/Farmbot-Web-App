import React from "react";
import { render } from "@testing-library/react";
import { EmptyStateWrapper, EmptyStateWrapperProps } from "../empty_state_wrapper";

describe("<EmptyStateWrapper />", () => {
  const fakeProps = (): EmptyStateWrapperProps => ({
    notEmpty: false,
    graphic: "graphic",
    text: "text",
  });

  it("renders", () => {
    const { container } = render(<EmptyStateWrapper {...fakeProps()} />);
    expect(container.textContent).toContain("text");
  });
});
