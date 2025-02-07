import React from "react";
import { render } from "@testing-library/react";
import { People, PeopleProps } from "../people";
import { INITIAL } from "../../../config";
import { clone } from "lodash";

describe("<People />", () => {
  const fakeProps = (): PeopleProps => ({
    activeFocus: "",
    config: clone(INITIAL),
    people: [],
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.people = true;
    const { container } = render(<People {...p} />);
    expect(container).toContainHTML("people");
  });
});
