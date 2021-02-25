let mockDev = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

jest.mock("axios", () => ({ post: jest.fn(() => Promise.resolve({})) }));

import React from "react";
import { mount, shallow } from "enzyme";
import { Feedback, SupportPanel } from "../support";
import axios from "axios";
import { success } from "../../toast/toast";
import { API } from "../../api";

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
    const wrapper = shallow(<Feedback />);
    wrapper.find("textarea").simulate("change", {
      currentTarget: { value: "abc" }
    });
    await wrapper.find("button").simulate("click");
    expect(axios.post).toHaveBeenCalledWith("http://localhost/api/feedback",
      { message: "abc" });
    expect(success).toHaveBeenCalledWith("Feedback sent.");
  });
});
