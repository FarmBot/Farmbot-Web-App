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
  gardenName: string;
}

/** New SavedGarden name input and snapshot/create buttons. */
export class GardenSnapshot
  extends React.Component<GardenSnapshotProps, GardenSnapshotState> {
  state = { gardenName: "" };

  snapshot = () => {
    const { currentSavedGarden, plantTemplates } = this.props;
    !currentSavedGarden
      ? snapshotGarden(this.state.gardenName)
      : this.props.dispatch(copySavedGarden({
        newSGName: this.state.gardenName,
        savedGarden: currentSavedGarden,
        plantTemplates
      }));
    this.setState({ gardenName: "" });
  }

  new = () => {
    this.props.dispatch(newSavedGarden(this.state.gardenName));
    this.setState({ gardenName: "" });
  };

  render() {
    return <div className="garden-snapshot">
      <label>{t("name")}</label>
      <input name="name"
        onChange={e => this.setState({ gardenName: e.currentTarget.value })}
        value={this.state.gardenName} />
      <button
        className={"fb-button gray wide"}
        title={t("Snapshot current garden")}
        onClick={this.snapshot}>
        {t("Snapshot current garden")}
      </button>
      <button
        className="fb-button green wide"
        title={t("Add new garden")}
        onClick={this.new}>
        {t("Add new garden")}
      </button>
    </div>;
  }
}
