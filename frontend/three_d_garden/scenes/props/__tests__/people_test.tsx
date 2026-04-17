import React from "react";
import { render } from "@testing-library/react";
import { People, PeopleProps, Person } from "../people";
import { ASSETS } from "../../../constants";
import { clone } from "lodash";
import { INITIAL } from "../../../config";

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

describe("<Person />", () => {
  it("renders image with transform props", () => {
    const { container } = render(
      <Person
        url={ASSETS.people.person2}
        position={[1, 2, 3]}
        rotation={[4, 5, 6]} />);
    expect(container.innerHTML).toContain(ASSETS.people.person2);
    expect(container.innerHTML).toContain("1,2,3");
    expect(container.innerHTML).toContain("4,5,6");
  });
});
