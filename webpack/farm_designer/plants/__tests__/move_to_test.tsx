jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

const mockDevice = {
  moveAbsolute: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount } from "enzyme";
import { MoveTo, MoveToProps } from "../move_to";

describe("<MoveTo />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
    Object.defineProperty(location, "pathname", {
      value: "/app/designer/plants/move_to"
    });
  });

  function fakeProps(): MoveToProps {
    return {
      chosenLocation: { x: 1, y: 2, z: 3 },
      currentBotLocation: { x: 10, y: 20, z: 30 },
      dispatch: jest.fn()
    };
  }

  it("moves to location: bot's current z value", () => {
    const wrapper = mount(<MoveTo {...fakeProps() } />);
    wrapper.find("button").simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 1, y: 2, z: 30 });
  });

  it("moves to location: custom z value", () => {
    const wrapper = mount(<MoveTo {...fakeProps() } />);
    wrapper.setState({ z: 50 });
    wrapper.find("button").simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 1, y: 2, z: 50 });
  });

});
