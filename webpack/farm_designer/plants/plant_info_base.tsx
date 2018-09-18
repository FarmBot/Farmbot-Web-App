import * as React from "react";
import { t } from "i18next";
import { EditPlantInfoProps, PlantOptions } from "../interfaces";
import { history, getPathArray } from "../../history";
import { destroy, edit, save } from "../../api/crud";
import { isString } from "lodash";

export abstract class PlantInfoBase extends
  React.Component<EditPlantInfoProps, {}> {

  get templates() { return isString(this.props.openedSavedGarden); }

  get plantCategory() {
    return this.templates ? "saved_gardens/templates" : "plants";
  }

  get stringyID() {
    const aha = getPathArray()[this.templates ? 5 : 4] || "";
    console.log(" === " + aha);
    return aha;
  }

  get plant() { return this.props.findPlant(this.stringyID); }

  destroy = (plantUUID: string) => {
    this.props.dispatch(destroy(plantUUID))
      .then(() =>
        history.push(`/app/designer/${this.plantCategory}`), () => { });
  }

  updatePlant = (plantUUID: string, update: PlantOptions) => {
    if (this.plant) {
      this.props.dispatch(edit(this.plant, update));
      this.props.dispatch(save(plantUUID));
    }
  }

  fallback = () => {
    history.push(`/app/designer/${this.plantCategory}`);
    return <span>{t("Redirecting...")}</span>;
  }

}
