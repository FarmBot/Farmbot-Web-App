import * as _ from "lodash";
import * as React from "react";
import { splice, remove } from "../step_tiles/index";
import { StepParams } from "../interfaces";
import { t } from "i18next";
import { DropDownItem } from "../../ui";
import { selectAllSequences, findSequenceById } from "../../resources/selectors";
import { Execute } from "farmbot/dist";
import { TaggedSequence } from "../../resources/tagged_resources";
import { ResourceIndex } from "../../resources/interfaces";
import { defensiveClone } from "../../util";
import { overwrite } from "../../api/crud";
import { FBSelect } from "../../ui/new_fb_select";

export function ExecuteBlock(p: StepParams) {
  if (p.currentStep.kind === "execute") {
    return <RefactoredExecuteBlock currentStep={p.currentStep}
      currentSequence={p.currentSequence}
      index={p.index}
      dispatch={p.dispatch}
      resources={p.resources} />;
  } else {
    throw new Error("Thats not an execute block!");
  }
}

interface ExecBlockParams {
  currentStep: Execute;
  currentSequence: TaggedSequence;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
}
export class RefactoredExecuteBlock extends React.Component<ExecBlockParams, {}> {
  changeSelection = (input: DropDownItem) => {
    let { props } = this;
    if (_.isNumber(input.value)) {
      let step2 = defensiveClone(props.currentStep);
      step2.args.sequence_id = input.value;
      let seq2 = defensiveClone(props.currentSequence);
      seq2.body.body = seq2.body.body || [];
      seq2.body.body[props.index] = step2;
      props.dispatch(overwrite(props.currentSequence, seq2.body));
    } else {
      throw new Error("Never not a number;");
    }
  }

  sequenceDropDownList = () => {
    let p = this.props;
    let output: DropDownItem[] = [];
    selectAllSequences(p.resources)
      .map(function (x) {
        let { id, name } = x.body;
        if (_.isNumber(id) && (id !== p.currentStep.args.sequence_id)) {
          output.push({ label: name, value: id })
        }
      })
    return output;
  }

  SequenceSelectBox = () => {
    return <FBSelect onChange={this.changeSelection}
      selectedItem={this.selectedSequence()}
      list={this.sequenceDropDownList()}
      placeholder="Pick a sequence (or save a new one)" />
  }

  selectedSequence = () => {
    let p = this.props;
    let { sequence_id } = p.currentStep.args;
    if (sequence_id) {
      let s = findSequenceById(p.resources, sequence_id);
      return { label: s.body.name, value: (s.body.id as number) }
    } else {
      return undefined;
    }
  }

  render() {
    let props = this.props;
    let { dispatch, currentStep, index, currentSequence } = props;
    return (<div>
      <div className="step-wrapper">
        <div className="row">
          <div className="col-sm-12">
            <div className="step-header execute-step">
              <input className="step-label" placeholder="Execute" />
              <i className="fa fa-arrows-v step-control" />
              <i className="fa fa-clone step-control"
                onClick={() => dispatch(splice({
                  index,
                  step: currentStep,
                  sequence: currentSequence
                }))} />
              <i className="fa fa-trash step-control"
                onClick={() => remove({
                  dispatch,
                  index,
                  sequence: currentSequence
                })} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="step-content execute-step">
              <div className="row">
                <div className="col-xs-12">
                  <label>{t("Sequence")}</label>
                  <this.SequenceSelectBox />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
  }
}
