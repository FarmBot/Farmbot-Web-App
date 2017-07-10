import * as React from "react";
import { t } from "i18next";
import * as moment from "moment";
import { DEFAULT_ICON, cachedIcon, svgToUrl } from "../../open_farm/index";
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
    let plant = this.props.tpp.body;
    let { tpp, dispatch } = this.props;
    let plantId = (plant.id || "ERR_NO_PLANT_ID").toString();

    let toggle = () => {
      let { icon } = this.state;
      dispatch({ type: "TOGGLE_HOVERED_PLANT", payload: { plant: tpp, icon } });
    };

    let click = () => {
      push("/app/designer/plants/" + plantId);
      dispatch({ type: "SELECT_PLANT", payload: tpp.uuid });
    };

    // See `cachedIcon` for more details on this.
    let maybeGetCachedIcon = (e: IMGEvent) => {
      let OFS = tpp.body.openfarm_slug;
      let img = e.currentTarget;
      OFS && cachedIcon(OFS)
        .then((crop) => {
          let i = svgToUrl(crop.svg_icon);
          i !== img.getAttribute("src") && img.setAttribute("src", i);
          this.setState({ icon: i });
        });
    };

    // Name given from OpenFarm's API.
    let label = plant.name || "Unknown plant";

    // Original planted date vs time now to determine age.
    let plantedAt = plant.created_at || moment();
    let currentDay = moment();
    let daysOld = currentDay.diff(moment(plantedAt), "days") + 1;

    return <div
      className="plant-search-item"
      key={plantId}
      onMouseEnter={toggle}
      onMouseLeave={toggle}
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
