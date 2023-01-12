import React from "react";
import { connect } from "react-redux";
import { t } from "../i18next_wrapper";
import { Collapse } from "@blueprintjs/core";
import { every, isUndefined, noop, some } from "lodash";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { DesignerNavTabs, Panel } from "../farm_designer/panel_header";
import { Everything } from "../interfaces";
import { Saucer } from "../ui";
import {
  WIZARD_SECTIONS, WIZARD_STEP_SLUGS,
  WIZARD_STEPS, WizardSectionSlug, WizardStepSlug, setupProgressString,
} from "./data";
import {
  SetupWizardProps, SetupWizardState, WizardHeaderProps, WizardResults,
  WizardSectionHeaderProps, WizardSectionsOpen,
} from "./interfaces";
import {
  getDeviceAccountSettings,
  maybeGetDevice,
  maybeGetTimeSettings, selectAllWizardStepResults,
} from "../resources/selectors";
import { WizardStepContainer } from "./step";
import { getWebAppConfigValue } from "../config_storage/actions";
import { getFwHardwareValue } from "../settings/firmware/firmware_hardware_support";
import { getFbosConfig } from "../resources/getters";
import { WizardStepResult } from "farmbot/dist/resources/api_resources";
import {
  addOrUpdateWizardStepResult,
  destroyAllWizardStepResults,
  completeSetup,
  resetSetup,
} from "./actions";

export const mapStateToProps = (props: Everything): SetupWizardProps => ({
  resources: props.resources.index,
  bot: props.bot,
  dispatch: props.dispatch,
  timeSettings: maybeGetTimeSettings(props.resources.index),
  getConfigValue: getWebAppConfigValue(() => props),
  firmwareHardware: getFwHardwareValue(getFbosConfig(props.resources.index)),
  wizardStepResults: selectAllWizardStepResults(props.resources.index),
  device: maybeGetDevice(props.resources.index),
});

export class RawSetupWizard
  extends React.Component<SetupWizardProps, SetupWizardState> {

  get stepDataProps() {
    return {
      firmwareHardware: this.props.firmwareHardware,
      rpi: getDeviceAccountSettings(this.props.resources).body.rpi,
    };
  }

  get results() {
    const results: WizardResults = {};
    this.props.wizardStepResults.map(result => {
      results[result.body.slug as WizardStepSlug] = result.body;
    });
    return results;
  }

  sectionsOpen = () => {
    const open: Partial<WizardSectionsOpen> = {};
    let oneOpen = false;
    WIZARD_SECTIONS(this.stepDataProps).map(section => {
      if (!oneOpen) {
        const sectionOpen = some(section.steps.map(step =>
          !this.results[step.slug]?.answer));
        open[section.slug] = sectionOpen;
        oneOpen = sectionOpen || oneOpen;
      }
    });
    return open as WizardSectionsOpen;
  };

  state: SetupWizardState = {
    ...this.sectionsOpen(),
    stepOpen: WIZARD_STEP_SLUGS(this.stepDataProps)
      .filter(slug => !this.results[slug]?.answer)[0],
  };

  reset = () => {
    this.props.dispatch(destroyAllWizardStepResults(
      this.props.wizardStepResults))
      .then(() => {
        this.setState({
          stepOpen: WIZARD_STEP_SLUGS(this.stepDataProps)[0],
          ...this.closedSections,
          ...this.sectionsOpen(),
        });
        this.props.dispatch(resetSetup(this.props.device));
      })
      .catch(noop);
  };

  get closedSections() {
    const sectionStates: Partial<Record<WizardSectionSlug, boolean>> = {};
    WIZARD_SECTIONS(this.stepDataProps)
      .map(section => { sectionStates[section.slug] = false; });
    return sectionStates;
  }

  updateData = (
    stepResult: WizardStepResult,
    nextStepSlug?: WizardStepSlug,
    last?: boolean,
  ) => () => {
    this.props.dispatch(addOrUpdateWizardStepResult(
      this.props.wizardStepResults, stepResult))
      .then(() => {
        this.setState({
          stepOpen: last ? undefined : (nextStepSlug || this.state.stepOpen),
          ...((last || nextStepSlug) ? this.closedSections : {}),
          ...(nextStepSlug ? { [this.stepSection(nextStepSlug)]: true } : {}),
        });
        this.props.wizardStepResults.filter(result => result.body.answer).length
          == WIZARD_STEPS(this.stepDataProps).length
          && this.props.dispatch(completeSetup(this.props.device));
      });
  };

  getNextStepSlug = (stepSlug: WizardStepSlug) => {
    const slugs = WIZARD_STEP_SLUGS(this.stepDataProps)
      .filter(slug => this.props.device?.body.setup_completed_at
        || !this.results[slug]?.answer);
    return slugs[slugs.indexOf(stepSlug) + 1];
  };

  setStepSuccess = (stepSlug: WizardStepSlug) =>
    (success: boolean, outcome?: string) => {
      const nextSlug = success ? this.getNextStepSlug(stepSlug) : undefined;
      return this.updateData({
        slug: stepSlug,
        outcome: success
          ? undefined
          : (outcome || this.results[stepSlug]?.outcome),
        answer: success,
      }, nextSlug, success && isUndefined(nextSlug));
    };

  toggleSection = (slug: WizardSectionSlug) => () =>
    this.setState({ ...this.state, [slug]: !this.state[slug] });

  stepSection = (stepSlug: WizardStepSlug): WizardSectionSlug =>
    WIZARD_STEPS(this.stepDataProps)
      .filter(step => step.slug == stepSlug)[0].section;

  openStep = (stepSlug: WizardStepSlug) => () => this.setState({
    stepOpen: this.state.stepOpen == stepSlug ? undefined : stepSlug,
    [this.stepSection(stepSlug)]: true,
  });

  render() {
    const panelName = "setup";
    return <DesignerPanel panelName={panelName} panel={Panel.Controls}>
      <DesignerNavTabs />
      <DesignerPanelTop panel={Panel.Controls} />
      <DesignerPanelContent panelName={panelName}>
        <WizardHeader reset={this.reset} results={this.props.wizardStepResults}
          stepDataProps={this.stepDataProps} />
        {WIZARD_SECTIONS(this.stepDataProps)
          .map(section =>
            <div className={"wizard-section"} key={section.slug}>
              <WizardSectionHeader
                toggleSection={this.toggleSection}
                results={this.results}
                section={section}
                sectionOpen={this.state[section.slug]} />
              <Collapse isOpen={this.state[section.slug]}>
                {section.steps.map(step =>
                  <WizardStepContainer
                    key={step.slug}
                    step={step}
                    results={this.results}
                    section={section}
                    stepOpen={this.state.stepOpen}
                    openStep={this.openStep}
                    setStepSuccess={this.setStepSuccess}
                    timeSettings={this.props.timeSettings}
                    bot={this.props.bot}
                    dispatch={this.props.dispatch}
                    getConfigValue={this.props.getConfigValue}
                    resources={this.props.resources} />)}
              </Collapse>
            </div>)}
        {this.props.device?.body.setup_completed_at &&
          <div className={"setup-complete"}>
            <Saucer color={"green"}><i className={"fa fa-check"} /></Saucer>
            <p>{t("Setup Complete!")}</p>
          </div>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

const WizardHeader = (props: WizardHeaderProps) =>
  <div className={"wizard-header"}>
    <h1>{t("Setup")}</h1>
    <p className={"progress-meter"}>
      {setupProgressString(props.results, props.stepDataProps)}
    </p>
    <button className={"fb-button red start-over"}
      disabled={props.results.length < 1}
      onClick={props.reset}>
      {t("start over")}
    </button>
  </div>;

const WizardSectionHeader = (props: WizardSectionHeaderProps) =>
  <h2 onClick={props.toggleSection(props.section.slug)}>
    {t(props.section.title)}
    {every(props.section.steps.map(step =>
      props.results[step.slug]?.answer)) &&
      <Saucer color={"green"}>
        <div className={"step-icon"}>
          <i className={"fa fa-check"} />
        </div>
      </Saucer>}
    {some(props.section.steps.map(step =>
      props.results[step.slug]?.answer == false)) &&
      <Saucer color={"red"}>
        <div className={"step-icon"}>
          <i className={"fa fa-times"} />
        </div>
      </Saucer>}
    <i className={
      `fa fa-caret-${props.sectionOpen ? "up" : "down"}`} />
  </h2>;

export const SetupWizard = connect(mapStateToProps)(RawSetupWizard);
