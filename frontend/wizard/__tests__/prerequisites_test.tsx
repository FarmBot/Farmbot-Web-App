let mockOnlineValue = true;
import React from "react";
import { mount, shallow } from "enzyme";
import { botOnlineReq, ProductRegistration } from "../prerequisites";
import { WizardStepComponentProps } from "../interfaces";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { bot } from "../../__test_support__/fake_state/bot";
import * as wizardActions from "../actions";
import * as mustBeOnline from "../../devices/must_be_online";

let setOrderNumberSpy: jest.SpyInstance;

beforeEach(() => {
  setOrderNumberSpy = jest.spyOn(wizardActions, "setOrderNumber")
    .mockImplementation(jest.fn());
  jest.spyOn(mustBeOnline, "isBotOnlineFromState")
    .mockImplementation(() => mockOnlineValue);
});

afterEach(() => {
  mockOnlineValue = true;
  jest.restoreAllMocks();
});
describe("<ProductRegistration />", () => {
  const fakeProps = (): WizardStepComponentProps => ({
    setStepSuccess: jest.fn(() => jest.fn()),
    resources: buildResourceIndex([fakeDevice()]).index,
    bot: bot,
    dispatch: mockDispatch(),
    getConfigValue: jest.fn(),
  });

  it("updates value", () => {
    const wrapper = shallow(<ProductRegistration {...fakeProps()} />);
    wrapper.find("BlurableInput").simulate("commit", {
      currentTarget: { value: "123" }
    });
    expect(setOrderNumberSpy).toHaveBeenCalledWith(expect.any(Object), "123");
  });
});

describe("botOnlineReq()", () => {
  it("returns offline message", () => {
    mockOnlineValue = false;
    const wrapper = mount(<botOnlineReq.indicator />);
    expect(wrapper.text().toLowerCase()).toContain("unable");
  });

  it("returns online message", () => {
    mockOnlineValue = true;
    const wrapper = mount(<botOnlineReq.indicator />);
    expect(wrapper.text().toLowerCase()).not.toContain("unable");
  });
});
