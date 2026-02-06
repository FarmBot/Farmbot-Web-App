let mockDev = false;
import { fakeState } from "../../__test_support__/fake_state";
import { store } from "../../redux/store";
const mockState = fakeState();

import React from "react";
import { mount, shallow } from "enzyme";
import { Feedback, SupportPanel } from "../support";
import axios from "axios";
import { DevSettings } from "../../settings/dev/dev_support";
import { success } from "../../toast/toast";
import { API } from "../../api";
import { Help } from "../../ui";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { Path } from "../../internal_urls";

let originalGetState: typeof store.getState;
let originalDispatch: typeof store.dispatch;
let futureFeaturesEnabledSpy: jest.SpyInstance;
let axiosPostSpy: jest.SpyInstance;

beforeEach(() => {
  originalGetState = store.getState;
  originalDispatch = store.dispatch;
  futureFeaturesEnabledSpy = jest.spyOn(DevSettings, "futureFeaturesEnabled")
    .mockImplementation(() => mockDev);
  axiosPostSpy = jest.spyOn(axios, "post").mockImplementation(() => Promise.resolve({}));
  (store as unknown as { getState: () => typeof mockState }).getState =
    () => mockState;
  (store as unknown as { dispatch: jest.Mock }).dispatch = jest.fn();
});

afterEach(() => {
  mockDev = false;
  futureFeaturesEnabledSpy.mockRestore();
  axiosPostSpy.mockRestore();
  (store as unknown as { getState: typeof store.getState }).getState =
    originalGetState;
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch =
    originalDispatch;
});

describe("<SupportPanel />", () => {
  it("renders", () => {
    const wrapper = mount(<SupportPanel />);
    expect(wrapper.text().toLowerCase()).toContain("support staff");
    expect(wrapper.text().toLowerCase()).not.toContain("priority");
  });

  it("renders priority support", () => {
    mockDev = true;
    const wrapper = mount(<SupportPanel />);
    expect(wrapper.text().toLowerCase()).toContain("priority");
  });
});

describe("<Feedback />", () => {
  it("sends feedback", async () => {
    API.setBaseUrl("");
    const device = fakeDevice();
    device.body.fb_order_number = "FB1234";
    mockState.resources = buildResourceIndex([device]);
    const wrapper = shallow(<Feedback />);
    wrapper.find("textarea").simulate("change", {
      currentTarget: { value: "abc" }
    });
    await wrapper.find("button").simulate("click");
    expect(axiosPostSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/feedback"),
      { message: "abc", slug: undefined },
    );
    expect(success).toHaveBeenCalledWith("Feedback sent.");
    expect(wrapper.find("button").hasClass("green")).toEqual(true);
    expect(wrapper.find("textarea").props().value).toEqual("");
  });

  it("sends but keeps feedback", async () => {
    API.setBaseUrl("");
    const wrapper = shallow(<Feedback keep={true} />);
    wrapper.find("textarea").simulate("change", {
      currentTarget: { value: "abc" }
    });
    await wrapper.find("button").simulate("click");
    expect(axiosPostSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/feedback"),
      { message: "abc", slug: undefined },
    );
    expect(success).toHaveBeenCalledWith("Feedback sent.");
    expect(wrapper.find("button").hasClass("gray")).toEqual(true);
    expect(wrapper.find("textarea").props().value).toEqual("abc");
    wrapper.find("button").simulate("click");
    expect(success).toHaveBeenCalledWith("Feedback already sent.");
  });

  it("navigates to order number input", () => {
    mockState.resources = buildResourceIndex([]);
    const wrapper = shallow(<Feedback keep={true} />);
    const link = mount(wrapper.find(Help).props().links?.[0] || <div />);
    link.find("a").simulate("click");
    expect(mockNavigate)
      .toHaveBeenCalledWith(Path.settings("order_number"));
  });
});
