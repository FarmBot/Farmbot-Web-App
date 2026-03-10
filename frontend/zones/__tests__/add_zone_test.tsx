import React from "react";
import { render } from "@testing-library/react";
import {
  RawAddZone as AddZone, AddZoneProps, mapStateToProps,
} from "../add_zone";
import { fakeState } from "../../__test_support__/fake_state";

describe("<AddZone />", () => {
  const fakeProps = (): AddZoneProps => ({
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<AddZone {...fakeProps()} />);
    expect(container.textContent).toContain("Add");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
