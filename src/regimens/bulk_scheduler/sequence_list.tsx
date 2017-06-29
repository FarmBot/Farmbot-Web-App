import * as React from "react";
import { setSequence } from "./actions";
import { DeprecatedFBSelect, DropDownItem } from "../../ui";
import * as _ from "lodash";
import { t } from "i18next";
import { SequenceListProps } from "./interfaces";
import { TaggedSequence } from "../../resources/tagged_resources";

let options: DropDownItem[] = [];
let selectedSequence: DropDownItem;

export function SequenceList({ sequences,
  current,
  dispatch }: SequenceListProps) {

  sequences
    .filter(x => !!x.body.id) // Don't show unsaved.
    .map((sequence, index) => {
      // Need for initialValue to match DropDownItem interface.
      if (current && (sequence.body.id === current.body.id)) {
        selectedSequence = { label: sequence.body.name, value: index };
      }
      let target = { label: sequence.body.name, value: index.toString() };
      if (!_.some(options, target)) {
        options.push({
          label: sequence.body.name,
          value: index.toString()
        });
      }
    });

  return <div>
    <label>{t("Sequence")}</label>
    <DeprecatedFBSelect
      allowEmpty={true}
      initialValue={selectedSequence}
      onChange={change(dispatch, sequences)}
      list={options}
      placeholder="Select Sequence" />
  </div>;
}

function change(dispatch: Function, sequences: TaggedSequence[] | undefined) {
  // TODO: Solve react-select types issue. Everything breaks.
  return (event: DropDownItem) => {
    let i = _.parseInt((event.value || "-999").toString());
    if (sequences && sequences[i] && sequences[i].uuid) {
      dispatch(setSequence(sequences[i].uuid));
    }
  };
}
