import React from "react";
import { t } from "../i18next_wrapper";
import {
  AlertCardProps, AlertCardTemplateProps, FirmwareMissingProps,
  SeedDataMissingProps, SeedDataMissingState, TourNotTakenProps,
  CommonAlertCardProps,
  DismissAlertProps,
  Bulletin,
  BulletinAlertComponentState,
  SetupIncompleteProps,
} from "./interfaces";
import { formatTime } from "../util";
import {
  FlashFirmwareBtn,
} from "../settings/firmware/firmware_hardware_status";
import { DropDownItem, Row, Col, FBSelect, docLink, Markdown } from "../ui";
import { Content } from "../constants";
import { splitProblemTag } from "./alerts";
import { destroy } from "../api/crud";
import {
  isFwHardwareValue, FIRMWARE_CHOICES_DDI, getFirmwareChoices,
  validFirmwareHardware,
} from "../settings/firmware/firmware_hardware_support";
import { updateConfig } from "../devices/actions";
import { fetchBulletinContent, seedAccount } from "./actions";
import { startCase } from "lodash";
import { ExternalUrl } from "../external_urls";
import { setupProgressString } from "../wizard/data";
import { store } from "../redux/store";
import { selectAllWizardStepResults } from "../resources/selectors_by_kind";
import { push } from "../history";
import moment from "moment";
import { Path } from "../internal_urls";
import { logout } from "../logout";
import { shouldDisplayFeature } from "../devices/should_display";
import { Feature } from "../devices/interfaces";

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
    case "api.setup.not_completed":
      return <SetupIncomplete {...commonProps}
        apiFirmwareValue={props.apiFirmwareValue} />;
    case "api.tour.not_taken":
      return <TourNotTaken {...commonProps}
        dispatch={dispatch} />;
    case "api.user.not_welcomed":
      return <UserNotWelcomed {...commonProps} />;
    case "api.documentation.unread":
      return <DocumentationUnread {...commonProps} />;
    case "api.bulletin.unread":
      return <BulletinAlert {...commonProps} />;
    case "api.demo_account.in_use":
      return <DemoAccount {...commonProps} />;
    default:
      return <UnknownAlert {...commonProps} />;
  }
};
const dismissAlert = (props: DismissAlertProps) => () =>
  (props.id && props.findApiAlertById && props.dispatch) &&
  props.dispatch(destroy(props.findApiAlertById(props.id)));

const timeOk = (timestamp: number) => timestamp > 1550000000;

const AlertCardTemplate = (props: AlertCardTemplateProps) => {
  const { alert, findApiAlertById, dispatch, timeSettings } = props;
  const thisYear = moment.unix(alert.created_at).year() == moment().year();
  const timeFormat = thisYear ? "MMM D" : "MMM D, YYYY";
  return <div className={
    `problem-alert ${props.className} priority-${props.alert.priority}`}>
    <div className="problem-alert-title">
      <i className={`fa ${props.iconName || "fa-exclamation-triangle"}`} />
      <h3>{t(props.title)}</h3>
      {timeOk(alert.created_at) &&
        <p>
          {formatTime(moment.unix(alert.created_at), timeSettings, timeFormat)}
        </p>}
    </div>
    {alert.id && !props.noDismiss && <i className={"fa fa-times fb-icon-button"}
      onClick={dismissAlert({ id: alert.id, findApiAlertById, dispatch })} />}
    <div className="problem-alert-content">
      <Markdown html={true}>{t(props.message)}</Markdown>
      {props.children}
    </div>
  </div>;
};

const ICON_LOOKUP: { [x: string]: string } = {
  "info": "fa-info-circle",
  "success": "fa-check-square",
  "warn": "fa-exclamation-triangle",
};

class BulletinAlert
  extends React.Component<CommonAlertCardProps, BulletinAlertComponentState> {
  state: BulletinAlertComponentState = { bulletin: undefined, no_content: false };

  componentDidMount() {
    fetchBulletinContent(this.props.alert.slug)
      .then(bulletin => bulletin
        ? this.setState({ bulletin })
        : this.setState({ no_content: true }));
  }

  get bulletinData(): Bulletin {
    return this.state.bulletin || {
      content: this.state.no_content
        ? t("Unable to load content.")
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
      iconName={ICON_LOOKUP[type] || "fa-info-circle"}
      message={t(content)}
      timeSettings={this.props.timeSettings}
      dispatch={this.props.dispatch}
      findApiAlertById={this.props.findApiAlertById}>
      {href && <a className="link-button fb-button green"
        href={href} target="_blank" rel={"noreferrer"}
        title={t("Open link in a new tab")}>
        {href_label || t("Find out more")}
      </a>}
    </AlertCardTemplate>;
  }
}

const UnknownAlert = (props: CommonAlertCardProps) => {
  const { problem_tag, slug, priority } = props.alert;
  const { author, noun, verb } = splitProblemTag(problem_tag);
  return <AlertCardTemplate
    alert={props.alert}
    className={"unknown-alert"}
    title={`${t(noun)}: ${t(verb)} (${t(author)})`}
    message={t("Unknown problem of priority {{priority}} ({{slug}}).",
      { priority, slug })}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById} />;
};

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
        <td>{"Genesis v1.7"}</td>
        <td>{"Farmduino"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["farmduino_k17"].label}</code></td>
      </tr>
      <tr>
        <td>{"Genesis v1.6"}</td>
        <td>{"Farmduino"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["farmduino_k16"].label}</code></td>
      </tr>
      <tr>
        <td>{"Genesis v1.5"}</td>
        <td>{"Farmduino"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["farmduino_k15"].label}</code></td>
      </tr>
      <tr>
        <td>{"Genesis v1.4"}</td>
        <td>{"Farmduino"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["farmduino_k14"].label}</code></td>
      </tr>
      <tr>
        <td>{"Genesis v1.3"}</td>
        <td>{"Farmduino"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["farmduino"].label}</code></td>
      </tr>
      <tr>
        <td>{"Genesis v1.2"}</td>
        <td>{"RAMPS"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["arduino"].label}</code></td>
      </tr>
      {/* <tr>
        <td>{"Express v1.2"}</td>
        <td>{"Farmduino"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["express_k12"].label}</code></td>
      </tr> */}
      <tr>
        <td>{"Express v1.1"}</td>
        <td>{"Farmduino"}</td>
        <td><code>{FIRMWARE_CHOICES_DDI["express_k11"].label}</code></td>
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
      dispatch?.(updateConfig({ firmware_hardware: ddi.value }));
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
          list={getFirmwareChoices()}
          customNullLabel={t("Select one")}
          selectedItem={props.apiFirmwareValue
            ? FIRMWARE_CHOICES_DDI[props.apiFirmwareValue]
            : undefined}
          onChange={changeFirmwareHardware(props.dispatch)} />
      </Col>
      <Col xs={3} hidden={true}>
        <FlashFirmwareBtn
          apiFirmwareValue={props.apiFirmwareValue}
          botOnline={true} />
      </Col>
    </Row>
  </AlertCardTemplate>;

export const SEED_DATA_OPTIONS = (displayAll = false): DropDownItem[] => [
  { label: "Genesis v1.7", value: "genesis_1.7" },
  { label: "Genesis v1.6", value: "genesis_1.6" },
  { label: "Genesis v1.5", value: "genesis_1.5" },
  { label: "Genesis v1.4", value: "genesis_1.4" },
  { label: "Genesis v1.3", value: "genesis_1.3" },
  { label: "Genesis v1.2", value: "genesis_1.2" },
  { label: "Genesis v1.7 XL", value: "genesis_xl_1.7" },
  { label: "Genesis v1.6 XL", value: "genesis_xl_1.6" },
  { label: "Genesis v1.5 XL", value: "genesis_xl_1.5" },
  { label: "Genesis v1.4 XL", value: "genesis_xl_1.4" },
  ...((shouldDisplayFeature(Feature.express_k12) || displayAll)
    ? [{ label: "Express v1.2", value: "express_1.2" }]
    : []),
  { label: "Express v1.1", value: "express_1.1" },
  { label: "Express v1.0", value: "express_1.0" },
  ...((shouldDisplayFeature(Feature.express_k12) || displayAll)
    ? [{ label: "Express v1.2 XL", value: "express_xl_1.2" }]
    : []),
  { label: "Express v1.1 XL", value: "express_xl_1.1" },
  { label: "Express v1.0 XL", value: "express_xl_1.0" },
  { label: "Custom Bot", value: "none" },
];

export const SEED_DATA_OPTIONS_DDI = (): Record<string, DropDownItem> => {
  const options: Record<string, DropDownItem> = {};
  SEED_DATA_OPTIONS(true).map(ddi => options[ddi.value] = ddi);
  return options;
};

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
      noDismiss={true}
      findApiAlertById={this.props.findApiAlertById}
      iconName={"fa-check-square"}>
      <Row>
        <Col xs={4}>
          <label>{t("Choose your FarmBot")}</label>
        </Col>
        <Col xs={5}>
          <FBSelect
            key={this.state.selection}
            list={SEED_DATA_OPTIONS()}
            selectedItem={SEED_DATA_OPTIONS_DDI()[this.state.selection]}
            onChange={seedAccount(this.dismiss)} />
        </Col>
      </Row>
    </AlertCardTemplate>;
  }
}

export const ReSeedAccount = () => {
  const [selection, setSelection] = React.useState("");
  return <Row className={"re-seed"}>
    <Col xs={7}>
      <FBSelect
        key={selection}
        list={SEED_DATA_OPTIONS().filter(x => x.value != "none")}
        customNullLabel={t("Select a model")}
        selectedItem={SEED_DATA_OPTIONS_DDI()[selection]}
        onChange={ddi => setSelection("" + ddi.value)} />
    </Col>
    <Col xs={5}>
      <button className={"fb-button green"}
        onClick={() => selection && confirm(t(Content.RE_SEED_ACCOUNT)) &&
          seedAccount()({ label: "", value: selection })}>
        {t("re-seed account")}
      </button>
    </Col>
  </Row>;
};

const TourNotTaken = (props: TourNotTakenProps) =>
  <AlertCardTemplate
    alert={props.alert}
    className={"tour-not-taken-alert"}
    title={t("Take a guided tour")}
    message={t(Content.TAKE_A_TOUR)}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById}
    iconName={"fa-info-circle"}>
    <a className="link-button fb-button green"
      onClick={() => push(Path.tours())}
      title={t("View available tours")}>
      {t("View available tours")}
    </a>
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
    iconName={"fa-info-circle"}>
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
    iconName={"fa-info-circle"}>
    <p className={"documentation-card"}>
      {t("Head over to")}
      &nbsp;<a href={docLink()} target="_blank" rel={"noreferrer"}
        title={t("Open documentation in a new tab")}>
        {t("software.farm.bot")}
      </a>
      &nbsp;{t("to get started or click the")}
      <i className={"fa fa-question"} />
      {t("icon in the main navigation bar to open up the documentation in-app")}.
    </p>
    <a className="link-button fb-button green"
      href={docLink()} target="_blank" rel={"noreferrer"}
      title={t("Open documentation in a new tab")}>
      {t("Read the docs")}
    </a>
  </AlertCardTemplate>;

const DemoAccount = (props: CommonAlertCardProps) =>
  <AlertCardTemplate
    alert={props.alert}
    className={"demo-account-alert"}
    title={t("You're currently using a demo account")}
    message={t(Content.DEMO_ACCOUNT)}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById}
    iconName={"fa-info-circle"}>
    <p>
      <i>{t("Please note:")}</i>&nbsp;
      {t(Content.DEMO_NOTE)}
    </p>
    <p>
      {t(Content.MAKE_A_REAL_ACCOUNT)}&nbsp;
      <a href={ExternalUrl.myFarmBot} target="_blank" rel={"noreferrer"}
        onClick={logout()}
        title={"my.farm.bot"}>
        {"my.farm.bot"}
      </a>.
    </p>
    <a className="link-button fb-button green"
      href={ExternalUrl.myFarmBot} target="_blank" rel={"noreferrer"}
      onClick={logout()}
      title={t("Make a real account")}>
      {t("Make a real account")}
    </a>
  </AlertCardTemplate>;

const SetupIncomplete = (props: SetupIncompleteProps) => {
  const resources = store.getState().resources.index;
  const percentComplete = setupProgressString(
    selectAllWizardStepResults(resources),
    {
      firmwareHardware: validFirmwareHardware(props.apiFirmwareValue),
    });
  const buttonText = percentComplete != "0% complete"
    ? t("Continue setup")
    : t("Get Started");
  return <AlertCardTemplate
    alert={props.alert}
    className={"setup-alert"}
    title={t("Finish setup")}
    message={t(Content.SETUP_INCOMPLETE, { percentComplete })}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    noDismiss={true}
    findApiAlertById={props.findApiAlertById}
    iconName={"fa-info-circle"}>
    <a className="link-button fb-button green"
      onClick={() => push(Path.setup())}
      title={buttonText}>
      {buttonText}
    </a>
  </AlertCardTemplate>;
};
