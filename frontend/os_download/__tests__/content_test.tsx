let mockIsMobile = false;
jest.mock("../../screen_size", () => ({
  isMobile: () => mockIsMobile,
}));

import React from "react";
import { mount } from "enzyme";
import { OsDownloadPage } from "../content";
import { clickButton } from "../../__test_support__/helpers";

describe("<OsDownloadPage />", () => {
  it("renders", () => {
    globalConfig.rpi4_release_url = "fake rpi4 img url";
    globalConfig.rpi4_release_tag = "1.0.1";

    globalConfig.rpi_release_url = "fake rpi img url";
    globalConfig.rpi_release_tag = "1.0.0";

    const wrapper = mount(<OsDownloadPage />);
    clickButton(wrapper, 2, "show all download links");

    const rpi3Link = wrapper.find("a").first();
    expect(rpi3Link.text()).toEqual("DOWNLOAD v1.0.1");
    expect(rpi3Link.props().href).toEqual("fake rpi4 img url");

    const rpiLink = wrapper.find("a").last();
    expect(rpiLink.text()).toEqual("DOWNLOAD v1.0.0");
    expect(rpiLink.props().href).toEqual("fake rpi img url");
  });

  it("renders on small screens", () => {
    mockIsMobile = true;
    const wrapper = mount(<OsDownloadPage />);
    expect(wrapper.text().toLowerCase()).toContain("download");
  });

  it("renders on large screens", () => {
    mockIsMobile = false;
    const wrapper = mount(<OsDownloadPage />);
    expect(wrapper.text().toLowerCase()).toContain("download");
  });

  it("toggles the wizard", () => {
    const wrapper = mount(<OsDownloadPage />);
    expect(wrapper.text().toLowerCase()).toContain("show");
    expect(wrapper.text().toLowerCase()).not.toContain("return");
    clickButton(wrapper, 2, "show all download links");
    expect(wrapper.text().toLowerCase()).not.toContain("show");
    expect(wrapper.text().toLowerCase()).toContain("return");
    clickButton(wrapper, 0, "return to the wizard");
    expect(wrapper.text().toLowerCase()).toContain("show");
    expect(wrapper.text().toLowerCase()).not.toContain("return");
  });

  it("runs the wizard: express", () => {
    const wrapper = mount(<OsDownloadPage />);
    clickButton(wrapper, 1, "express", { partial_match: true });
    clickButton(wrapper, 1, "express v1.0");
    expect(wrapper.text().toLowerCase()).toContain("zero");
  });

  it("runs the wizard: genesis", () => {
    const wrapper = mount(<OsDownloadPage />);
    clickButton(wrapper, 0, "genesis", { partial_match: true });
    clickButton(wrapper, 5, "genesis v1.2");
    expect(wrapper.text().toLowerCase()).toContain("pi 3");
  });

  it("runs the wizard: genesis v1.6.0", () => {
    const wrapper = mount(<OsDownloadPage />);
    clickButton(wrapper, 0, "genesis", { partial_match: true });
    clickButton(wrapper, 1, "genesis v1.6");
    clickButton(wrapper, 0, "black");
    clickButton(wrapper, 0, "raspberry pi model 3");
    expect(wrapper.text().toLowerCase()).toContain("pi 3");
  });

  it("runs the wizard: genesis v1.6.1 & some v1.6.2", () => {
    const wrapper = mount(<OsDownloadPage />);
    clickButton(wrapper, 0, "genesis", { partial_match: true });
    clickButton(wrapper, 1, "genesis v1.6");
    clickButton(wrapper, 1, "white");
    expect(wrapper.text().toLowerCase()).toContain("pi 4");
  });

  it("runs the wizard: genesis other v1.6.2", () => {
    const wrapper = mount(<OsDownloadPage />);
    clickButton(wrapper, 0, "genesis", { partial_match: true });
    clickButton(wrapper, 1, "genesis v1.6");
    clickButton(wrapper, 0, "black");
    clickButton(wrapper, 1, "raspberry pi model 4");
    expect(wrapper.text().toLowerCase()).toContain("pi 4");
  });

  it("runs the wizard: genesis v1.7", () => {
    const wrapper = mount(<OsDownloadPage />);
    clickButton(wrapper, 0, "genesis", { partial_match: true });
    clickButton(wrapper, 0, "genesis v1.7");
    expect(wrapper.text().toLowerCase()).toContain("pi 4");
  });
});
