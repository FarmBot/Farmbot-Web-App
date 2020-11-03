import React from "react";
import { mount } from "enzyme";
import { OsDownloadPage } from "../content";

describe("<OsDownloadPage />", () => {
  it("renders", () => {
    globalConfig.rpi3_release_url = "fake rpi3 img url";
    globalConfig.rpi3_release_tag = "1.0.1";

    globalConfig.rpi_release_url = "fake rpi img url";
    globalConfig.rpi_release_tag = "1.0.0";

    const wrapper = mount(<OsDownloadPage />);

    const rpi3Link = wrapper.find("a").first();
    expect(rpi3Link.text()).toEqual("DOWNLOAD v1.0.1");
    expect(rpi3Link.props().href).toEqual("fake rpi3 img url");

    const rpiLink = wrapper.find("a").last();
    expect(rpiLink.text()).toEqual("DOWNLOAD v1.0.0");
    expect(rpiLink.props().href).toEqual("fake rpi img url");
  });
});
