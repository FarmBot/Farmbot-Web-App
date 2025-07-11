import { findSequenceById } from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { ParameterApplication, SequenceBodyItem } from "farmbot";
import { runLua } from "./run";
import { runActions } from "./actions";
import { Action } from "./interfaces";
import { csToLua } from "./util";

export const runDemoLuaCode = (luaCode: string) => {
  const actions = runLua(luaCode, []);
  runActions(actions);
};

export const runDemoSequence = (
  resources: ResourceIndex,
  sequenceId: number,
  variables: ParameterApplication[] | undefined,
) => {
  const sequence = findSequenceById(resources, sequenceId);
  const actions: Action[] = [];
  (sequence.body.body as SequenceBodyItem[]).map(step => {
    const lua = step.kind === "lua" ? step.args.lua : csToLua(step);
    const stepActions = runLua(lua, variables || []);
    actions.push(...stepActions);
  });
  runActions(actions);
};

export { csToLua };
