import React from "react";
import { Everything } from "../interfaces";
import { connect } from "react-redux";
import { svgToUrl } from "../open_farm/icons";
import { CropLiveSearchResult, OpenfarmSearch } from "../farm_designer/interfaces";
import { setDragIcon } from "../farm_designer/map/actions";
import { getCropHeaderProps, searchForCurrentCrop } from "./crop_info";
import {
  DesignerPanel, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { OFCropFetch } from "../farm_designer/util";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { PlantGrid } from "./grid/plant_grid";
import { getWebAppConfig } from "../resources/getters";
import { BotPosition } from "../devices/interfaces";
import { validBotLocationData } from "../util/location";

export const mapStateToProps = (props: Everything): AddPlantProps => ({
  cropSearchResults: props
    .resources
    .consumers
    .farm_designer
    .cropSearchResults,
  xy_swap: !!getWebAppConfig(props.resources.index)?.body.xy_swap,
  dispatch: props.dispatch,
  openfarmCropFetch: OFCropFetch,
  botPosition: validBotLocationData(props.bot.hardware.location_data).position,
});

interface APDProps {
  svgIcon: string | undefined;
  children?: React.ReactChild;
}

const AddPlantDescription = ({ svgIcon, children }: APDProps) =>
  <div className={"add-plant-description"}>
    <img className="crop-drag-info-image"
      src={svgToUrl(svgIcon)}
      alt={t("plant icon")}
      width={100}
      height={100}
      onDragStart={setDragIcon(svgIcon)} />
    <div className={"drop-icon-description"}>
      <b>{t("Drag and drop")}</b> {t("the icon onto the map or ")}
      <b>{t("CLICK anywhere within the grid")}</b> {t(`to add the plant
  to the map. Alternatively, you can plant a grid using the form below.`)}
    </div>
    {children}
  </div>;

export interface AddPlantProps {
  cropSearchResults: CropLiveSearchResult[];
  dispatch: Function;
  openfarmCropFetch: OpenfarmSearch;
  xy_swap: boolean;
  botPosition: BotPosition;
}

export class RawAddPlant extends React.Component<AddPlantProps, {}> {

  componentDidMount() {
    this.props.dispatch(searchForCurrentCrop(this.props.openfarmCropFetch));
  }

  render() {
    const { cropSearchResults } = this.props;
    const { result, backgroundURL } =
      getCropHeaderProps({ cropSearchResults });
    const panelName = "add-plant";
    const descElem = <AddPlantDescription svgIcon={result.crop.svg_icon}>
      <PlantGrid
        xy_swap={this.props.xy_swap}
        dispatch={this.props.dispatch}
        openfarm_slug={result.crop.slug}
        spread={result.crop.spread}
        botPosition={this.props.botPosition}
        itemName={result.crop.name} />
    </AddPlantDescription>;
    return <DesignerPanel panelName={panelName} panel={Panel.Plants}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Plants}
        title={result.crop.name}
        style={{
          background: backgroundURL,
          overflowY: "scroll",
          overflowX: "hidden"
        }}
        descriptionElement={descElem} />
    </DesignerPanel>;
  }
}

export const AddPlant = connect(mapStateToProps)(RawAddPlant);
