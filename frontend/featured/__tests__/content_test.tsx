jest.mock("axios", () => ({
  get: () => Promise.resolve({
    data: [
      { id: 1, name: "name", description: "", path: "", color: "gray" },
    ]
  }),
}));

import React from "react";
import { mount } from "enzyme";
import { FeaturedSequencePage } from "../content";

describe("<FeaturedSequencePage />", () => {
  it("renders", async () => {
    const wrapper = await mount(<FeaturedSequencePage />);
    expect(wrapper.text().toLowerCase()).toContain("featured");
    expect(wrapper.text().toLowerCase()).toContain("name");
  });
});
