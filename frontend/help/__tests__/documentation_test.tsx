import React from "react";
import { mount } from "enzyme";
import {
  DocumentationPanel,
  DocumentationPanelProps,
  SoftwareDocsPanel,
  DeveloperDocsPanel,
  EducationDocsPanel,
  ExpressDocsPanel,
  GenesisDocsPanel,
  MetaDocsPanel,
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

describe("<GenesisDocsPanel />", () => {
  it("renders genesis docs", () => {
    location.search = "";
    const wrapper = mount(<GenesisDocsPanel />);
    expect(wrapper.find("iframe").props().src)
      .toEqual("https://genesis.farm.bot/docs");
  });
});

describe("<ExpressDocsPanel />", () => {
  it("renders express docs", () => {
    location.search = "";
    const wrapper = mount(<ExpressDocsPanel />);
    expect(wrapper.find("iframe").props().src)
      .toEqual("https://express.farm.bot/docs");
  });
});

describe("<MetaDocsPanel />", () => {
  it("renders meta docs", () => {
    location.search = "";
    const wrapper = mount(<MetaDocsPanel />);
    expect(wrapper.find("iframe").props().src)
      .toEqual("https://meta.farm.bot/docs");
  });
});

describe("<EducationDocsPanel />", () => {
  it("renders education docs", () => {
    location.search = "";
    const wrapper = mount(<EducationDocsPanel />);
    expect(wrapper.find("iframe").props().src)
      .toEqual("https://oer.farm.bot/docs");
  });
});
