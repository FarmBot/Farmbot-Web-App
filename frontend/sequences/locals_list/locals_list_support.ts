import {
  ParameterDeclaration,
  VariableDeclaration,
  ParameterApplication
} from "farmbot";
import { ResourceIndex, VariableNameSet, UUID } from "../../resources/interfaces";
import { SequenceMeta } from "../../resources/sequence_meta";
import { ShouldDisplay } from "../../devices/interfaces";

export type VariableNode =
  ParameterDeclaration | VariableDeclaration | ParameterApplication;

type OnChange = (sd: VariableNode | undefined) => void;

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
   * Used only in sequence header form (ScopeDeclaration). */
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
  shouldDisplay: ShouldDisplay;
  /** Update stored data based on the variable provided. */
  onChange: OnChange;
  /** Use when a local set of variables exists; i.e., execute step body. */
  bodyVariables?: VariableNode[];
  /** Used to control updates to the LocationForm dropdown and onChange func. */
  locationDropdownKey?: string;
  /** Controls the available options in the LocationForm dropdown,
   * chooses between reassignment vs. creation for new variables,
   * and determines which variables to display in the form. */
  allowedVariableNodes: AllowedVariableNodes;
  /** Don't display group dropdown items. */
  disallowGroups?: boolean;
  /** Add ability to collapse the form content. */
  collapsible?: boolean;
  collapsed?: boolean;
  toggleVarShow?: () => void;
}

export interface LocalsListProps extends CommonProps {
  variableData: VariableNameSet | undefined;
}

export interface LocationFormProps extends CommonProps {
  variable: SequenceMeta;
  /** Coordinate input box width. */
  width?: number;
  /**
   * Set to false to show the variable name along with its type.
   * Useful for disambiguation when dealing with multiple variables.
   */
  hideVariableLabel?: boolean;
  /** Set to true to hide the variable node type label. */
  hideTypeLabel?: boolean;
}

export const PARENT =
  ({ value: "parent", label: "Parent", headingId: "parameter" });
