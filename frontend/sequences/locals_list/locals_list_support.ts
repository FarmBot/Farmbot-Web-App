import {
  ParameterDeclaration,
  VariableDeclaration,
  ParameterApplication,
} from "farmbot";
import {
  ResourceIndex, VariableNameSet, UUID,
} from "../../resources/interfaces";
import { SequenceMeta } from "../../resources/sequence_meta";

export type VariableNode =
  ParameterDeclaration | VariableDeclaration | ParameterApplication;

export type OnChange = (sd: VariableNode | undefined, variableKey: string) => void;

/**
 * ParameterApplications (or VariableDeclarations in ScopeDeclarations)
 * without identifiers are always allowed.
 * Use `AllowedVariableNodes.variable` to allow no additional variable types.
 * Use a different value to allow additional variable types.
 */
export enum AllowedVariableNodes {
  /** Allow ParameterApplications with identifiers.
   * Don't show already defined variables in the form. */
  identifier,
  /** Allow ParameterDeclarations,
   * and use VariableDeclarations instead of ParameterApplications.
   * Used only in sequence (ScopeDeclaration) and regimen header forms. */
  parameter,
  /** Allow only ParameterApplications without identifiers.
   * Reassignment and creation of new variables not allowed.
   * Don't show already defined variables in the form.
   * Used at the top level where executables are executed (FarmEvents). */
  variable,
}

interface CommonProps {
  sequenceUuid: UUID;
  resources: ResourceIndex;
  /** Update stored data based on the variable provided. */
  onChange: OnChange;
  removeVariable?(label: string): void;
  /** Use when a local set of variables exists; i.e., execute step body. */
  bodyVariables?: VariableNode[];
  /** Used to control updates to the VariableForm dropdown and onChange func. */
  locationDropdownKey?: string;
  /** Controls the available options in the VariableForm dropdown,
   * chooses between reassignment vs. creation for new variables,
   * and determines which variables to display in the form. */
  allowedVariableNodes: AllowedVariableNodes;
  /** Don't show groups in dropdown. */
  hideGroups?: boolean;
  /** Variable label only (no input). */
  labelOnly?: boolean;
}

export interface LocalsListProps extends CommonProps {
  variableData: VariableNameSet | undefined;
}

export interface VariableFormProps extends CommonProps {
  variable: SequenceMeta;
  hideWrapper?: boolean;
  /** Is the variable being used? */
  inUse?: boolean;
  variableType: VariableType;
}

export enum VariableType {
  Location = "Location",
  Number = "Number",
  Text = "Text",
  Resource = "Resource",
}
