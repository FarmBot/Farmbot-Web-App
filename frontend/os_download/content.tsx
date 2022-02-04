import React from "react";
import { t } from "../i18next_wrapper";
import { Content } from "../constants";

interface ReleaseItem {
  computer: string;
  imageUrl: string;
  releaseTag: string;
}

const RPIZ = (): ReleaseItem => ({
  computer: "Raspberry Pi Zero W",
  imageUrl: globalConfig.rpi_release_url,
  releaseTag: globalConfig.rpi_release_tag,
});

const RPIZ2 = (): ReleaseItem => ({
  computer: "Raspberry Pi Zero 2 W",
  imageUrl: globalConfig.rpi3_release_url,
  releaseTag: globalConfig.rpi3_release_tag,
});

const RPI3 = (): ReleaseItem => ({
  computer: "Raspberry Pi 3",
  imageUrl: globalConfig.rpi3_release_url,
  releaseTag: globalConfig.rpi3_release_tag,
});

const RPI4 = (): ReleaseItem => ({
  computer: "Raspberry Pi 4",
  imageUrl: globalConfig.rpi4_release_url,
  releaseTag: globalConfig.rpi4_release_tag,
});

interface PlatformContent {
  imageUrl: string | undefined;
  releaseTag: string;
  kits: string[];
  computer: string;
}

const PLATFORM_DATA = (): PlatformContent[] => [
  {
    computer: localStorage.getItem("rpi4")
      ? "Raspberry Pi 3\nRaspberry Pi Zero 2 W"
      : "Raspberry Pi 3",
    imageUrl: RPI3().imageUrl,
    releaseTag: RPI3().releaseTag,
    kits: [
      "Genesis v1.2",
      "Genesis v1.3",
      "Genesis v1.4",
      "Genesis v1.5",
      "Genesis v1.6",
      "Genesis XL v1.4",
      "Genesis XL v1.5",
      "Genesis XL v1.6",
      ...(localStorage.getItem("rpi4") ? ["Express v1.1 (USB)"] : []),
      ...(localStorage.getItem("rpi4") ? ["Express XL v1.1 (USB)"] : []),
    ],
  },
  ...(localStorage.getItem("rpi4")
    ? [{
      computer: "Raspberry Pi 4",
      imageUrl: RPI4().imageUrl,
      releaseTag: RPI4().releaseTag,
      kits: [
        "Genesis v1.6.1 (red cable)",
        "Genesis XL v1.6.1 (red cable)",
      ],
    }]
    : []),
  {
    computer: "Raspberry Pi Zero W",
    imageUrl: RPIZ().imageUrl,
    releaseTag: RPIZ().releaseTag,
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

const OsDownloadTable = () =>
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
  </table>;

enum Model {
  Genesis = "Genesis",
  Express = "Express",
}

const MODELS = () => [
  { value: Model.Genesis, label: t("The gantry attaches to aluminum tracks.") },
  { value: Model.Express, label: t("The gantry is set directly upon a raised bed.") },
];

enum Version {
  "v1.0" = "v1.0",
  "v1.1" = "v1.1",
  "v1.2" = "v1.2",
  "v1.3" = "v1.3",
  "v1.4" = "v1.4",
  "v1.5" = "v1.5",
  "v1.6" = "v1.6",
}

const VERSIONS = () => ({
  [Model.Express]: [
    Version["v1.0"],
    Version["v1.1"],
  ],
  [Model.Genesis]: [
    Version["v1.2"],
    Version["v1.3"],
    Version["v1.4"],
    Version["v1.5"],
    Version["v1.6"],
  ],
});

enum Run {
  first = "first",
  second = "second",
}

const RUNS = () => ({
  [Version["v1.6"]]: [
    { value: Run.first, label: t("black cable") },
    { value: Run.second, label: t("red cable") },
  ]
});

type Downloads = Record<Model,
  Partial<Record<Version,
    Partial<Record<Run, ReleaseItem>>>>>;

const DOWNLOADS = (): Downloads => ({
  [Model.Express]: {
    [Version["v1.0"]]: {
      [Run.first]: RPIZ(),
    },
    [Version["v1.1"]]: {
      [Run.first]: RPIZ2(),
    },
  },
  [Model.Genesis]: {
    [Version["v1.2"]]: {
      [Run.first]: RPI3(),
    },
    [Version["v1.3"]]: {
      [Run.first]: RPI3(),
    },
    [Version["v1.4"]]: {
      [Run.first]: RPI3(),
    },
    [Version["v1.5"]]: {
      [Run.first]: RPI3(),
    },
    [Version["v1.6"]]: {
      [Run.first]: RPI3(),
      [Run.second]: RPI4(),
    },
  }
});

const DownloadLink = (content: Partial<ReleaseItem>) =>
  <div className={"download-link"}>
    <p className={"os-download-wizard-note"}>
      {`${t("Your FarmBot's internal computer is the")} ${content.computer}`}</p>
    <a className="transparent-link-button" href={content.imageUrl}>
      {`${t("DOWNLOAD")} v${content.releaseTag}`}
    </a>
  </div>;

interface ButtonProps {
  click(): void;
  content: string | JSX.Element;
  extraClass?: string;
  label?: string;
}

const Button = (props: ButtonProps) =>
  <div className={"download-wizard-button"}>
    <button className={`transparent-button ${props.extraClass}`}
      onClick={props.click}>
      {props.content}
    </button>
    {props.label &&
      <p className={"os-download-wizard-btn-label"}>
        {t(props.label)}
      </p>}
  </div>;

interface OsDownloadWizardState {
  model?: Model;
  version?: Version;
  run?: Run;
}

interface OsDownloadWizardProps {
  wizard: boolean;
  setWizard(value: boolean): void;
}

export class OsDownloadWizard
  extends React.Component<OsDownloadWizardProps, OsDownloadWizardState> {
  state: OsDownloadWizardState = {
    model: undefined,
    version: undefined,
    run: undefined,
  };

  select =
    (key: keyof OsDownloadWizardState,
      value: boolean | Run | Model | Version | undefined) =>
      () => this.setState({ ...this.state, [key]: value });

  back = ({ field }: { field: keyof OsDownloadWizardState }) =>
    <Button extraClass={"back"}
      click={this.select(field, undefined)}
      content={<i className={"fa fa-arrow-left"} />} />;

  render() {
    if (!localStorage.rpi4) { return <div />; }
    if (!this.props.wizard) {
      return <div className={"os-download-wizard"}>
        <Button extraClass={"start"}
          click={() => this.props.setWizard(true)}
          content={t("Try the wizard")} />
      </div>;
    }
    if (!this.state.model) {
      return <div className={"os-download-wizard"}>
        <div className={"os-download-wizard-model"}>
          <p className={"os-download-wizard-note"}>
            {t("Which FarmBot model do you have?")}
          </p>
          {MODELS().map(model =>
            <Button key={model.value}
              click={this.select("model", model.value)}
              content={t(model.value)}
              label={t(model.label)} />)}
          <Button extraClass={"back"}
            click={() => this.props.setWizard(false)}
            content={<i className={"fa fa-arrow-left"} />} />
        </div>
      </div>;
    }
    if (!this.state.version) {
      return <div className={"os-download-wizard"}>
        <div className={"os-download-wizard-version"}>
          <p className={"os-download-wizard-note"}>
            {t("Check side of shipping box. What is the labeled version?")}
          </p>
          {VERSIONS()[this.state.model].map(version =>
            <Button key={version}
              click={this.select("version", version)}
              content={`${this.state.model} ${t(version)}`} />)}
          <this.back field={"model"} />
        </div>
      </div>;
    }
    if (this.state.version == Version["v1.6"] &&
      !this.state.run) {
      return <div className={"os-download-wizard"}>
        <div className={"os-download-wizard-run"}>
          <p className={"os-download-wizard-note"}>
            {t("Check inside of the electronics box.") + " " +
              t("What color cable do you see at the top?")}
          </p>
          {RUNS()[this.state.version].map(run =>
            <Button key={run.value}
              click={this.select("run", run.value)}
              content={t(run.label)} />)}
          <this.back field={"version"} />
        </div>
      </div>;
    }
    if (this.state.version != Version["v1.6"] || this.state.run) {
      return <div className={"os-download-wizard"}>
        <p className={"os-download-wizard-note"}>
          {`${t("You have a FarmBot")} ${this.state.model} ${this.state.version}`}
        </p>
        <DownloadLink {...(DOWNLOADS()[this.state.model][
          this.state.version] as Record<Run, ReleaseItem>)[
          this.state.run || Run.first]} />
        <this.back field={this.state.version == Version["v1.6"]
          ? "run"
          : "version"} />
      </div>;
    }
  }
}

export const OsDownloadPage = () => {
  const [wizard, setWizard] = React.useState(false);
  return <div className={"static-page os-download-page"}>
    <div className={"all-content-wrapper"}>
      <h1>{t("Download FarmBot OS")}</h1>
      <p>{t(Content.DOWNLOAD_FBOS)}</p>
      <OsDownloadWizard wizard={wizard} setWizard={setWizard} />
      {wizard
        ? <Button extraClass={"wizard-btn"}
          click={() => setWizard(false)}
          content={t("Show all download links")} />
        : <OsDownloadTable />}
    </div>
  </div>;
};
