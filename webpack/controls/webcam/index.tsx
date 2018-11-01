import * as React from "react";
import { Show } from "./show";
import { Edit } from "./edit";
import { WebcamPanelProps } from "./interfaces";
import { TaggedWebcamFeed, SpecialStatus } from "farmbot";
import { edit, save, destroy, init } from "../../api/crud";

type S = { activeMenu: "edit" | "show" };

type P = { feeds: TaggedWebcamFeed[]; dispatch: Function; };

export const preToggleCleanup = (dispatch: Function) => (f: TaggedWebcamFeed) => {
  const { uuid } = f;
  const { name, url, id } = f.body;

  if (!name || !url || !id) {
    // Delete empty or unsaved records
    dispatch(destroy(uuid, true));
    return;
  }

  if (f.specialStatus !== SpecialStatus.SAVED) {
    // Stash unsaved to preexisting records
    dispatch(save(uuid));
    return;
  }
};

export class WebcamPanel extends React.Component<P, S> {
  state: S = { activeMenu: "show" };

  childProps = (activeMenu: "edit" | "show"): WebcamPanelProps => {

    return {
      onToggle: () => {
        const { feeds, dispatch } = this.props;
        feeds.map(preToggleCleanup(dispatch));

        this.setState({ activeMenu });
      },
      feeds: this.props.feeds,
      init: () => this.props.dispatch(init("WebcamFeed", { url: "", name: "" })),
      edit: (tr, update) => this.props.dispatch(edit(tr, update)),
      save: tr => this.props.dispatch(save(tr.uuid)),
      destroy: tr => this.props.dispatch(destroy(tr.uuid))
    };
  }

  render() {
    if (this.state.activeMenu === "show") {
      return <Show {...this.childProps("edit")} />;
    } else {
      return <Edit {...this.childProps("show")} />;
    }
  }
}
