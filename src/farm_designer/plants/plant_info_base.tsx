import * as React from "react";
import { EditPlantInfoProps } from "../interfaces";
import { history } from "../../history";
import { destroy } from "../../api/crud";
import { error } from "farmbot-toastr";

export abstract class PlantInfoBase extends
  React.Component<EditPlantInfoProps, {}> {

  get stringyID() {
    // TODO: ("We should put this into a query object incase the URL changes")
    return history.getCurrentLocation().pathname.split("/")[4] || "";
  }

  get plant() { return this.props.findPlant(this.stringyID); }

  destroy = (plantUUID: string) => {
    this.props.dispatch(destroy(plantUUID))
      .then(() => history.push("/app/designer/plants"))
      .catch(() => error("Could not delete plant.", "Error"));
  }

  fallback = () => {
    return <span>Redirecting...</span>;
  }

}
