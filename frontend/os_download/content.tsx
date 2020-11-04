import React from "react";
import { t } from "../i18next_wrapper";
import { Content } from "../constants";

interface PlatformContent {
  imageUrl: string;
  releaseTag: string;
  kits: string[];
  computer: string;
}

const PLATFORM_DATA = (): PlatformContent[] => [
  {
    computer: "Raspberry Pi 3",
    imageUrl: globalConfig.rpi3_release_url,
    releaseTag: globalConfig.rpi3_release_tag,
    kits: [
      "Genesis v1.2",
      "Genesis v1.3",
      "Genesis v1.4",
      "Genesis v1.5",
      "Genesis XL v1.4",
      "Genesis XL v1.5",
    ],
  },
  {
    computer: "Raspberry Pi Zero W",
    imageUrl: globalConfig.rpi_release_url,
    releaseTag: globalConfig.rpi_release_tag,
    kits: [
      "Express v1.0",
      "Express XL v1.0",
    ],
  },
];

const OsDownloadRow = (content: PlatformContent) =>
  <tr key={content.computer}>
    <td>
      {content.kits.map(kit => <span key={kit}>{kit}</span>)}
    </td>
    <td>
      {content.computer}
    </td>
    <td>
      <a className="transparent-link-button" href={content.imageUrl}>
        {`${t("DOWNLOAD")} v${content.releaseTag}`}
      </a>
    </td>
  </tr>;

export const OsDownloadPage = () =>
  <div className="static-page os-download-page">
    <div className="all-content-wrapper">
      <h1>{t("Download FarmBot OS")}</h1>
      <p>{t(Content.DOWNLOAD_FBOS)}</p>
      <table>
        <thead>
          <tr>
            <th>{t("FarmBot Kit")}</th>
            <th>{t("Internal Computer")}</th>
            <th>{t("Download Link")}</th>
          </tr>
        </thead>
        <tbody>
          {PLATFORM_DATA().map(OsDownloadRow)}
        </tbody>
      </table>
    </div>
  </div>;
