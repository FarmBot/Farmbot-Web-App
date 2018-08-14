jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

const mockDevice = {
  moveAbsolute: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

let mockPath = "";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => { return mockPath.split("/"); }),
  history: { push: jest.fn() }
}));

import * as React from "react";
import { mount } from "enzyme";
import { MoveTo, MoveToProps, MoveToForm, MoveToFormProps } from "../move_to";
import { history } from "../../../history";
import { Actions } from "../../../constants";

describe("<MoveTo />", () => {
  beforeEach(function () {
    mockPath = "/app/designer/plants/move_to";
  });

  function fakeProps(): MoveToProps {
    return {
      chosenLocation: { x: 1, y: 2, z: 3 },
      currentBotLocation: { x: 10, y: 20, z: 30 },
      dispatch: jest.fn()
    };
  }

  it("moves to location: bot's current z value", () => {
    const wrapper = mount(<MoveTo {...fakeProps()} />);
    wrapper.find("button").simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 1, y: 2, z: 30 });
  });

  it("goes back", () => {
    const wrapper = mount(<MoveTo {...fakeProps()} />);
    wrapper.find("i").first().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
  });

  it("unmounts", () => {
    const p = fakeProps();
    const wrapper = mount(<MoveTo {...p} />);
    jest.clearAllMocks();
    wrapper.unmount();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: undefined, y: undefined, z: undefined }
    });
  });
});

describe("<MoveToForm />", () => {
  function fakeProps(): MoveToFormProps {
    return {
      chosenLocation: { x: 1, y: 2, z: 3 },
      currentBotLocation: { x: 10, y: 20, z: 30 },
    };
  }

  it("moves to location: custom z value", () => {
    const wrapper = mount(<MoveToForm {...fakeProps()} />);
    wrapper.setState({ z: 50 });
    wrapper.find("button").simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 1, y: 2, z: 50 });
  });
});
