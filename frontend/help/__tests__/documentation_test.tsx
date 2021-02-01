import React from "react";
import { mount } from "enzyme";
import {
  DocumentationPanel,
  DocumentationPanelProps,
  SoftwareDocsPanel,
  DeveloperDocsPanel,
} from "../documentation";

describe("<DocumentationPanel />", () => {
  const fakeProps = (): DocumentationPanelProps => ({
    url: "fake url",
  });

  it("renders iframe", () => {
    const wrapper = mount(<DocumentationPanel {...fakeProps()} />);
    expect(wrapper.find("iframe").props().src)
      .toEqual("fake url");
  });
});

describe("<SoftwareDocsPanel />", () => {
  it("renders software docs", () => {
    const wrapper = mount(<SoftwareDocsPanel />);
    expect(wrapper.find("iframe").props().src)
      .toEqual("https://software.farm.bot/docs");
  });

  it("navigates to specific doc page", () => {
    location.search = "?page=farmware";
    const wrapper = mount(<SoftwareDocsPanel />);
    expect(wrapper.find("iframe").props().src)
      .toEqual("https://software.farm.bot/docs/farmware");
  });
});

describe("<DeveloperDocsPanel />", () => {
  it("renders developer docs", () => {
    location.search = "";
    const wrapper = mount(<DeveloperDocsPanel />);
    expect(wrapper.find("iframe").props().src)
      .toEqual("https://developer.farm.bot/docs");
  });
});
