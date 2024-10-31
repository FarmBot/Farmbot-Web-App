import React from "react";
import { editStep } from "../../../api/crud";
import { Row } from "../../../ui";
import { StepWrapper } from "../../step_ui";
import { ToolTips } from "../../../constants";
import { UpdateResource, Resource, Identifier } from "farmbot";
import { MarkAsState, FieldAndValue } from "./interfaces";
import { ResourceSelection } from "./resource_selection";
import { FieldSelection, UPDATE_RESOURCE_DDIS } from "./field_selection";
import { ValueSelection } from "./value_selection";
import { isUndefined } from "lodash";
import { NOTHING_SELECTED } from "../../step_button_cluster";
import { CustomFieldWarning } from "./field_warning";
import { StepParams } from "../../interfaces";
import { shouldDisplayFeature } from "../../../devices/should_display";
import { Feature } from "../../../devices/interfaces";

export class MarkAs
  extends React.Component<StepParams<UpdateResource>, MarkAsState> {
  state: MarkAsState = {
    resource: this.step.args.resource,
    fieldsAndValues: this.step.body?.length
      ? this.step.body.map(pair =>
        ({ field: pair.args.label, value: pair.args.value }))
      : [{ field: undefined, value: undefined }],
  };

  get step() { return this.props.currentStep; }

  editStep = (executor: (s: UpdateResource) => void) =>
    this.props.dispatch(editStep({
      step: this.step,
      index: this.props.index,
      sequence: this.props.currentSequence,
      executor,
    }));

  resetStep = () =>
    this.editStep(s => {
      s.args = { resource: NOTHING_SELECTED };
      s.body = [];
    });

  commitSelection = () => {
    const { resource, fieldsAndValues } = this.state;
    this.editStep(s => {
      if (fieldsAndValues.length > 0 && resource.kind != "nothing") {
        s.args = { resource };
        s.body = [];
        fieldsAndValues.map(({ field, value }) => {
          if (s.body && !isUndefined(field) && !isUndefined(value)) {
            s.body.push({ kind: "pair", args: { label: field, value: value } });
          }
        });
      }
    });
  };

  updateResource = (resource: Resource | Identifier) => {
    this.setState({
      resource,
      fieldsAndValues: [{ field: undefined, value: undefined }],
    });
    this.resetStep();
  };

  updateFieldOrValue = (index: number) =>
    (update: Partial<FieldAndValue>, callback?: () => void) => {
      const { fieldsAndValues } = this.state;
      const old = fieldsAndValues[index];
      fieldsAndValues[index] = { ...old, ...update };
      const nowValue = UPDATE_RESOURCE_DDIS().NOW.value;
      const newFieldsAndValues =
        (old.field == "plant_stage" && old.value == "planted"
          && fieldsAndValues[index].value != "planted")
          ? fieldsAndValues.filter(fieldAndValue =>
            !(fieldAndValue.field == "planted_at"
              && fieldAndValue.value == nowValue))
          : fieldsAndValues;
      if (fieldsAndValues[index].field == "plant_stage"
        && fieldsAndValues[index].value == "planted"
        && shouldDisplayFeature(Feature.planted_at_now)) {
        newFieldsAndValues.push({ field: "planted_at", value: nowValue });
      }
      this.setState({ fieldsAndValues: newFieldsAndValues }, callback);
      if (isUndefined(update.value) && newFieldsAndValues.length < 2) {
        this.resetStep();
      }
    };

  render() {
    const commonProps = {
      key: JSON.stringify(this.state)
        + JSON.stringify(this.props.currentSequence.body.args.locals),
      resource: this.state.resource,
      resources: this.props.resources,
    };
    return <StepWrapper {...this.props}
      className={"update-resource-step"}
      helpText={ToolTips.MARK_AS}>
      <Row>
        <ResourceSelection {...commonProps}
          sequenceUuid={this.props.currentSequence.uuid}
          updateResource={this.updateResource} />
      </Row>
      {this.state.fieldsAndValues.map((fieldAndValue, index) => {
        const isPlantedAtRow = index > 0
          && fieldAndValue.field == "planted_at"
          && fieldAndValue.value == UPDATE_RESOURCE_DDIS().NOW.value;
        return <Row key={index}>
          <div className={`update-resource-pair grid ${index == 0 ? "first" : ""}`}>
            <FieldSelection {...commonProps}
              field={fieldAndValue.field}
              disabled={isPlantedAtRow}
              update={this.updateFieldOrValue(index)} />
            <ValueSelection {...commonProps}
              field={fieldAndValue.field}
              value={fieldAndValue.value}
              update={this.updateFieldOrValue(index)}
              add={this.updateFieldOrValue(
                this.state.fieldsAndValues.length)}
              disabled={isPlantedAtRow}
              commitSelection={this.commitSelection} />
            <CustomFieldWarning
              resource={this.state.resource}
              field={fieldAndValue.field}
              update={this.updateFieldOrValue(index)} />
          </div>
        </Row>;
      })}
    </StepWrapper>;
  }
}
