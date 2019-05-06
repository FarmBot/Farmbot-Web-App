import React from "react";
import { t } from "../i18next_wrapper";
import {
  AlertCardProps, AlertCardTemplateProps, FirmwareMissingProps,
  SeedDataMissingProps, SeedDataMissingState, TourNotTakenProps,
  CommonAlertCardProps,
  DismissAlertProps,
  Bulletin,
  BulletinAlertState
} from "./interfaces";
import { formatLogTime } from "../logs";
import {
  FlashFirmwareBtn
} from "../devices/components/fbos_settings/firmware_hardware_status";
import { DropDownItem, Row, Col, FBSelect, docLink, Markdown } from "../ui";
import { Content } from "../constants";
import { TourList } from "../help/tour_list";
import { splitProblemTag } from "./alerts";
import { destroy } from "../api/crud";
import {
  isFwHardwareValue
} from "../devices/components/fbos_settings/board_type";
import { updateConfig } from "../devices/actions";
import { fetchBulletinContent, seedAccount } from "./actions";
import { startCase } from "lodash";
import { DevSettings } from "../account/dev/dev_support";

export const AlertCard = (props: AlertCardProps) => {
  const { alert, timeSettings, findApiAlertById, dispatch } = props;
  const commonProps = { alert, timeSettings, findApiAlertById, dispatch };
  switch (alert.problem_tag) {
    case "farmbot_os.firmware.missing":
      return <FirmwareMissing {...commonProps}
        apiFirmwareValue={props.apiFirmwareValue} />;
    case "api.seed_data.missing":
      return <SeedDataMissing {...commonProps}
        dispatch={dispatch} />;
    case "api.tour.not_taken":
      return <TourNotTaken {...commonProps}
        dispatch={dispatch} />;
    case "api.user.not_welcomed":
      return <UserNotWelcomed {...commonProps} />;
    case "api.documentation.unread":
      return <DocumentationUnread {...commonProps} />;
    case "api.bulletin.unread":
      return <BulletinAlert {...commonProps} />;
    default:
      return <UnknownAlert {...commonProps} />;
  }
};
const dismissAlert = (props: DismissAlertProps) => () =>
  (props.id && props.findApiAlertById && props.dispatch) &&
  props.dispatch(destroy(props.findApiAlertById(props.id)));

const timeOk = (timestamp: number) => timestamp > 1550000000;

const AlertCardTemplate = (props: AlertCardTemplateProps) => {
  const { alert, findApiAlertById, dispatch } = props;
  return <div className={`problem-alert ${props.className}`}>
    <div className="problem-alert-title">
      <i className={`fa fa-${props.iconName || "exclamation-triangle"}`} />
      <h3>{t(props.title)}</h3>
      {timeOk(alert.created_at) &&
        <p>{formatLogTime(alert.created_at, props.timeSettings)}</p>}
      {alert.id && <i className="fa fa-times"
        onClick={dismissAlert({ id: alert.id, findApiAlertById, dispatch })} />}
    </div>
    <div className="problem-alert-content">
      <Markdown>{t(props.message)}</Markdown>
      {props.children}
    </div>
  </div>;
};

const ICON_LOOKUP: { [x: string]: string } = {
  "info": "info-circle",
  "success": "check-square",
  "warn": "exclamation-triangle",
};

class BulletinAlert
  extends React.Component<CommonAlertCardProps, BulletinAlertState> {
  state: BulletinAlertState = { bulletin: undefined, no_content: false };

  componentDidMount() {
    fetchBulletinContent(this.props.alert.slug)
      .then(bulletin => bulletin
        ? this.setState({ bulletin })
        : this.setState({ no_content: true }));
  }

  get bulletinData(): Bulletin {
    return this.state.bulletin || {
      content: this.state.no_content ? t("Unable to load content.")
        : t("Loading..."),
      href: undefined,
      href_label: undefined,
      type: "info",
      slug: this.props.alert.slug,
      title: undefined,
    };
  }

  render() {
    const { content, href, href_label, type, title } = this.bulletinData;
    return <AlertCardTemplate
      alert={this.props.alert}
      className={"bulletin-alert"}
      title={title || startCase(this.props.alert.slug)}
      iconName={ICON_LOOKUP[type] || "info-circle"}
      message={t(content)}
      timeSettings={this.props.timeSettings}
      dispatch={this.props.dispatch}
      findApiAlertById={this.props.findApiAlertById}>
      {href && <a className="link-button fb-button green"
        href={href} target="_blank"
        title={t("Open link in a new tab")}>
        {href_label || t("Find out more")}
      </a>}
    </AlertCardTemplate>;
  }
}

const UnknownAlert = (props: CommonAlertCardProps) => {
  const { problem_tag, created_at, priority } = props.alert;
  const { author, noun, verb } = splitProblemTag(problem_tag);
  const createdAt = formatLogTime(created_at, props.timeSettings);
  return <AlertCardTemplate
    alert={props.alert}
    className={"unknown-alert"}
    title={`${t(noun)}: ${t(verb)} (${t(author)})`}
    message={t("Unknown problem of priority {{priority}} created at {{createdAt}}",
      { priority, createdAt })}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById} />;
};

const FIRMWARE_CHOICES: DropDownItem[] = [
  { label: "Arduino/RAMPS (Genesis v1.2)", value: "arduino" },
  { label: "Farmduino (Genesis v1.3)", value: "farmduino" },
  { label: "Farmduino (Genesis v1.4)", value: "farmduino_k14" },
  { label: "Farmduino (Express v1.0)", value: "express_k10" },
];

const FIRMWARE_CHOICES_DDI: { [x: string]: DropDownItem } = {};
FIRMWARE_CHOICES.map(x => FIRMWARE_CHOICES_DDI[x.value] = x);

const FirmwareChoiceTable = () =>
  <table className="firmware-hardware-choice-table">
    <thead>
      <tr>
        <th>{t("FarmBot Version")}</th>
        <th>{t("Electronics Board")}</th>
        <th>{t("Firmware Name")}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{"Genesis v1.2"}</td>
        <td>{"RAMPS"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["arduino"].label}</code></td>
      </tr>
      <tr>
        <td>{"Genesis v1.3"}</td>
        <td>{"Farmduino"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["farmduino"].label}</code></td>
      </tr>
      <tr>
        <td>{"Genesis v1.4"}</td>
        <td>{"Farmduino"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["farmduino_k14"].label}</code></td>
      </tr>
      <tr>
        <td>{"Express v1.0"}</td>
        <td>{"Farmduino"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["express_k10"].label}</code></td>
      </tr>
    </tbody>
  </table>;

export const changeFirmwareHardware = (dispatch: Function | undefined) =>
  (ddi: DropDownItem) => {
    if (isFwHardwareValue(ddi.value)) {
      dispatch && dispatch(updateConfig({ firmware_hardware: ddi.value }));
    }
  };

const FirmwareMissing = (props: FirmwareMissingProps) =>
  <AlertCardTemplate
    alert={props.alert}
    className={"firmware-missing-alert"}
    title={t("Your device has no firmware")}
    message={t(Content.FIRMWARE_MISSING)}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById}>
    <Row>
      <FirmwareChoiceTable />
      <Col xs={4}>
        <label>{t("Choose Firmware")}</label>
      </Col>
      <Col xs={5}>
        <FBSelect
          key={props.apiFirmwareValue}
          list={FIRMWARE_CHOICES}
          selectedItem={FIRMWARE_CHOICES_DDI[props.apiFirmwareValue || "arduino"]}
          onChange={changeFirmwareHardware(props.dispatch)} />
      </Col>
      <Col xs={3}>
        <FlashFirmwareBtn
          apiFirmwareValue={props.apiFirmwareValue}
          botOnline={true} />
      </Col>
    </Row>
  </AlertCardTemplate>;

const SEED_DATA_OPTIONS = (): DropDownItem[] => [
  { label: "Genesis v1.2", value: "genesis_1.2" },
  { label: "Genesis v1.3", value: "genesis_1.3" },
  { label: "Genesis v1.4", value: "genesis_1.4" },
  { label: "Genesis v1.4 XL", value: "genesis_xl_1.4" },
  ...(DevSettings.futureFeaturesEnabled() ? [
    { label: "Express v1.0", value: "express_1.0" },
    { label: "Express v1.0 XL", value: "express_xl_1.0" },
  ] : []),
  { label: "Custom Bot", value: "none" },
];

const SEED_DATA_OPTIONS_DDI: Record<string, DropDownItem> = {};
SEED_DATA_OPTIONS().map(ddi => SEED_DATA_OPTIONS_DDI[ddi.value] = ddi);

class SeedDataMissing
  extends React.Component<SeedDataMissingProps, SeedDataMissingState> {
  state: SeedDataMissingState = { selection: "" };

  get dismiss() {
    const { alert, findApiAlertById, dispatch } = this.props;
    return dismissAlert({ id: alert.id, findApiAlertById, dispatch });
  }

  render() {
    return <AlertCardTemplate
      alert={this.props.alert}
      className={"seed-data-missing-alert"}
      title={t("Choose your FarmBot")}
      message={t(Content.SEED_DATA_SELECTION)}
      timeSettings={this.props.timeSettings}
      dispatch={this.props.dispatch}
      findApiAlertById={this.props.findApiAlertById}
      iconName={"check-square"}>
      <Row>
        <Col xs={4}>
          <label>{t("Choose your FarmBot")}</label>
        </Col>
        <Col xs={5}>
          <FBSelect
            key={this.state.selection}
            list={SEED_DATA_OPTIONS()}
            selectedItem={SEED_DATA_OPTIONS_DDI[this.state.selection]}
            onChange={seedAccount(this.dismiss)} />
        </Col>
      </Row>
    </AlertCardTemplate>;
  }
}

const TourNotTaken = (props: TourNotTakenProps) =>
  <AlertCardTemplate
    alert={props.alert}
    className={"tour-not-taken-alert"}
    title={t("Take a guided tour")}
    message={t(Content.TAKE_A_TOUR)}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById}
    iconName={"info-circle"}>
    <p>{t("Choose a tour to begin")}:</p>
    <TourList dispatch={props.dispatch} />
  </AlertCardTemplate>;

const UserNotWelcomed = (props: CommonAlertCardProps) =>
  <AlertCardTemplate
    alert={props.alert}
    className={"user-not-welcomed-alert"}
    title={t("Welcome to the FarmBot Web App")}
    message={t(Content.WELCOME)}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById}
    iconName={"info-circle"}>
    <p>
      {t("You're currently viewing the")} <b>{t("Message Center")}</b>.
      {" "}{t(Content.MESSAGE_CENTER_WELCOME)}
    </p>
    <p>
      {t(Content.MESSAGE_DISMISS)}
    </p>
  </AlertCardTemplate>;

const DocumentationUnread = (props: CommonAlertCardProps) =>
  <AlertCardTemplate
    alert={props.alert}
    className={"documentation-unread-alert"}
    title={t("Learn more about the app")}
    message={t(Content.READ_THE_DOCS)}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById}
    iconName={"info-circle"}>
    <p>
      {t("Head over to")}
      &nbsp;<a href={docLink()} target="_blank"
        title={t("Open documentation in a new tab")}>
        {t("software.farm.bot")}
      </a>
      &nbsp;{t("to get started")}.
    </p>
    <a className="link-button fb-button green"
      href={docLink()} target="_blank"
      title={t("Open documentation in a new tab")}>
      {t("Read the docs")}
    </a>
  </AlertCardTemplate>;
