import * as React from "react";
import { snapshotGarden, newSavedGarden, copySavedGarden } from "./actions";
import { TaggedPlantTemplate, TaggedSavedGarden } from "farmbot";
import { t } from "../../i18next_wrapper";

export interface GardenSnapshotProps {
  currentSavedGarden: TaggedSavedGarden | undefined;
  plantTemplates: TaggedPlantTemplate[];
  dispatch: Function;
}

interface GardenSnapshotState {
  name: string;
}

/** New SavedGarden name input and snapshot/create buttons. */
export class GardenSnapshot
  extends React.Component<GardenSnapshotProps, GardenSnapshotState> {
  state = { name: "" };

  snapshot = () => {
    const { currentSavedGarden, plantTemplates } = this.props;
    !currentSavedGarden
      ? snapshotGarden(this.state.name)
      : this.props.dispatch(copySavedGarden({
        newSGName: this.state.name,
        savedGarden: currentSavedGarden,
        plantTemplates
      }));
    this.setState({ name: "" });
  }

  new = () => {
    this.props.dispatch(newSavedGarden(this.state.name));
    this.setState({ name: "" });
  };

  render() {
    return <div className="garden-snapshot">
      <label>{t("name")}</label>
      <input
        onChange={e => this.setState({ name: e.currentTarget.value })}
        value={this.state.name} />
      <button
        className={"fb-button gray wide"}
        onClick={this.snapshot}>
        {t("Snapshot current garden")}
      </button>
      <button
        className="fb-button green wide"
        onClick={this.new}>
        {t("Add new garden")}
      </button>
    </div>;
  }
}
