import React from "react";
import { render } from "@testing-library/react";
import {
  People, peoplePropsEqual, PeopleProps, Person, personPropsEqual,
} from "../people";
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

  it("compares people-relevant inputs", () => {
    const p = fakeProps();
    p.config.people = true;
    p.people = [{ url: ASSETS.people.person1, offset: [1, 2] }];
    expect(peoplePropsEqual(p, {
      ...p,
      config: { ...p.config, sun: p.config.sun + 1 },
      people: [{ url: ASSETS.people.person1, offset: [1, 2] }],
    })).toBeTruthy();
    expect(peoplePropsEqual(p, {
      ...p,
      activeFocus: "Planter bed",
    })).toBeFalsy();
    expect(peoplePropsEqual(p, {
      ...p,
      config: { ...p.config, bedWidthOuter: p.config.bedWidthOuter + 1 },
    })).toBeFalsy();
    expect(peoplePropsEqual(p, {
      ...p,
      people: [{ url: ASSETS.people.person2, offset: [1, 2] }],
    })).toBeFalsy();
    expect(peoplePropsEqual(p, {
      ...p,
      people: [{ url: ASSETS.people.person1, offset: [1, 3] }],
    })).toBeFalsy();
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

  it("compares person image inputs", () => {
    expect(personPropsEqual({
      url: ASSETS.people.person2,
      position: [1, 2, 3],
      rotation: [4, 5, 6],
    }, {
      url: ASSETS.people.person2,
      position: [1, 2, 3],
      rotation: [4, 5, 6],
    })).toBeTruthy();
    expect(personPropsEqual({
      url: ASSETS.people.person2,
    }, {
      url: ASSETS.people.person3,
    })).toBeFalsy();
    expect(personPropsEqual({
      url: ASSETS.people.person2,
      position: [1, 2, 3],
    }, {
      url: ASSETS.people.person2,
      position: [1, 2, 4],
    })).toBeFalsy();
    expect(personPropsEqual({
      url: ASSETS.people.person2,
      rotation: [4, 5, 6],
    }, {
      url: ASSETS.people.person2,
      rotation: [4, 5, 7],
    })).toBeFalsy();
  });
});
