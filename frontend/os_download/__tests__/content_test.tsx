import * as React from "react";
import { mount } from "enzyme";
import { OsDownload } from "../content";

const DOWNLOAD_PREFIX = "DOWNLOAD ";

describe("<OsDownload />", () => {
  it("fetches and renders", async () => {
    globalConfig["rpi_release_url"] = "fake rpi img url";
    globalConfig["rpi_release_tag"] = "1.0.0";
    globalConfig["rpi3_release_url"] = "fake rpi3 img url";
    globalConfig["rpi3_release_tag"] = "1.0.1";
    const wrapper = await mount<OsDownload>(<OsDownload />);
    expect(wrapper.text()).toContain(DOWNLOAD_PREFIX + "v1.0.0");
    expect(wrapper.text()).toContain(DOWNLOAD_PREFIX + "v1.0.1");
    wrapper.update();
    expect(wrapper.find("a").first().props().href)
      .toEqual("fake rpi3 img url");
  });
});
