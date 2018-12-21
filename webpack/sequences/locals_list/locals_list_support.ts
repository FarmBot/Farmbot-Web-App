import { ScopeDeclarationBodyItem } from "farmbot";
import { ResourceIndex, VariableNameSet, UUID } from "../../resources/interfaces";
import { SequenceMeta } from "../../resources/sequence_meta";
import { ShouldDisplay } from "../../devices/interfaces";

type OnChange = (sd: ScopeDeclarationBodyItem | undefined) => void;

/**
 * VariableDeclarations without identifiers are always allowed.
 * Use `AllowedDeclaration.variable` to allow no additional declaration types.
 * Use a different value to allow additional declaration types.
 */
export enum AllowedDeclaration {
  /** Allow VariableDeclarations with identifiers.
   * Don't show already defined variables in the form. */
  identifier,
  /** Allow ParameterDeclarations.
   * Used only in sequence header form (ScopeDeclaration). */
  parameter,
  /** Allow only VariableDeclarations without identifiers.
   * Reassignment and creation of new variables not allowed.
   * Don't show already defined variables in the form.
   * Used at the top level where executables are executed (FarmEvents). */
  variable,
}

interface CommonProps {
  sequenceUuid: UUID;
  resources: ResourceIndex;
  shouldDisplay: ShouldDisplay;
  /** Update stored data based on the declaration provided. */
  onChange: OnChange;
  /** Use when a local set of declarations exists; i.e., execute step body. */
  declarations?: ScopeDeclarationBodyItem[];
  /** Used to control updates to the LocationForm dropdown and onChange func. */
  locationDropdownKey?: string;
  /** Controls the available options in the LocationForm dropdown,
   * chooses between reassignment vs. creation for new variables,
   * and determines which variables to display in the form. */
  allowedDeclarations: AllowedDeclaration;
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
}

export const PARENT =
  ({ value: "parent", label: "Parent", headingId: "parameter" });
