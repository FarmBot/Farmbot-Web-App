import * as React from "react";
import { DEFAULT_ICON } from "../../open_farm/icons";
import { push } from "../../history";
import { TaggedPlant, Mode } from "../map/interfaces";
import { unpackUUID } from "../../util";
import { t } from "../../i18next_wrapper";
import { maybeGetCachedPlantIcon } from "../../open_farm/cached_crop";
import { selectPoint, setHoveredPlant, mapPointClickAction } from "../map/actions";
import { plantAge } from "./map_state_to_props";
import { getMode } from "../map/util";

export interface PlantInventoryItemProps {
  plant: TaggedPlant;
  dispatch: Function;
  hovered: boolean;
}

interface PlantInventoryItemState {
  icon: string;
}

// The individual plants that show up in the farm designer sub nav.
export class PlantInventoryItem extends
  React.Component<PlantInventoryItemProps, PlantInventoryItemState> {
  state: PlantInventoryItemState = { icon: "" };

  updateStateIcon = (i: string) => this.setState({ icon: i });

  render() {
    const { plant, dispatch } = this.props;
    const plantId = (plant.body.id || "ERR_NO_PLANT_ID").toString();

    const toggle = (action: "enter" | "leave") => {
      const isEnter = action === "enter";
      const plantUUID = isEnter ? plant.uuid : undefined;
      const icon = isEnter ? this.state.icon : "";
      dispatch(setHoveredPlant(plantUUID, icon));
    };

    const click = () => {
      if (getMode() == Mode.boxSelect) {
        mapPointClickAction(dispatch, plant.uuid)();
        toggle("leave");
      } else {
        const plantCategory =
          unpackUUID(plant.uuid).kind === "PlantTemplate"
            ? "gardens/templates"
            : "plants";
        push(`/app/designer/${plantCategory}/${plantId}`);
        dispatch(selectPoint([plant.uuid]));
      }
    };

    const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) =>
      maybeGetCachedPlantIcon(slug, e.currentTarget, this.updateStateIcon);

    // Name given from OpenFarm's API.
    const label = plant.body.name || "Unknown plant";
    const slug = plant.body.openfarm_slug;

    return <div
      className={`plant-search-item ${this.props.hovered ? "hovered" : ""}`}
      key={plantId}
      onMouseEnter={() => toggle("enter")}
      onMouseLeave={() => toggle("leave")}
      onClick={click}>
      <img
        className="plant-search-item-image"
        src={DEFAULT_ICON}
        onLoad={onLoad} />
      <span className="plant-search-item-name">
        {label}
      </span>
      <i className="plant-search-item-age">
        {plantAge(plant)} {t("days old")}
      </i>
    </div>;
  }
}
