import * as React from "react";
import { connect } from "react-redux";
import { Hotkey, Hotkeys, HotkeysTarget } from "@blueprintjs/core";

interface Props {
  dispatch: Function;
}

function mapStateToProps(props: Props): Props {
  return {
    dispatch: props.dispatch
  };
}

@connect(mapStateToProps)
@HotkeysTarget
export class HotKeys extends React.Component<{}, {}> {
  public render() {
    console.log(this.props);
    return <span></span>;
  }

  public renderHotkeys() {
    return <Hotkeys>
      <Hotkey
        global={true}
        combo="shift + a"
        label="test"
        onKeyDown={() => console.log("shift and a")}
      />
    </Hotkeys>;
  }
}
