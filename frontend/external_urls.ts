enum Org {
  FarmBot = "FarmBot",
  FarmBotLabs = "FarmBot-Labs",
}

export enum FarmBotRepo {
  FarmBotWebApp = "Farmbot-Web-App",
  FarmBotOS = "farmbot_os",
  FarmBotArduinoFirmware = "farmbot-arduino-firmware",
}

enum FbosFile {
  featureMinVersions = "FEATURE_MIN_VERSIONS.json",
  osReleaseNotes = "RELEASE_NOTES.md",
}

export namespace ExternalUrl {
  const GITHUB = "https://github.com";
  const GITHUB_RAW = "https://raw.githubusercontent.com";
  const GITHUB_API = "https://api.github.com";
  const OPENFARM = "https://openfarm.cc";
  const SOFTWARE_DOCS = "https://software.farm.bot";
  const FORUM = "http://forum.farmbot.org";
  const SHOPIFY_CDN = "https://cdn.shopify.com/s/files/1/2040/0289/files";

  const FBOS_RAW = `${GITHUB_RAW}/${Org.FarmBot}/${FarmBotRepo.FarmBotOS}`;
  export const featureMinVersions = `${FBOS_RAW}/${FbosFile.featureMinVersions}`;
  export const osReleaseNotes = `${FBOS_RAW}/${FbosFile.osReleaseNotes}`;

  export const latestRelease =
    `${GITHUB_API}/repos/${Org.FarmBot}/${FarmBotRepo.FarmBotOS}/releases/latest`;

  export const gitHubFarmBot = `${GITHUB}/${Org.FarmBot}`;
  export const webAppRepo =
    `${GITHUB}/${Org.FarmBot}/${FarmBotRepo.FarmBotWebApp}`;

  export const softwareDocs = `${SOFTWARE_DOCS}/docs`;
  export const softwareForum = `${FORUM}/c/software`;

  export namespace OpenFarm {
    export const cropApi = `${OPENFARM}/api/v1/crops/`;
    export const cropBrowse = `${OPENFARM}/crops/`;
    export const newCrop = `${OPENFARM}/en/crops/new`;
  }

  export namespace Videos {
    export const desktop =
      `${SHOPIFY_CDN}/Farm_Designer_Loop.mp4?9552037556691879018`;
    export const mobile = `${SHOPIFY_CDN}/Controls.png?9668345515035078097`;
  }
}
