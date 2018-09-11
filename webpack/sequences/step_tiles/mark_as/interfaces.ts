import { ResourceIndex } from "../../../resources/interfaces";
import { DropDownItem } from "../../../ui";
import { ResourceUpdate, TaggedSequence } from "farmbot";

/** Function that converts resources into dropdown selections based on
 * use-case specific rules */
export type ListBuilder = (i: ResourceIndex) => DropDownItem[];

/** Shape of step.args when step.kind = "resource_update" */
export type ResourceUpdateArgs = Partial<ResourceUpdate["args"]>;

/** Input data for calls to commitStepChanges() */
export interface MarkAsEditProps {
  nextAction: DropDownItem;
  nextResource: DropDownItem | undefined;
  step: ResourceUpdate;
  index: number;
  sequence: TaggedSequence
}

export interface StepWithResourceIndex {
  step: ResourceUpdate;
  resourceIndex: ResourceIndex;
}

/** A pair of DropDownItems used to render the currently selected items in the
 * "Mark As.." block. */
export interface DropDownPair {
  /** Left side drop down */
  leftSide: DropDownItem;
  /** Right side drop down */
  rightSide: DropDownItem;
}
