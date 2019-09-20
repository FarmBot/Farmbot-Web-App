import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../../interfaces";
import { getFbosConfig } from "../../../resources/getters";
import { FBSelect, DropDownItem } from "../../../ui";
import { edit, save } from "../../../api/crud";
import { TaggedFbosConfig, TaggedSequence } from "farmbot";
import { selectAllSequences, findSequenceById } from "../../../resources/selectors";
import { betterCompact } from "../../../util";

interface Props {
  list: DropDownItem[];
  selectedItem: Readonly<DropDownItem> | undefined;
  config: TaggedFbosConfig;
  dispatch: Function;
}

const sequence2ddi = (x: TaggedSequence): DropDownItem | undefined => {
  const { body } = x;
  const emptyScope = (body.args.locals.body || []).length == 0;
  if (emptyScope && body.id) {
    return { label: body.name, value: body.id };
  }

  return undefined;
};

function mapStateToProps(p: Everything): Props {
  const { index } = p.resources;
  const fbosConfig = getFbosConfig(index);
  if (fbosConfig) {
    const list = betterCompact(selectAllSequences(index).map(sequence2ddi));
    const { boot_sequence_id } = fbosConfig.body;
    const bs = boot_sequence_id ?
      findSequenceById(index, boot_sequence_id) : undefined;
    return {
      list,
      selectedItem: bs ? sequence2ddi(bs) : undefined,
      config: fbosConfig,
      dispatch: p.dispatch
    };

  } else {
    throw new Error("No config found?");
  }
}

export class RawBootSequenceSelector extends React.Component<Props, {}> {
  onChange = (_selected: DropDownItem) => {
    const payload = { boot_sequence_id: _selected.value as number | undefined };
    this.props.dispatch(edit(this.props.config, payload));
    this.props.dispatch(save(this.props.config.uuid));
  }

  render() {
    return <div>
      <FBSelect
        list={this.props.list}
        selectedItem={this.props.selectedItem}
        onChange={this.onChange} />
    </div>;
  }
}

export const BootSequenceSelector =
  connect(mapStateToProps)(RawBootSequenceSelector);
