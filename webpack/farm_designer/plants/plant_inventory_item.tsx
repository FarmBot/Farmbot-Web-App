import * as React from "react";
import { t } from "i18next";
import * as moment from "moment";
import { DEFAULT_ICON, cachedCrop, svgToUrl } from "../../open_farm/icons";
import { push } from "../../history";
import { TaggedPlantPointer } from "../../resources/tagged_resources";

type IMGEvent = React.SyntheticEvent<HTMLImageElement>;

interface PlantInventoryItemProps {
  tpp: TaggedPlantPointer;
  dispatch: Function;
}

interface PlantInventoryItemState {
  icon: string;
}

// The inidividual plants that show up in the farm designer sub nav.
export class PlantInventoryItem extends
  React.Component<PlantInventoryItemProps, PlantInventoryItemState> {

  state: PlantInventoryItemState = { icon: "" };

  render() {
    const plant = this.props.tpp.body;
    const { tpp, dispatch } = this.props;
    const plantId = (plant.id || "ERR_NO_PLANT_ID").toString();

    const toggle = (action: "enter" | "leave") => {
      switch (action) {
        case "enter":
          const { icon } = this.state;
          dispatch({
            type: "TOGGLE_HOVERED_PLANT", payload: {
              plantUUID: tpp.uuid, icon
            }
          });
          break;
        case "leave":
          dispatch({
            type: "TOGGLE_HOVERED_PLANT", payload: {
              plantUUID: undefined, icon: ""
            }
          });
          break;
      }
    };

    const click = () => {
      push("/app/designer/plants/" + plantId);
      dispatch({ type: "SELECT_PLANT", payload: [tpp.uuid] });
    };

    // See `cachedIcon` for more details on this.
    const maybeGetCachedIcon = (e: IMGEvent) => {
      const OFS = tpp.body.openfarm_slug;
      const img = e.currentTarget;
      OFS && cachedCrop(OFS)
        .then((crop) => {
          const i = svgToUrl(crop.svg_icon);
          i !== img.getAttribute("src") && img.setAttribute("src", i);
          this.setState({ icon: i });
        });
    };

    // Name given from OpenFarm's API.
    const label = plant.name || "Unknown plant";

    // Original planted date vs time now to determine age.
    const plantedAt = plant.created_at || moment();
    const currentDay = moment();
    const daysOld = currentDay.diff(moment(plantedAt), "days") + 1;

    return <div
      className="plant-search-item"
      key={plantId}
      onMouseEnter={() => toggle("enter")}
      onMouseLeave={() => toggle("leave")}
      onClick={click}>
      <img
        className="plant-search-item-image"
        src={DEFAULT_ICON}
        onLoad={maybeGetCachedIcon} />
      <span className="plant-search-item-name">
        {label}
      </span>
      <i className="plant-search-item-age">
        {daysOld} {t("days old")}
      </i>
    </div>;
  }
}
