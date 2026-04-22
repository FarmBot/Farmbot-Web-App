import { findSequenceById } from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { ParameterApplication, Point, SequenceBodyItem } from "farmbot";
import { runLua } from "./run";
import { expandActions, runActions } from "./actions";
import { Action } from "./interfaces";
import { csToLua } from "./util";
import { error } from "../../toast/toast";
import { getGroupPoints } from "./stubs";

export const runDemoLuaCode = (luaCode: string) => {
  const actions = runLua(0, luaCode, []);
  runActions(expandActions(actions, []));
};

export const collectDemoSequenceActions = (
  depth: number,
  resources: ResourceIndex,
  sequenceId: number,
  bodyVariables: ParameterApplication[] | undefined,
): Action[] => {
  console.log(`Call depth: ${depth}`);
  if (depth > 100) {
    error("Maximum call depth exceeded.");
    return [];
  }
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
        pointVariables);
      actions.push(...expandActions(loopSeqActions, pointVariables));
    });
    return actions;
  }
  (sequence.body.body as SequenceBodyItem[]).map(step => {
    if (step.kind == "execute") {
      const seqActions = collectDemoSequenceActions(
        depth + 1,
        resources,
        step.args.sequence_id,
        step.body);
      actions.push(...seqActions);
    } else {
      const lua = step.kind === "lua" ? step.args.lua : csToLua(step);
      const stepActions = runLua(depth, lua, variables);
      actions.push(...stepActions);
    }
  });
  return actions;
};

export const runDemoSequence = (
  resources: ResourceIndex,
  sequenceId: number,
  variables: ParameterApplication[] | undefined,
) => {
  const actions = collectDemoSequenceActions(0, resources, sequenceId, variables);
  runActions(expandActions(actions, variables));
};

export { csToLua };
