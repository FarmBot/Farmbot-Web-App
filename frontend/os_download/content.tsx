import * as React from "react";
import axios from "axios";
import { t } from "../i18next_wrapper";
import { GithubRelease } from "../devices/interfaces";
import { Content } from "../constants";

const LATEST_RELEASE_URL =
  "https://api.github.com/repos/farmbot/farmbot_os/releases/latest";

interface OsDownloadState {
  tagName: string;
  genesisImg: string;
  expressImg: string;
}

const getImgLink = (assets: GithubRelease["assets"], target: string) =>
  assets.filter(asset => asset.name.includes("img")
    && asset.name.includes(target))[0]?.browser_download_url || "";

const tagNameFromUrl = (url: string) => {
  const tagPart = url.split("/")[7] || "";
  return tagPart.startsWith("v") ? tagPart : "";
};

export class OsDownload extends React.Component<{}, OsDownloadState> {
  state: OsDownloadState = { tagName: "", genesisImg: "", expressImg: "" };

  get genesisTagName() {
    return this.state.tagName || tagNameFromUrl(this.genesisImgDownloadLink);
  }

  get expressTagName() {
    return this.state.tagName || tagNameFromUrl(this.expressImgDownloadLink);
  }

  get genesisImgDownloadLink() {
    return globalConfig.GENESIS_IMG_OVERRIDE ||
      this.state.genesisImg ||
      globalConfig.GENESIS_IMG_FALLBACK || "";
  }

  get expressImgDownloadLink() {
    return globalConfig.EXPRESS_IMG_OVERRIDE ||
      this.state.expressImg ||
      globalConfig.EXPRESS_IMG_FALLBACK || "";
  }

  fetchLatestRelease = () =>
    axios.get<GithubRelease>(LATEST_RELEASE_URL)
      .then(resp =>
        this.setState({
          tagName: resp.data.tag_name,
          genesisImg: getImgLink(resp.data.assets, "rpi3"),
          expressImg: getImgLink(resp.data.assets, "rpi-"),
        })).catch(() => { });

  componentDidMount() { this.fetchLatestRelease(); }

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
                <span>{"Genesis XL v1.4"}</span>
                <span>{"Genesis v1.5"}</span>
                <span>{"Genesis XL v1.5"}</span>
              </td>
              <td>{t("Raspberry Pi 3")}</td>
              <td>
                <a className="transparent-link-button"
                  href={this.genesisImgDownloadLink}>
                  {`${t("Download")} FBOS ${this.genesisTagName}`}
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <span>{"Express v1.0"}</span>
                <span>{"Express XL v1.0"}</span>
              </td>
              <td>{t("Raspberry Pi Zero W")}</td>
              <td>
                <a className="transparent-link-button"
                  href={this.expressImgDownloadLink}>
                  {`${t("Download")} FBOS ${this.expressTagName}`}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
  }
}
