import React from "react";
import Editor, { loader } from "@monaco-editor/react";
loader.config({ paths: { vs: "/assets/monaco" } });
import { StepParams } from "../interfaces";
import { Assertion, Lua } from "farmbot/dist/corpus";
import { editStep } from "../../api/crud";
import { InputLengthIndicator } from "../inputs/input_length_indicator";
import { debounce } from "lodash";
import { Path } from "../../internal_urls";

export interface LuaTextAreaProps<Step extends Lua | Assertion>
  extends StepParams<Step> {
  useMonacoEditor: boolean;
}

interface LuaTextAreaState {
  lua: string;
}

export class LuaTextArea<Step extends Lua | Assertion>
  extends React.Component<LuaTextAreaProps<Step>, LuaTextAreaState> {
  state: LuaTextAreaState = { lua: this.props.currentStep.args.lua };

  updateStep = debounce((newLua: string) => {
    if (this.props.readOnly) { return; }
    this.props.dispatch(editStep({
      step: this.props.currentStep,
      index: this.props.index,
      sequence: this.props.currentSequence,
      executor(c: Step) { c.args.lua = newLua; }
    }));
  }, 500);

  onChange = (value: string) => {
    this.setLua(value || "");
    this.updateStep(this.state.lua);
  };

  setLua = (value: string) => !this.props.readOnly && this.setState({ lua: value });

  FallbackEditor = ({ loading }: { loading?: boolean }) =>
    <textarea className={loading ? "" : "fallback-lua-editor"}
      value={this.state.lua}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        this.setLua(e.currentTarget.value)}
      onBlur={() => this.updateStep(this.state.lua)}
      style={getTextAreaStyleHeight(this.state.lua)} />;

  render() {
    return <div className={"lua-input"}>
      <div className={`lua-editor ${Path.inDesigner() ? "" : "full"}`}>
        {this.props.useMonacoEditor
          ? <Editor
            language={"lua"}
            options={{ minimap: { enabled: false } }}
            value={this.state.lua}
            loading={<this.FallbackEditor loading={true} />}
            onChange={this.onChange} />
          : <this.FallbackEditor />}
      </div>
      <InputLengthIndicator field={"lua"} value={this.state.lua} />
    </div>;
  }
}

const getTextAreaStyleHeight = (contents: string) => ({
  height: `${((contents.split("\n").length) + 1) * 1.25}em`
});
