import React from "react";
import { t } from "../i18next_wrapper";
import { Content, SetupWizardContent } from "../constants";
import { FilePath } from "../internal_urls";
import { isMobile } from "../screen_size";

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
    computer: "Raspberry Pi 4",
    imageUrl: RPI4().imageUrl,
    releaseTag: RPI4().releaseTag,
    kits: [
      "Genesis v1.8",
      "Genesis XL v1.8",
      "Genesis v1.7",
      "Genesis XL v1.7",
      "Genesis v1.6.2 (white cable or 2 HDMI ports)",
      "Genesis XL v1.6.2 (white cable or 2 HDMI ports)",
      "Genesis v1.6.1 (white cable)",
      "Genesis XL v1.6.1 (white cable)",
    ],
  },
  {
    computer: "Raspberry Pi 3\nRaspberry Pi Zero 2 W",
    imageUrl: RPI3().imageUrl,
    releaseTag: RPI3().releaseTag,
    kits: [
      "Genesis v1.6 (black cable)",
      "Genesis XL v1.6 (black cable)",
      "Genesis v1.5",
      "Genesis XL v1.5",
      "Genesis v1.4",
      "Genesis XL v1.4",
      "Genesis v1.3",
      "Genesis v1.2",
      "Express v1.2 (USB)",
      "Express XL v1.2 (USB)",
      "Express v1.1 (USB)",
      "Express XL v1.1 (USB)",
    ],
  },
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
      <a className="transparent-button light" href={content.imageUrl}>
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
  {
    value: Model.Genesis,
    label: t("The gantry attaches to aluminum tracks"),
    image: "os_wizard/genesis",
  },
  {
    value: Model.Express,
    label: t("The gantry is set directly upon a raised bed"),
    image: "os_wizard/express",
  },
];

enum Version {
  "v1.0" = "v1.0",
  "v1.1" = "v1.1",
  "v1.2" = "v1.2",
  "v1.3" = "v1.3",
  "v1.4" = "v1.4",
  "v1.5" = "v1.5",
  "v1.6" = "v1.6",
  "v1.7" = "v1.7",
  "v1.8" = "v1.8",
}

const VERSIONS = () => ({
  [Model.Express]: [
    // Version["v1.2"],
    Version["v1.1"],
    Version["v1.0"],
  ],
  [Model.Genesis]: [
    Version["v1.8"],
    Version["v1.7"],
    Version["v1.6"],
    Version["v1.5"],
    Version["v1.4"],
    Version["v1.3"],
    Version["v1.2"],
  ],
});

enum Run {
  first = "first",
  second = "second",
  third = "third",
}

const RUNS = () => ({
  [Version["v1.6"]]: [
    {
      value: Run.first,
      label: t("Black"),
      image: "os_wizard/pi_power_cable_black",
      className: "black",
    },
    {
      value: Run.second,
      label: t("White"),
      image: "os_wizard/pi_power_cable_white",
      className: "white",
    },
  ]
});

enum Pi {
  three = "three",
  four = "four",
}

const PIS = () => ({
  [Version["v1.6"]]: [
    {
      value: Pi.three,
      label: t("Raspberry Pi Model 3"),
    },
    {
      value: Pi.four,
      label: t("Raspberry Pi Model 4"),
    },
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
    [Version["v1.2"]]: {
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
      [Run.third]: RPI4(),
    },
    [Version["v1.7"]]: {
      [Run.first]: RPI4(),
    },
    [Version["v1.8"]]: {
      [Run.first]: RPI4(),
    },
  }
});

const DownloadLink = (content: Partial<ReleaseItem>) =>
  <div className={"download-link grid"}>
    <p className={"os-download-wizard-note"}>
      {`${t("Your FarmBot's internal computer is the")} ${content.computer}`}</p>
    <a className="transparent-button light" href={content.imageUrl}>
      {`${t("DOWNLOAD")} v${content.releaseTag}`}
    </a>
  </div>;

interface SimpleButtonProps {
  click(): void;
  content: string | React.ReactNode;
  extraClass?: string;
}

const SimpleButton = (props: SimpleButtonProps) =>
  <div className={"download-wizard-button"}>
    <button className={`transparent-button light ${props.extraClass}`}
      onClick={props.click}>
      {props.content}
    </button>
  </div>;

interface ContentButtonProps {
  click(): void;
  content: string | React.ReactNode;
  extraClass?: string;
  label?: string;
  image?: string;
}

const ContentButton = (props: ContentButtonProps) =>
  <div className={"download-wizard-button"}>
    <button className={`os-wizard-content-button ${props.extraClass}`}
      onClick={props.click}>
      <div className={"btn-text"}>
        <p className={"btn-title"}
          style={props.label ? {} : { paddingBottom: "0.75rem" }}>
          {props.content}
        </p>
        {props.label &&
          <p className={"os-download-wizard-btn-label"}>
            {t(props.label)}
          </p>}
      </div>
      {props.image &&
        <img src={FilePath.image(props.image, "png")} />}
    </button>
  </div>;

interface OsDownloadWizardState {
  model?: Model;
  version?: Version;
  run?: Run;
  pi?: Pi;
}

interface OsDownloadWizardProps {
  wizard: boolean;
  setWizard(value: boolean): void;
}

class OsDownloadWizard
  extends React.Component<OsDownloadWizardProps, OsDownloadWizardState> {
  state: OsDownloadWizardState = {
    model: undefined,
    version: undefined,
    run: undefined,
    pi: undefined,
  };

  select =
    (update: Partial<OsDownloadWizardState>) =>
      () => this.setState({ ...this.state, ...update });

  back = ({ field }: { field: keyof OsDownloadWizardState }) =>
    <SimpleButton extraClass={"back"}
      click={this.select({ [field]: undefined })}
      content={<i className={"fa fa-arrow-left"} />} />;

  render() {
    const finalBack = () => {
      if (this.state.version != Version["v1.6"]) { return "version"; }
      if (this.state.pi) { return "pi"; }
      return "run";
    };
    if (!this.props.wizard) {
      return <div className={"os-download-wizard"}>
        <SimpleButton extraClass={"start"}
          click={() => this.props.setWizard(true)}
          content={t("Return to the wizard")} />
      </div>;
    }
    if (!this.state.model) {
      return <div className={"os-download-wizard"}>
        <div className={"os-download-wizard-model grid double-gap"}>
          <p className={"os-download-wizard-note"}>
            {t("Which FarmBot model do you have?")}
          </p>
          <div className={"buttons row double-gap"}>
            {MODELS().map(model =>
              <ContentButton key={model.value}
                click={this.select({ model: model.value })}
                content={t(model.value)}
                label={t(model.label)}
                image={model.image} />)}
          </div>
        </div>
      </div>;
    }
    if (!this.state.version) {
      return <div className={"os-download-wizard"}>
        <div className={"os-download-wizard-version"}>
          <p className={"os-download-wizard-note"}>
            {t(Content.SHIPPING_BOX_LABEL_PROMPT)}
          </p>
          {VERSIONS()[this.state.model].map(version =>
            <SimpleButton key={version}
              click={this.select({ version: version })}
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
            {t(Content.PI_POWER_CABLE_COLOR_PROMPT)}
          </p>
          <div className={"buttons row grid-2-col double-gap"}>
            {RUNS()[this.state.version].map(run =>
              <ContentButton key={run.value}
                click={this.select({ run: run.value })}
                content={t(run.label)}
                image={run.image}
                extraClass={run.className} />)}
          </div>
          <this.back field={"version"} />
        </div>
      </div>;
    }
    if (this.state.version == Version["v1.6"] && this.state.run != Run.second
      && !this.state.pi) {
      return <div className={"os-download-wizard"}>
        <div className={"os-download-wizard-run grid"}>
          <p className={"os-download-wizard-note"}>
            {t(SetupWizardContent.RPI)}
          </p>
          <img className="pi-image"
            src={FilePath.setupWizardImage("rpi_3_vs_4.jpg")} />
          <div className={"buttons row grid-2-col double-gap"}>
            {PIS()[Version["v1.6"]].map(pi =>
              <ContentButton key={pi.value}
                click={this.select({
                  run: pi.value == Pi.three ? Run.first : Run.third,
                  pi: pi.value,
                })}
                content={t(pi.label)} />)}
          </div>
          <this.back field={"run"} />
        </div>
      </div>;
    }
    if (this.state.version != Version["v1.6"] || this.state.run == Run.second
      || this.state.pi) {
      return <div className={"os-download-wizard"}>
        <p className={"os-download-wizard-note"}>
          {`${t("You have a FarmBot")} ${this.state.model} ${this.state.version}`}
        </p>
        <DownloadLink {...(DOWNLOADS()[this.state.model][
          this.state.version] as Record<Run, ReleaseItem>)[
          this.state.run || Run.first]} />
        <this.back field={finalBack()} />
      </div>;
    }
  }
}

export const OsDownloadPage = () => {
  const [wizard, setWizard] = React.useState(true);
  if (!isMobile()) {
    (document.querySelector("html") as HTMLElement).style.fontSize = "15px";
  }
  return <div className={"static-page os-download-page"}>
    <div className={"all-content-wrapper grid double-gap"}>
      <div className="header grid">
        <h1>{t("Download FarmBot OS")}</h1>
        <p className={"os-download-description"}>{t(Content.DOWNLOAD_FBOS)}</p>
      </div>
      <OsDownloadWizard wizard={wizard} setWizard={setWizard} />
      {wizard
        ? <SimpleButton extraClass={"wizard-btn"}
          click={() => setWizard(false)}
          content={t("Show all download links")} />
        : <OsDownloadTable />}
    </div>
  </div>;
};
