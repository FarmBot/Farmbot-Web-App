import * as React from "react";
import { Show } from "./show";
import { Edit } from "./edit";
import { WebcamPanelProps } from "./interfaces";
import { TaggedWebcamFeed, SpecialStatus } from "farmbot";
import { edit, save, destroy, init } from "../../api/crud";
import { error } from "farmbot-toastr";

import { WebcamFeed } from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";

const HTTP = "http://";

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

  init = () =>
    this.props.dispatch(init("WebcamFeed", { url: HTTP, name: "" }))

  edit = (tr: TaggedWebcamFeed, update: Partial<WebcamFeed>) =>
    this.props.dispatch(edit(tr, update))

  save = (tr: TaggedWebcamFeed) =>
    tr.body.url != HTTP
      ? this.props.dispatch(save(tr.uuid))
      : error(t("Please enter a URL."))

  destroy = (tr: TaggedWebcamFeed) =>
    this.props.dispatch(destroy(tr.uuid))

  childProps = (activeMenu: "edit" | "show"): WebcamPanelProps => {

    return {
      onToggle: () => {
        const { feeds, dispatch } = this.props;
        feeds.map(preToggleCleanup(dispatch));

        this.setState({ activeMenu });
      },
      feeds: this.props.feeds,
      init: this.init,
      edit: this.edit,
      save: this.save,
      destroy: this.destroy,
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
