import * as React from "react";
import { t } from "../i18next_wrapper";
import { Content } from "../constants";

const downloadButtonText = (versionString: string) =>
  `${t("DOWNLOAD")} v${versionString}`;

export class OsDownload extends React.Component<{}, {}> {
  state = {};

  platformLink(platform: string) {
    const expressImgDownloadLink = globalConfig[`${platform}_release_url`];
    const expressTagName = globalConfig[`${platform}_release_tag`];
    return <a className="transparent-link-button"
      href={expressImgDownloadLink}>
      {downloadButtonText(expressTagName)}
    </a>;
  }

  render() {
    return <div className="static-page os-download-page">
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
            <tr>
              <td>
                <span>{"Genesis v1.2"}</span>
                <span>{"Genesis v1.3"}</span>
                <span>{"Genesis v1.4"}</span>
                <span>{"Genesis v1.5"}</span>
                <span>{"Genesis XL v1.4"}</span>
                <span>{"Genesis XL v1.5"}</span>
              </td>
              <td>{t("Raspberry Pi 3")}</td>
              <td>
                {this.platformLink("rpi3")}
              </td>
            </tr>
            <tr>
              <td>
                <span>{"Express v1.0"}</span>
                <span>{"Express XL v1.0"}</span>
              </td>
              <td>{t("Raspberry Pi Zero W")}</td>
              <td>
                {this.platformLink("rpi")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
  }
}
