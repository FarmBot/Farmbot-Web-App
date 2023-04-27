import React from "react";
import { Row, Col } from "../../ui";
import { TaggedSequence, SequenceBodyItem, Lua } from "farmbot";
import { StepTitleBar } from "../step_tiles/step_title_bar";
import { StepIconGroup } from "./step_icon_group";
import { t } from "../../i18next_wrapper";
import { SequenceResource } from "farmbot/dist/resources/api_resources";
import { random } from "lodash";
import {
  PLACEHOLDER_PROMPTS, requestAutoGeneration,
} from "../request_auto_generation";
import { editStep } from "../../api/crud";

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
  monacoEditor: boolean | undefined;
  toggleMonacoEditor: (() => void) | undefined;
  links: React.ReactElement[] | undefined;
  enableMarkdown?: boolean;
  setKey(key: string | undefined): void;
}

interface StepHeaderState {
  draggable: boolean;
  isProcessing: boolean;
  promptOpen: boolean;
  promptText: string;
  placeholderIndex: number;
}

export class StepHeader
  extends React.Component<StepHeaderProps, StepHeaderState> {
  state: StepHeaderState = {
    draggable: true,
    isProcessing: false,
    promptOpen: false,
    promptText: "",
    placeholderIndex: this.newPlaceholderIndex,
  };

  get newPlaceholderIndex() { return random(PLACEHOLDER_PROMPTS.length - 1); }
  toggle = (action: "enter" | "leave") => () =>
    this.setState({ draggable: action == "leave" });

  togglePrompt = () => {
    this.setState({ placeholderIndex: this.newPlaceholderIndex });
    this.setState({ promptOpen: !this.state.promptOpen });
  };

  AutoLuaPrompt = () => {
    const { promptText, placeholderIndex } = this.state;
    return <div className={"prompt-wrapper"}>
      <textarea className={"prompt"}
        value={promptText}
        placeholder={PLACEHOLDER_PROMPTS[placeholderIndex]}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          this.setState({ promptText: e.currentTarget.value })} />
      <div className={"generate-code"}>
        <p>{t("Always review and test auto-generated code")}</p>
        <button className={"fb-button gray"}
          disabled={this.state.isProcessing}
          onClick={() => {
            this.setState({ isProcessing: true });
            requestAutoGeneration({
              prompt: promptText || PLACEHOLDER_PROMPTS[placeholderIndex],
              contextKey: "lua",
              onSuccess: code => {
                this.setState({ isProcessing: false });
                this.props.dispatch(editStep({
                  step: this.props.currentStep,
                  index: this.props.index,
                  sequence: this.props.currentSequence,
                  executor(c: Lua) { c.args.lua = code; },
                }));
                this.props.setKey(code);
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
      <Col sm={12}>
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
              monacoEditor={this.props.monacoEditor}
              toggleMonacoEditor={this.props.toggleMonacoEditor}
              isProcessing={this.state.isProcessing}
              togglePrompt={this.togglePrompt}
              confirmStepDeletion={this.props.confirmStepDeletion} />
          </div>
          {this.state.promptOpen && <this.AutoLuaPrompt />}
        </div>
      </Col>
    </Row>;
  }
}
