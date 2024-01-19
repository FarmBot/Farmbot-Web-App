import React from "react";
import { snapshotGarden, newSavedGarden, copySavedGarden } from "./actions";
import { TaggedPlantTemplate, TaggedSavedGarden } from "farmbot";
import { t } from "../i18next_wrapper";

export interface GardenSnapshotProps {
  currentSavedGarden: TaggedSavedGarden | undefined;
  plantTemplates: TaggedPlantTemplate[];
  dispatch: Function;
}

interface GardenSnapshotState {
  gardenName: string;
  gardenNotes: string;
}

/** New SavedGarden name input and snapshot/create buttons. */
export class GardenSnapshot
  extends React.Component<GardenSnapshotProps, GardenSnapshotState> {
  state = { gardenName: "", gardenNotes: "" };

  snapshot = () => {
    const { currentSavedGarden, plantTemplates } = this.props;
    !currentSavedGarden
      ? snapshotGarden(this.state.gardenName, this.state.gardenNotes)
      : this.props.dispatch(copySavedGarden({
        newSGName: this.state.gardenName,
        savedGarden: currentSavedGarden,
        plantTemplates
      }));
    this.setState({ gardenName: "", gardenNotes: "" });
  };

  new = () => {
    this.props.dispatch(newSavedGarden(
      this.state.gardenName,
      this.state.gardenNotes,
    ));
    this.setState({ gardenName: "", gardenNotes: "" });
  };

  render() {
    return <div className="garden-snapshot">
      <label>{t("name")}</label>
      <input name="gardenName"
        onChange={e => this.setState({ gardenName: e.currentTarget.value })}
        value={this.state.gardenName} />
      <label>{t("notes")}</label>
      <textarea name="notes"
        onChange={e => this.setState({ gardenNotes: e.currentTarget.value })}
        value={this.state.gardenNotes} />
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
