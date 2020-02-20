jest.unmock("../external_urls");
import { ExternalUrl } from "../external_urls";

/* tslint:disable:max-line-length */

describe("ExternalUrl", () => {
  it("returns urls", () => {
    expect(ExternalUrl.featureMinVersions)
      .toEqual("https://raw.githubusercontent.com/FarmBot/farmbot_os/staging/FEATURE_MIN_VERSIONS.json");
    expect(ExternalUrl.osReleaseNotes)
      .toEqual("https://raw.githubusercontent.com/FarmBot/farmbot_os/staging/RELEASE_NOTES.md");
    expect(ExternalUrl.latestRelease)
      .toEqual("https://api.github.com/repos/FarmBot/farmbot_os/releases/latest");
    expect(ExternalUrl.webAppRepo)
      .toEqual("https://github.com/FarmBot/Farmbot-Web-App");
    expect(ExternalUrl.gitHubFarmBot)
      .toEqual("https://github.com/FarmBot");
    expect(ExternalUrl.softwareDocs)
      .toEqual("https://software.farm.bot/docs");
    expect(ExternalUrl.softwareForum)
      .toEqual("https://forum.farmbot.org/c/software");
    expect(ExternalUrl.OpenFarm.cropApi)
      .toEqual("https://openfarm.cc/api/v1/crops/");
    expect(ExternalUrl.OpenFarm.cropBrowse)
      .toEqual("https://openfarm.cc/crops/");
    expect(ExternalUrl.OpenFarm.newCrop)
      .toEqual("https://openfarm.cc/en/crops/new");
    expect(ExternalUrl.Video.desktop)
      .toEqual("https://cdn.shopify.com/s/files/1/2040/0289/files/Farm_Designer_Loop.mp4?9552037556691879018");
    expect(ExternalUrl.Video.mobile)
      .toEqual("https://cdn.shopify.com/s/files/1/2040/0289/files/Controls.png?9668345515035078097");
  });
});
