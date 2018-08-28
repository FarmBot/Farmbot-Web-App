import * as React from "react";
import { t } from "i18next";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect } from "../../ui/index";
import {
  setNoun,
  adjectiveList,
  setAdjective,
} from "./mark_as/options";
import { MarkAsSelection } from "./mark_as/interfaces";
import { NOUNS, NONE_SELECTED } from "./mark_as/constants";
import { betterCompact } from "../../util";
import { TaggedResource } from "farmbot";
import { ResourceSelector } from "./mark_as/resource_selector";

export class MarkAs extends React.Component<StepParams, MarkAsSelection> {
  state: MarkAsSelection = NONE_SELECTED;
  className = "wait-step";

  resourceList(): TaggedResource[] {
    switch (this.state.noun.label) {
      case "Plant":
      case "Tool":
      default: return [];
    }
  }

  resourceSelector = () => {
    return <ResourceSelector
      title={"Object"}
      list={[]}
      selected={undefined}
      onChange={() => { }} />;
  }

  emptySelector = () => {
    return <Col xs={8}>
      <label>{t("Object")}</label>
      <div className="empty-spot">
        Select "Tool" or "Plant"
      </div>
    </Col>;
  }

  maybeShowResources = () => {
    return (this.state.kind == "NoneSelected") ?
      <this.emptySelector /> : <this.resourceSelector />;
  }

  render() {
    const setState: MarkAs["setState"] = this.setState.bind(this);
    return <StepWrapper>
      <StepHeader
        className={this.className}
        helpText={ToolTips.WAIT}
        currentSequence={this.props.currentSequence}
        currentStep={this.props.currentStep}
        dispatch={this.props.dispatch}
        index={this.props.index} />
      <StepContent className={this.className}>
        <Row>
          <Col xs={2}>
            <label>{t("Mark")}</label>
            <FBSelect
              list={NOUNS}
              onChange={setNoun(setState)}
              allowEmpty={false}
              selectedItem={this.state.noun} />
          </Col>
          {this.maybeShowResources()}
          <Col xs={2}>
            <label>{t("As")}</label>
            <FBSelect
              list={betterCompact(adjectiveList(this.state))}
              onChange={setAdjective(setState)}
              allowEmpty={false}
              selectedItem={this.state.adjective} />
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
