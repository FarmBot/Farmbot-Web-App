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
import { ExternalUrl } from "../../external_urls";

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
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.softwareDocs);
  });

  it("navigates to specific doc page", () => {
    location.search = "?page=farmware";
    const wrapper = mount(<SoftwareDocsPanel />);
    expect(wrapper.find("iframe").props().src)
      .toEqual(ExternalUrl.softwareDocs + "/farmware");
  });
});

describe("<DeveloperDocsPanel />", () => {
  it("renders developer docs", () => {
    location.search = "";
    const wrapper = mount(<DeveloperDocsPanel />);
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.developerDocs);
  });
});

describe("<GenesisDocsPanel />", () => {
  it("renders genesis docs", () => {
    location.search = "";
    const wrapper = mount(<GenesisDocsPanel />);
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.genesisDocs);
  });
});

describe("<ExpressDocsPanel />", () => {
  it("renders express docs", () => {
    location.search = "";
    const wrapper = mount(<ExpressDocsPanel />);
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.expressDocs);
  });
});

describe("<MetaDocsPanel />", () => {
  it("renders meta docs", () => {
    location.search = "";
    const wrapper = mount(<MetaDocsPanel />);
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.metaDocs);
  });
});

describe("<EducationDocsPanel />", () => {
  it("renders education docs", () => {
    location.search = "";
    const wrapper = mount(<EducationDocsPanel />);
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.eduDocs);
  });
});
