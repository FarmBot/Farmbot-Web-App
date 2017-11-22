import * as React from "react";
import { t } from "i18next";
import { EditPlantInfoProps } from "../interfaces";
import { history, getPathArray } from "../../history";
import { destroy } from "../../api/crud";
import { error } from "farmbot-toastr";

export abstract class PlantInfoBase extends
  React.Component<EditPlantInfoProps, {}> {

  get stringyID() {
    // TODO: ("We should put this into a query object incase the URL changes")
    return getPathArray()[4] || "";
  }

  get plant() { return this.props.findPlant(this.stringyID); }

  destroy = (plantUUID: string) => {
    this.props.dispatch(destroy(plantUUID))
      .then(() => history.push("/app/designer/plants"))
      .catch(() => error(t("Could not delete plant."), t("Error")));
  }

  fallback = () => {
    history.push("/app/designer/plants");
    return <span>Redirecting...</span>;
  }

}
