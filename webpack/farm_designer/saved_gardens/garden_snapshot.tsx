import * as React from "react";
import { t } from "i18next";
import { error } from "farmbot-toastr";
import { snapshotGarden, newSavedGarden } from "./actions";
import { TaggedPlantTemplate, TaggedSavedGarden } from "farmbot";

export interface GardenSnapshotProps {
  plantsInGarden: boolean;
  currentSavedGarden: TaggedSavedGarden | undefined;
  plantTemplates: TaggedPlantTemplate[];
  dispatch: Function;
}

interface GardenSnapshotState {
  name: string;
}

const GARDEN_OPEN_ERROR = t("Can't snapshot while saved garden is open.");
const NO_PLANTS_ERROR = t("No plants in garden. Create some plants first.");

export class GardenSnapshot
  extends React.Component<GardenSnapshotProps, GardenSnapshotState> {
  state = { name: "" };

  snapshot = () => {
    const { currentSavedGarden } = this.props;
    if (!currentSavedGarden) {
      this.props.plantsInGarden
        ? snapshotGarden(this.state.name)
        : error(NO_PLANTS_ERROR);
      this.setState({ name: "" });
    } else {
      error(GARDEN_OPEN_ERROR);
    }
  }

  new = () => {
    this.props.dispatch(newSavedGarden(this.state.name));
    this.setState({ name: "" });
  };

  render() {
    const disabledClassName =
      this.props.currentSavedGarden ? "pseudo-disabled" : "";
    return <div className="garden-snapshot">
      <label>{t("garden name")}</label>
      <input
        onChange={e => this.setState({ name: e.currentTarget.value })}
        value={this.state.name} />
      <button
        title={this.props.currentSavedGarden
          ? GARDEN_OPEN_ERROR
          : ""}
        className={`fb-button gray wide ${disabledClassName}`}
        onClick={this.snapshot}>
        {t("Snapshot current garden")}
      </button>
      <button
        className="fb-button green wide"
        onClick={this.new}>
        {t("create new garden")}
      </button>
    </div>;
  }
}
