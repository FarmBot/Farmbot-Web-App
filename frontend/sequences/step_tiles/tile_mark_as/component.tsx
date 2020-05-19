import * as React from "react";
import { editStep } from "../../../api/crud";
import { Row, Col } from "../../../ui";
import { StepWrapper, StepHeader, StepContent } from "../../step_ui/index";
import { ToolTips } from "../../../constants";
import { UpdateResource, Resource, Identifier } from "farmbot";
import { MarkAsState, MarkAsProps, FieldAndValue } from "./interfaces";
import { ResourceSelection } from "./resource_selection";
import { FieldSelection } from "./field_selection";
import { ValueSelection } from "./value_selection";
import { isUndefined } from "lodash";
import { NOTHING_SELECTED } from "../../locals_list/handle_select";
import { CustomFieldWarning } from "./field_warning";

export class MarkAs extends React.Component<MarkAsProps, MarkAsState> {
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
      this.setState({ fieldsAndValues: fieldsAndValues }, callback);
      if (isUndefined(update.value) && fieldsAndValues.length < 2) {
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
    const className = "update-resource-step";
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.MARK_AS}
        currentSequence={this.props.currentSequence}
        currentStep={this.props.currentStep}
        dispatch={this.props.dispatch}
        index={this.props.index}
        confirmStepDeletion={this.props.confirmStepDeletion} />
      <StepContent className={className}>
        <Row>
          <Col xs={12} lg={6}>
            <ResourceSelection {...commonProps}
              sequenceUuid={this.props.currentSequence.uuid}
              updateResource={this.updateResource} />
          </Col>
          {this.state.fieldsAndValues.map((fieldAndValue, index) =>
            <Col xs={12} lg={6} key={index}>
              <div className={"update-resource-pair"}>
                <Col xs={6}>
                  <FieldSelection {...commonProps}
                    field={fieldAndValue.field}
                    update={this.updateFieldOrValue(index)} />
                </Col>
                <Col xs={6}>
                  <ValueSelection {...commonProps}
                    field={fieldAndValue.field}
                    value={fieldAndValue.value}
                    update={this.updateFieldOrValue(index)}
                    add={this.updateFieldOrValue(
                      this.state.fieldsAndValues.length)}
                    commitSelection={this.commitSelection} />
                </Col>
                <CustomFieldWarning
                  resource={this.state.resource}
                  field={fieldAndValue.field}
                  update={this.updateFieldOrValue(index)} />
              </div>
            </Col>)}
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
