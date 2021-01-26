import React from "react";
import { StepParams } from "../interfaces";
import { Assertion, Lua } from "farmbot/dist/corpus";
import { editStep } from "../../api/crud";
import { InputLengthIndicator } from "../inputs/input_length_indicator";

export function LuaTextArea<Step extends Lua | Assertion>(props: StepParams<Step>) {
  const [lua, setLua] = React.useState(props.currentStep.args.lua);
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setLua(e.currentTarget.value);
  const onBlur = () => {
    props.dispatch(editStep({
      step: props.currentStep,
      index: props.index,
      sequence: props.currentSequence,
      executor(c: Step) { c.args.lua = lua; }
    }));
  };
  return <div className={"lua"}>
    <textarea value={lua} onChange={onChange} onBlur={onBlur}
      style={getTextAreaStyleHeight(lua)} />
    <InputLengthIndicator field={"lua"} value={lua} />
  </div>;
}

const getTextAreaStyleHeight = (contents: string) => ({
  height: `${((contents.split("\n").length) + 1) * 1.25}em`
});
