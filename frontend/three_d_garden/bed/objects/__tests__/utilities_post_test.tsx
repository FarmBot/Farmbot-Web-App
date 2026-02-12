import React from "react";
import { render } from "@testing-library/react";
import { UtilitiesPost, UtilitiesPostProps } from "../utilities_post";
import { INITIAL } from "../../../config";
import { clone } from "lodash";

describe("<UtilitiesPost />", () => {
  const fakeProps = (): UtilitiesPostProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const { container } = render(<UtilitiesPost {...fakeProps()} />);
    expect(container.innerHTML).toContain("utilities-post");
  });
});
