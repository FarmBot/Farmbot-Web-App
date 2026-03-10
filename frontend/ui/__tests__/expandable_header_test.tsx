import React from "react";
import { render } from "@testing-library/react";
import { ExpandableHeader, ExpandableHeaderProps } from "../expandable_header";

describe("<ExpandableHeader />", () => {
  const fakeProps = (): ExpandableHeaderProps => ({
    onClick: jest.fn(),
    title: "title",
    expanded: true,
  });

  it("renders", () => {
    const { container } = render(<ExpandableHeader {...fakeProps()} />);
    expect(container.textContent).toContain("title");
  });
});
