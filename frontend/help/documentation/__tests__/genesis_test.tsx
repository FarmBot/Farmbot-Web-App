import React from "react";
import { mount } from "enzyme";
import { GenesisDocsPanel } from "../genesis";
import { ExternalUrl } from "../../../external_urls";

describe("<GenesisDocsPanel />", () => {
  it("renders genesis docs", () => {
    location.search = "";
    const wrapper = mount(<GenesisDocsPanel />);
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.genesisDocs);
  });
});
