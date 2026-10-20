import { findSequenceById } from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { ParameterApplication, Point, SequenceBodyItem } from "farmbot";
import { runLua } from "./run";
import {
  expandActions, expandActionsFromPosition, getPinValuesAfterActions,
  getPositionAfterActions, runActions, syncCurrentFromBotPosition,
} from "./actions";
import { Action, XyzNumber } from "./interfaces";
import { csToLua } from "./util";
import { error } from "../../toast/toast";
import { getGroupPoints } from "./stubs";

const sequenceCallKey = (
  sequenceId: number,
  bodyVariables: ParameterApplication[] | undefined,
) =>
  bodyVariables?.length
    ? `${sequenceId}:${
      bodyVariables
        .map(variable => JSON.stringify(variable.args))
        .join("|")
    }`
    : "" + sequenceId;

export const runDemoLuaCode = (luaCode: string) => {
  syncCurrentFromBotPosition();
  const actions = runLua(0, luaCode, []);
  runActions(expandActions(actions, []));
};

export const collectDemoSequenceActions = (
  depth: number,
  resources: ResourceIndex,
  sequenceId: number,
  bodyVariables: ParameterApplication[] | undefined,
  sequenceStack: string[] = [],
  currentPosition?: XyzNumber,
  currentPins?: Record<number, number>,
): Action[] => {
  if (depth > 100) {
    error("Maximum call depth exceeded.");
    return [];
  }
  const callKey = sequenceCallKey(sequenceId, bodyVariables);
  if (sequenceStack.includes(callKey)) {
    error("Maximum call depth exceeded.");
    return [];
  }
  sequenceStack.push(callKey);
  const sequence = findSequenceById(resources, sequenceId);
  const varData = resources.sequenceMetas[sequence.uuid];
  const sequenceVariables: ParameterApplication[] = Object.values(varData || {})
    .map(v => v?.celeryNode)
    .filter(v => v?.kind == "variable_declaration")
    .filter(v => !bodyVariables?.map(v => v.args.label).includes(v.args.label))
    .map(v => ({
      kind: "parameter_application",
      args: v.args,
    }));
  const variables = [...sequenceVariables, ...(bodyVariables || [])];
  const actions: Action[] = [];
  const firstVarArgs = variables[0]?.args;
  if (firstVarArgs?.data_value.kind == "point_group") {
    const variableLabel = firstVarArgs.label;
    const groupId = firstVarArgs.data_value.args.point_group_id;
    let loopCurrent =
      getPositionAfterActions(actions, variables, currentPosition);
    getGroupPoints(resources, groupId).map(p => {
      const pointValue: Point = {
        kind: "point", args: {
          pointer_type: p.body.pointer_type,
          pointer_id: p.body.id as number,
        }
      };
      const pointVariables: ParameterApplication[] = [{
        kind: "parameter_application",
        args: { label: variableLabel, data_value: pointValue }
      }];
      const loopSeqActions = collectDemoSequenceActions(
        depth + 1,
        resources,
        sequence.body.id as number,
        pointVariables,
        sequenceStack,
        loopCurrent,
        getPinValuesAfterActions(actions, currentPins));
      if (loopCurrent) {
        const expanded = expandActionsFromPosition(
          loopSeqActions,
          pointVariables,
          loopCurrent,
        );
        actions.push(...expanded.actions);
        loopCurrent = expanded.current;
      } else {
        actions.push(...expandActions(loopSeqActions, pointVariables));
      }
    });
    sequenceStack.pop();
    return actions;
  }
  (sequence.body.body as SequenceBodyItem[]).map(step => {
    const position = getPositionAfterActions(actions, variables, currentPosition);
    if (step.kind == "execute") {
      const seqActions = collectDemoSequenceActions(
        depth + 1,
        resources,
        step.args.sequence_id,
        step.body,
        sequenceStack,
        position,
        getPinValuesAfterActions(actions, currentPins));
      actions.push(...seqActions);
    } else {
      const lua = step.kind === "lua" ? step.args.lua : csToLua(step);
      const stepActions = runLua(depth, lua, variables, position,
        getPinValuesAfterActions(actions, currentPins));
      actions.push(...stepActions);
    }
  });
  sequenceStack.pop();
  return actions;
};

export const runDemoSequence = (
  resources: ResourceIndex,
  sequenceId: number,
  variables: ParameterApplication[] | undefined,
) => {
  syncCurrentFromBotPosition();
  const actions = collectDemoSequenceActions(0, resources, sequenceId, variables);
  runActions(expandActions(actions, variables));
};

export { csToLua };
