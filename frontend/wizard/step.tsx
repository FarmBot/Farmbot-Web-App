import React from "react";
import { t } from "../i18next_wrapper";
import { Collapse } from "@blueprintjs/core";
import { every, some } from "lodash";
import { Saucer, Markdown } from "../ui";
import {
  TroubleshootingTipsProps, WizardStepContainerProps, WizardStepHeaderProps,
} from "./interfaces";
import { Feedback } from "../help/support";
import moment from "moment";
import { FirmwareNumberSettings, Video } from "./step_components";
import { formatTime } from "../util";

export const WizardStepHeader = (props: WizardStepHeaderProps) => {
  const stepOpen = props.stepOpen == props.step.slug;
  const resultDate = props.stepResult?.updated_at;
  const stepDone = props.stepResult?.answer;
  const stepFail = stepDone == false;
  const normalStepColor = stepDone ? "green" : "gray";
  const stepColor = stepFail ? "red" : normalStepColor;

  return <div className={`wizard-step-header ${stepOpen ? "open" : ""}`}
    onClick={props.openStep(props.step.slug)}>
    <h3>{t(props.step.title)}</h3>
    <Saucer color={stepColor}>
      <div className={"step-icon"}>
        {stepDone && <i className={"fa fa-check"} />}
        {stepFail && <i className={"fa fa-times"} />}
      </div>
    </Saucer>
    {stepOpen && <div className={"wizard-step-info"}>
      {props.showProgress && <p>
        {t("Step {{ num }} of {{ total }}", {
          num: props.section.steps.indexOf(props.step) + 1,
          total: props.section.steps.length,
        })}
      </p>}
      {resultDate && <p>
        {stepDone ? t("Completed") : t("Updated")}&nbsp;
        {formatTime(moment(resultDate), props.timeSettings, "MMM D")}
      </p>}
    </div>}
  </div>;
};

export const WizardStepContainer = (props: WizardStepContainerProps) => {
  const { step } = props;
  const setSuccess = props.setStepSuccess(step.slug);
  const requirementsMet =
    every(step.prerequisites?.map(prerequisite =>
      prerequisite.status()));
  const stepResult = props.results[step.slug];
  return <div className={"wizard-step"} key={step.slug}>
    <WizardStepHeader
      step={step}
      stepResult={stepResult}
      section={props.section}
      stepOpen={props.stepOpen}
      openStep={props.openStep}
      timeSettings={props.timeSettings} />
    <Collapse isOpen={props.stepOpen == step.slug}>
      {step.prerequisites &&
        some(step.prerequisites.map(pre => !pre.status())) &&
        <div className={"prerequisites"}>
          {step.prerequisites.map((prerequisite, index) =>
            !prerequisite.status() && <prerequisite.indicator key={index} />)}
        </div>}
      <Markdown>{step.content}</Markdown>
      {step.video && <Video url={step.video} />}
      <div className={[
        "wizard-components",
        step.componentOptions?.border ?? true ? "" : "no-border",
        step.componentOptions?.fullWidth ? "full-width" : "",
        step.componentOptions?.background ?? true ? "" : "no-background",
      ].join(" ")}>
        {step.component &&
          <step.component setStepSuccess={setSuccess}
            bot={props.bot}
            dispatch={props.dispatch}
            getConfigValue={props.getConfigValue}
            resources={props.resources} />}
      </div>
      <Markdown>{step.question}</Markdown>
      {!requirementsMet &&
        <p className={"prereq-not-met"}>
          {t("Fix issues above to continue.")}
        </p>}
      <div className={"wizard-answer"}>
        <button className={"fb-button gray"}
          disabled={!requirementsMet}
          onClick={setSuccess(false)}>
          {t("no")}
        </button>
        <button className={"fb-button green"}
          disabled={!requirementsMet}
          onClick={setSuccess(true)}>
          {t("yes")}
        </button>
      </div>
      {stepResult?.answer == false &&
        <TroubleshootingTips
          selectedOutcome={stepResult.outcome}
          step={step}
          openStep={props.openStep}
          bot={props.bot}
          resources={props.resources}
          dispatch={props.dispatch}
          getConfigValue={props.getConfigValue}
          setSuccess={setSuccess} />}
    </Collapse>
  </div>;
};

const TroubleshootingTips = (props: TroubleshootingTipsProps) => {
  const otherSelected = props.selectedOutcome == "other";
  return <div className={"troubleshooting"}>
    <p>{t("What happened?")}</p>
    {props.step.outcomes.map(outcome => {
      const selected = outcome.slug == props.selectedOutcome;
      const hidden = !selected && outcome.hidden;
      const { goToStep } = outcome;
      if (hidden) { return <div key={outcome.slug} />; }
      return <div key={outcome.slug}
        className={
          `troubleshooting-tip ${selected ? "selected" : ""}`}
        onClick={props.setSuccess(false, outcome.slug)}>
        <p>{t(outcome.description)}</p>
        {selected &&
          <p>
            {t(outcome.tips)}
            {goToStep &&
              <a className={"fb-button"}
                onClick={e => {
                  e.stopPropagation();
                  props.openStep(goToStep.step)();
                }}>
                {t(goToStep.text)}
              </a>}
          </p>}
        {selected && outcome.detectedProblems?.map(problem =>
          !problem.status() &&
          <p key={problem.description}>
            {t(problem.description)}
          </p>)}
        {selected && outcome.video && <Video url={outcome.video} />}
        {selected && outcome.component &&
          <outcome.component
            bot={props.bot}
            dispatch={props.dispatch}
            getConfigValue={props.getConfigValue}
            resources={props.resources} />}
        {selected &&
          <FirmwareNumberSettings bot={props.bot}
            dispatch={props.dispatch}
            firmwareNumberSettings={outcome.firmwareNumberSettings}
            resources={props.resources} />}
      </div>;
    })}
    <div className={`troubleshooting-tip ${otherSelected ? "selected" : ""}`}
      onClick={props.setSuccess(false, "other")}>
      <p>{t("Something else")}</p>
      {otherSelected && <p>{t("Provide a description:")}</p>}
      {otherSelected && <Feedback stepSlug={props.step.slug} keep={true} />}
    </div>
  </div>;
};
