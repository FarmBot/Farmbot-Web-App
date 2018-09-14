import * as React from "react";
import { t } from "i18next";
import { error } from "farmbot-toastr";
import { snapshotGarden } from "./actions";

export interface GardenSnapshotProps {
  plantsInGarden: boolean;
  disabled: boolean;
}

interface GardenSnapshotState {
  name: string | undefined;
}

export class GardenSnapshot
  extends React.Component<GardenSnapshotProps, GardenSnapshotState> {
  state = { name: undefined };

  render() {
    return <div className="garden-snapshot"
      title={this.props.disabled
        ? t("Can't snapshot while saved garden is open.")
        : ""}>
      <label>{t("garden name")}</label>
      <input
        disabled={this.props.disabled}
        onChange={e => this.setState({ name: e.currentTarget.value })}
        value={this.state.name} />
      <button
        className="fb-button gray wide"
        disabled={this.props.disabled}
        onClick={() => this.props.plantsInGarden
          ? snapshotGarden(this.state.name)
          : error(t("No plants in garden. Create some plants first."))}>
        {t("Snapshot")}
      </button>
    </div>;
  }
}
