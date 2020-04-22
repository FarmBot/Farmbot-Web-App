import { ResourceIndex } from "../../../resources/interfaces";
import { DropDownItem } from "../../../ui";
import { UpdateResource, TaggedSequence, Resource, Identifier } from "farmbot";

/** Function that converts resources into dropdown selections based on
 * use-case specific rules */
export type ListBuilder = (i: ResourceIndex) => DropDownItem[];

/** Input data for calls to commitStepChanges() */
export interface MarkAsEditProps {
  nextAction: DropDownItem;
  nextResource: DropDownItem | undefined;
  step: UpdateResource;
  index: number;
  sequence: TaggedSequence
}

export interface PackedStepWithResourceIndex {
  step: UpdateResource;
  resourceIndex: ResourceIndex;
}

export interface UnpackedStepWithResourceIndex {
  resource: Resource | Identifier;
  field: string;
  value: string | number | boolean;
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
