jest.unmock("../external_urls");
import { ExternalUrl } from "../external_urls";

/* eslint-disable max-len */

describe("ExternalUrl", () => {
  it("returns urls", () => {
    expect(ExternalUrl.featureMinVersions)
      .toEqual("https://raw.githubusercontent.com/FarmBot/farmbot_os/staging/FEATURE_MIN_VERSIONS.json");
    expect(ExternalUrl.osReleaseNotes)
      .toEqual("https://raw.githubusercontent.com/FarmBot/farmbot_os/staging/RELEASE_NOTES.md");
    expect(ExternalUrl.webAppRepo)
      .toEqual("https://github.com/FarmBot/Farmbot-Web-App");
    expect(ExternalUrl.gitHubFarmBot)
      .toEqual("https://github.com/FarmBot");
    expect(ExternalUrl.softwareDocs)
      .toEqual("https://software.farm.bot/docs");
    expect(ExternalUrl.softwareForum)
      .toEqual("https://forum.farmbot.org/c/software");
    expect(ExternalUrl.Video.desktop)
      .toEqual("https://cdn.shopify.com/s/files/1/2040/0289/files/Farm_Designer_Loop.mp4?9552037556691879018");
    expect(ExternalUrl.Video.mobile)
      .toEqual("https://cdn.shopify.com/s/files/1/2040/0289/files/Controls.png?9668345515035078097");
    expect(ExternalUrl.Store.home)
      .toEqual("https://farm.bot");
    expect(ExternalUrl.myFarmBot)
      .toEqual("https://my.farm.bot");
    expect(ExternalUrl.Store.cameraCalibrationCard)
      .toEqual("https://farm.bot/products/camera-calibration-card");
    expect(ExternalUrl.openStreetMap(1, 2))
      .toEqual("https://www.openstreetmap.org/?mlat=1&mlon=2&zoom=10");
    // eslint-disable-next-line no-null/no-null
    expect(ExternalUrl.openStreetMap(null as unknown as undefined,
      // eslint-disable-next-line no-null/no-null
      null as unknown as undefined))
      .toEqual("https://www.openstreetmap.org");
  });
});
