import React from "react";
import { mount } from "enzyme";
import {
  RawToursPanel as ToursPanel, mapStateToProps, ToursPanelProps,
} from "../panel";
import { clickButton } from "../../../__test_support__/helpers";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<ToursPanel />", () => {
  const fakeProps = (): ToursPanelProps => ({
    dispatch: jest.fn(),
  });

  it("renders tours panel", () => {
    const wrapper = mount(<ToursPanel {...fakeProps()} />);
    clickButton(wrapper, 0, "start tour");
    expect(mockNavigate).toHaveBeenCalledWith(
      "?tour=gettingStarted&tourStep=intro");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
