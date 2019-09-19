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

function mapStateToProps(p: Everything) {
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

@connect(mapStateToProps)
export class BootSequenceSelector extends React.Component<Props, {}> {

  render() {
    return <div> Ey... </div>;
  }
}
