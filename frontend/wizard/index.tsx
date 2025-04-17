import React from "react";
import { connect } from "react-redux";
import { t } from "../i18next_wrapper";
import { Collapse } from "@blueprintjs/core";
import { every, isUndefined, noop, some } from "lodash";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import { Everything } from "../interfaces";
import { Saucer } from "../ui";
import {
  WIZARD_SECTIONS, WIZARD_STEP_SLUGS,
  WIZARD_STEPS, WizardSectionSlug, WizardStepSlug, setupProgressString,
} from "./data";
import {
  SetupWizardProps, WizardHeaderProps, WizardResults,
  WizardSectionHeaderProps, WizardSectionsOpen, WizardStepDataProps,
} from "./interfaces";
import {
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

export const RawSetupWizard = (props: SetupWizardProps) => {
  const stepDataProps: WizardStepDataProps = {
    firmwareHardware: props.firmwareHardware,
    getConfigValue: props.getConfigValue,
  };
  const wizardSections = WIZARD_SECTIONS(stepDataProps);
  const wizardSteps = WIZARD_STEPS(stepDataProps);
  const wizardStepSlugs = WIZARD_STEP_SLUGS(stepDataProps);

  const results: WizardResults =
    props.wizardStepResults
      .reduce((acc, result) => {
        acc[result.body.slug as WizardStepSlug] = result.body;
        return acc;
      }, {} as WizardResults);

  const [currentlyOpenStep, setCurrentlyOpenStep] =
    React.useState<WizardStepSlug | undefined>(wizardStepSlugs
      .filter(slug => !results[slug]?.answer)[0]);

  const sectionsOpenInit = () => {
    const open: Partial<WizardSectionsOpen> = {};
    let oneOpen = false;
    wizardSections.map(section => {
      if (!oneOpen) {
        const sectionOpen = some(section.steps.map(step =>
          !results[step.slug]?.answer));
        open[section.slug] = sectionOpen;
        oneOpen = sectionOpen || oneOpen;
      }
    });
    return open as WizardSectionsOpen;
  };

  const allSectionsClosed: WizardSectionsOpen =
    wizardSections
      .reduce((acc, section) => {
        acc[section.slug] = false;
        return acc;
      }, {} as WizardSectionsOpen);

  const [sectionsOpen, setSectionsOpen] =
    React.useState<WizardSectionsOpen>(sectionsOpenInit());

  const reset = () => {
    props.dispatch(destroyAllWizardStepResults(
      props.wizardStepResults))
      .then(() => {
        setCurrentlyOpenStep(wizardStepSlugs[0]);
        setSectionsOpen({
          ...allSectionsClosed,
          [stepSection(wizardStepSlugs[0])]: true,
        });
        props.dispatch(resetSetup(props.device));
      })
      .catch(noop);
  };

  const updateData = (
    stepResult: WizardStepResult,
    nextStepSlug?: WizardStepSlug,
    last?: boolean,
  ) => () => {
    props.dispatch(addOrUpdateWizardStepResult(
      props.wizardStepResults, stepResult))
      .then(() => {
        if (last) {
          setCurrentlyOpenStep(undefined);
          setSectionsOpen(allSectionsClosed);
        }
        if (nextStepSlug) {
          setCurrentlyOpenStep(nextStepSlug);
          setSectionsOpen({
            ...allSectionsClosed,
            [stepSection(nextStepSlug)]: true,
          });
        }
        props.wizardStepResults.filter(result =>
          result.body.answer).length == wizardSteps.length
          && props.dispatch(completeSetup(props.device));
      });
  };

  const getNextStepSlug = (stepSlug: WizardStepSlug) => {
    const slugs = wizardStepSlugs
      .filter(slug => props.device?.body.setup_completed_at
        || !results[slug]?.answer);
    return slugs[slugs.indexOf(stepSlug) + 1];
  };

  const setStepSuccess = (stepSlug: WizardStepSlug) =>
    (success: boolean, outcome?: string) => {
      const nextSlug = success ? getNextStepSlug(stepSlug) : undefined;
      return updateData({
        slug: stepSlug,
        outcome: success
          ? undefined
          : (outcome || results[stepSlug]?.outcome),
        answer: success,
      }, nextSlug, success && isUndefined(nextSlug));
    };

  const stepSection = (stepSlug: WizardStepSlug): WizardSectionSlug =>
    wizardSteps.filter(step => step.slug == stepSlug)[0].section;

  const openStep = (stepSlug: WizardStepSlug) => () => {
    setCurrentlyOpenStep(currentlyOpenStep == stepSlug ? undefined : stepSlug);
    setSectionsOpen({
      ...sectionsOpen,
      [stepSection(stepSlug)]: true,
    });
  };

  const toggleSection = (sectionSlug: WizardSectionSlug) => () => {
    setSectionsOpen({
      ...sectionsOpen,
      [sectionSlug]: !sectionsOpen[sectionSlug],
    });
  };

  const panelName = "setup";
  return <DesignerPanel panelName={panelName} panel={Panel.Controls}>
    <DesignerPanelTop panel={Panel.Controls} />
    <DesignerPanelContent panelName={panelName}>
      <WizardHeader reset={reset} results={props.wizardStepResults}
        stepDataProps={stepDataProps} />
      {wizardSections
        .map(section =>
          <div className={"wizard-section"} key={section.slug}>
            <WizardSectionHeader
              toggleSection={toggleSection}
              results={results}
              section={section}
              sectionOpen={sectionsOpen[section.slug]} />
            <Collapse isOpen={sectionsOpen[section.slug]}>
              {section.steps.map(step =>
                <WizardStepContainer
                  key={step.slug}
                  step={step}
                  results={results}
                  section={section}
                  stepOpen={currentlyOpenStep}
                  openStep={openStep}
                  setStepSuccess={setStepSuccess}
                  timeSettings={props.timeSettings}
                  bot={props.bot}
                  dispatch={props.dispatch}
                  getConfigValue={props.getConfigValue}
                  resources={props.resources} />)}
            </Collapse>
          </div>)}
      {props.device?.body.setup_completed_at &&
        <div className={"setup-complete row half-gap"}>
          <Saucer color={"green"}><i className={"fa fa-check"} /></Saucer>
          <p>{t("Setup Complete!")}</p>
        </div>}
    </DesignerPanelContent>
  </DesignerPanel>;
};

const WizardHeader = (props: WizardHeaderProps) =>
  <div className={"wizard-header row grid-exp-1"}>
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
  <h2 onClick={props.toggleSection(props.section.slug)}
    className="row grid-exp-2">
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
    {!every(props.section.steps.map(step =>
      props.results[step.slug]?.answer)) &&
      !some(props.section.steps.map(step =>
        props.results[step.slug]?.answer == false)) &&
      <Saucer color={"gray"} />}
    {t(props.section.title)}
    <i className={
      `fa fa-caret-${props.sectionOpen ? "up" : "down"}`} />
  </h2>;

export const SetupWizard = connect(mapStateToProps)(RawSetupWizard);
// eslint-disable-next-line import/no-default-export
export default SetupWizard;
