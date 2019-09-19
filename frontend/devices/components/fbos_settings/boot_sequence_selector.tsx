import * as React from "react";
import { connect } from "react-redux";
import { TaggedSequence, TaggedFbosConfig } from "farmbot";
import { Everything } from "../../../interfaces";
import { selectAllSequences } from "../../../resources/selectors";
import { getFbosConfig } from "../../../resources/getters";

interface Props {
  fbosConfig: TaggedFbosConfig;
  sequences: TaggedSequence[];
  dispatch: Function;
}

function mapStateToProps(p: Everything): Props {
  const { index } = p.resources;
  const fbosConfig = getFbosConfig(index);
  if (fbosConfig) {
    return {
      fbosConfig,
      sequences: selectAllSequences(index),
      dispatch: p.dispatch,
    };
  } else {
    throw new Error("No config found?");
  }
}

export class DisconnectedBootSequenceSelector extends React.Component<Props, {}> {
  render() {
    return <div> Ey... </div>;
  }
}

export const BootSequenceSelector =
  connect(mapStateToProps)(DisconnectedBootSequenceSelector);
