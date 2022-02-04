import React from "react";
import { mount } from "enzyme";
import { OsDownloadPage } from "../content";
import { clickButton } from "../../__test_support__/helpers";

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

  it("doesn't show rpi4 releases", () => {
    globalConfig.rpi4_release_url = "fake rpi4 img url";
    globalConfig.rpi4_release_tag = "1.0.1";
    const wrapper = mount(<OsDownloadPage />);
    expect(wrapper.text().toLowerCase()).not.toContain("pi 4");
  });

  it("shows rpi4 releases", () => {
    globalConfig.rpi4_release_url = "fake rpi4 img url";
    globalConfig.rpi4_release_tag = "1.0.1";
    localStorage.setItem("rpi4", "true");
    const wrapper = mount(<OsDownloadPage />);
    expect(wrapper.text().toLowerCase()).toContain("pi 4");
  });

  it("toggles the wizard", () => {
    localStorage.setItem("rpi4", "true");
    const wrapper = mount(<OsDownloadPage />);
    expect(wrapper.text().toLowerCase()).not.toContain("show");
    clickButton(wrapper, 0, "try the wizard");
    expect(wrapper.text().toLowerCase()).toContain("show");
    expect(wrapper.text().toLowerCase()).not.toContain("zero");
    clickButton(wrapper, 3, "show all download links");
    expect(wrapper.text().toLowerCase()).toContain("zero");
  });

  it("exits the wizard", () => {
    localStorage.setItem("rpi4", "true");
    const wrapper = mount(<OsDownloadPage />);
    expect(wrapper.text().toLowerCase()).not.toContain("show");
    clickButton(wrapper, 0, "try the wizard");
    expect(wrapper.text().toLowerCase()).toContain("show");
    clickButton(wrapper, 2, "", { icon: "fa-arrow-left" });
    expect(wrapper.text().toLowerCase()).not.toContain("show");
  });

  it("runs the wizard: express", () => {
    localStorage.setItem("rpi4", "true");
    const wrapper = mount(<OsDownloadPage />);
    clickButton(wrapper, 0, "try the wizard");
    clickButton(wrapper, 1, "express");
    clickButton(wrapper, 0, "express v1.0");
    expect(wrapper.text().toLowerCase()).toContain("zero");
  });

  it("runs the wizard: genesis", () => {
    localStorage.setItem("rpi4", "true");
    const wrapper = mount(<OsDownloadPage />);
    clickButton(wrapper, 0, "try the wizard");
    clickButton(wrapper, 0, "genesis");
    clickButton(wrapper, 0, "genesis v1.2");
    expect(wrapper.text().toLowerCase()).toContain("pi 3");
  });

  it("runs the wizard: genesis v1.6.1", () => {
    localStorage.setItem("rpi4", "true");
    const wrapper = mount(<OsDownloadPage />);
    clickButton(wrapper, 0, "try the wizard");
    clickButton(wrapper, 0, "genesis");
    clickButton(wrapper, 4, "genesis v1.6");
    clickButton(wrapper, 1, "red cable");
    expect(wrapper.text().toLowerCase()).toContain("pi 4");
  });
});
