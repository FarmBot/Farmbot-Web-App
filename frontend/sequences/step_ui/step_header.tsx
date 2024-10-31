import React from "react";
import { Row } from "../../ui";
import { TaggedSequence, SequenceBodyItem, Lua } from "farmbot";
import { StepTitleBar } from "../step_tiles/step_title_bar";
import { StepIconGroup } from "./step_icon_group";
import { t } from "../../i18next_wrapper";
import { SequenceResource } from "farmbot/dist/resources/api_resources";
import { noop, random } from "lodash";
import {
  PLACEHOLDER_PROMPTS, requestAutoGeneration, retrievePrompt,
} from "../request_auto_generation";
import { editStep } from "../../api/crud";
import axios from "axios";
import { API } from "../../api";
import { SequenceReducerState } from "../interfaces";
import { StateToggles } from "./step_wrapper";

export interface StepHeaderProps {
  children?: React.ReactNode;
  className: string;
  helpText: string;
  currentSequence: TaggedSequence;
  currentStep: SequenceBodyItem;
  dispatch: Function;
  readOnly: boolean;
  index: number;
  executeSequence: SequenceResource | undefined;
  confirmStepDeletion: boolean;
  viewRaw: boolean | undefined;
  toggleViewRaw: (() => void) | undefined;
  stateToggles?: StateToggles;
  links: React.ReactElement[] | undefined;
  enableMarkdown?: boolean;
  setKey(key: string | undefined): void;
  sequencesState: SequenceReducerState;
}

interface StepHeaderState {
  draggable: boolean;
  isProcessing: boolean;
  promptOpen: boolean;
  promptText: string;
  placeholderIndex: number;
  showFeedback: boolean;
  cachedPrompt: string;
  reaction?: string;
}

export class StepHeader
  extends React.Component<StepHeaderProps, StepHeaderState> {
  state: StepHeaderState = {
    draggable: true,
    isProcessing: false,
    promptOpen: false,
    promptText: retrievePrompt(this.props.currentStep),
    placeholderIndex: this.newPlaceholderIndex,
    showFeedback: false,
    cachedPrompt: "",
    reaction: undefined,
  };

  get newPlaceholderIndex() { return random(PLACEHOLDER_PROMPTS.length - 1); }
  toggle = (action: "enter" | "leave") => () =>
    this.setState({ draggable: action == "leave" });

  togglePrompt = () => {
    this.setState({ placeholderIndex: this.newPlaceholderIndex });
    this.setState({ promptOpen: !this.state.promptOpen });
  };

  submitFeedback = (prompt: string, reaction: string) => () => {
    this.setState({ showFeedback: false, cachedPrompt: "", reaction });
    axios.post(API.current.aiFeedbacksPath, {
      prompt: prompt.slice(0, 500),
      reaction,
    }).then(noop, noop);
    setTimeout(() => this.setState({ reaction: undefined }), 2000);
  };

  AutoLuaPrompt = () => {
    const {
      promptText, placeholderIndex, showFeedback, cachedPrompt, reaction,
    } = this.state;
    const aiPrompt = promptText || PLACEHOLDER_PROMPTS[placeholderIndex];
    const key = `lua_code_${this.props.index}`;
    return <div className={"prompt-wrapper grid"}>
      <textarea className={"prompt"}
        onMouseEnter={this.toggle("enter")}
        onMouseLeave={this.toggle("leave")}
        value={promptText}
        placeholder={PLACEHOLDER_PROMPTS[placeholderIndex]}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          this.setState({ promptText: e.currentTarget.value })} />
      <div className={"row grid-exp-1"}>
        <p>{t("Always review and test auto-generated code")}</p>
        <div className={"row"} style={{
          opacity: showFeedback ? 1 : 0,
          pointerEvents: showFeedback ? "unset" : "none",
        }}>
          <i className={`fa fa-thumbs${reaction == "good" ? "" : "-o"}-up`}
            onClick={this.submitFeedback(cachedPrompt, "good")} />
          <i className={`fa fa-thumbs${reaction == "bad" ? "" : "-o"}-down`}
            onClick={this.submitFeedback(cachedPrompt, "bad")} />
        </div>
        <button className={"fb-button gray"}
          disabled={this.state.isProcessing}
          onClick={() => {
            this.setState({ isProcessing: true });
            requestAutoGeneration({
              prompt: aiPrompt,
              contextKey: "lua",
              onUpdate: code => {
                localStorage.setItem(key, code);
                this.props.setKey(code);
              },
              onSuccess: code => {
                this.setState({
                  isProcessing: false,
                  promptText: aiPrompt,
                  showFeedback: true,
                  cachedPrompt: aiPrompt,
                });
                this.props.dispatch(editStep({
                  step: this.props.currentStep,
                  index: this.props.index,
                  sequence: this.props.currentSequence,
                  executor(c: Lua) {
                    c.args.lua = code;
                    c.body = [{
                      kind: "pair",
                      args: { label: "prompt", value: aiPrompt },
                    }];
                  },
                }));
                localStorage.removeItem(key);
                setTimeout(() => this.props.setKey(code + " success"), 1000);
              },
              onError: () => this.setState({ isProcessing: false }),
            });
          }}>
          {this.state.isProcessing
            ? t("generating")
            : t("generate code")}
        </button>
      </div>
    </div>;
  };

  render() {
    const {
      className,
      currentSequence,
      currentStep,
      dispatch,
      readOnly,
      index,
      executeSequence,
    } = this.props;
    return <Row>
      <div className={`step-header ${className} ${executeSequence?.color}`}
        draggable={this.state.draggable}>
        <div className={"step-header-flex"}>
          <StepTitleBar
            index={index}
            dispatch={dispatch}
            readOnly={readOnly}
            step={currentStep}
            sequence={currentSequence}
            pinnedSequenceName={executeSequence?.name}
            toggleDraggable={this.toggle} />
          {this.props.children}
          <StepIconGroup
            index={index}
            dispatch={dispatch}
            readOnly={readOnly}
            step={currentStep}
            sequence={currentSequence}
            executeSequenceName={executeSequence?.name}
            helpText={t(this.props.helpText)}
            enableMarkdown={this.props.enableMarkdown}
            links={this.props.links}
            viewRaw={this.props.viewRaw}
            toggleViewRaw={this.props.toggleViewRaw}
            stateToggles={this.props.stateToggles}
            isProcessing={this.state.isProcessing}
            togglePrompt={this.togglePrompt}
            sequencesState={this.props.sequencesState}
            confirmStepDeletion={this.props.confirmStepDeletion} />
        </div>
        {this.state.promptOpen && <this.AutoLuaPrompt />}
      </div>
    </Row>;
  }
}
