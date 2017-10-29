import * as React from "react";
import { Show } from "./show";
import { Edit } from "./edit";
import { WebcamPanelProps } from "./interfaces";
import { TaggedWebcamFeed, SpecialStatus } from "../../resources/tagged_resources";
import { edit, save, destroy, init } from "../../api/crud";

type S = {
  activeMenu: "edit" | "show"
};

type P = {
  feeds: TaggedWebcamFeed[];
  dispatch: Function;
};

const EMPTY_FEED: TaggedWebcamFeed = {
  kind: "WebcamFeed",
  specialStatus: SpecialStatus.DIRTY,
  uuid: "",
  body: {
    url: "",
    name: ""
  }
};
export class WebcamPanel extends React.Component<P, S> {

  state: S = { activeMenu: "show" };

  childProps = (activeMenu: "edit" | "show"): WebcamPanelProps => {
    return {
      onToggle: () => this.setState({ activeMenu }),
      feeds: this.props.feeds,
      init: () => this.props.dispatch(init(EMPTY_FEED)),
      edit: (tr, update) => this.props.dispatch(edit(tr, update)),
      save: (tr) => { this.props.dispatch(save(tr.uuid)); },
      destroy: (tr) => { this.props.dispatch(destroy(tr.uuid)); }
    };
  }

  render() {
    switch (this.state.activeMenu) {
      case "show": return <Show {...this.childProps("edit") } />;
      default: return <Edit {...this.childProps("show") } />;
    }
  }
}
