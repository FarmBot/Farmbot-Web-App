import * as React from "react";

import { EditPlantInfoProps, PlantOptions } from "../interfaces";
import { history, getPathArray } from "../../history";
import { destroy, edit, save } from "../../api/crud";
import { isString } from "lodash";
import { t } from "../../i18next_wrapper";

export abstract class PlantInfoBase extends
  React.Component<EditPlantInfoProps, {}> {

  get templates() { return isString(this.props.openedSavedGarden); }

  get plantCategory() {
    return this.templates ? "saved_gardens/templates" : "plants";
  }

  get stringyID() { return getPathArray()[this.templates ? 5 : 4] || ""; }
  get plant() { return this.props.findPlant(this.stringyID); }
  destroy = (plantUUID: string) => {
    this.props.dispatch(destroy(plantUUID));
  }

  updatePlant = (plantUUID: string, update: PlantOptions) => {
    if (this.plant) {
      this.props.dispatch(edit(this.plant, update));
      this.props.dispatch(save(plantUUID));
    }
  }

  fallback = () => {
    history.push("/app/designer/plants");
    return <span>{t("Redirecting...")}</span>;
  }

}
