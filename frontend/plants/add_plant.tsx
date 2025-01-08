import React from "react";
import { Everything } from "../interfaces";
import { connect } from "react-redux";
import { DesignerState } from "../farm_designer/interfaces";
import { setDragIcon } from "../farm_designer/map/actions";
import {
  DesignerPanel, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { PlantGrid } from "./grid/plant_grid";
import { getWebAppConfig } from "../resources/getters";
import { BotPosition } from "../devices/interfaces";
import { validBotLocationData } from "../util/location";
import { Path } from "../internal_urls";
import { findCrop, findIcon, findImage } from "../crops/find";

export const mapStateToProps = (props: Everything): AddPlantProps => ({
  designer: props.resources.consumers.farm_designer,
  xy_swap: !!getWebAppConfig(props.resources.index)?.body.xy_swap,
  dispatch: props.dispatch,
  botPosition: validBotLocationData(props.bot.hardware.location_data).position,
});

interface APDProps {
  slug: string;
  children?: React.ReactNode;
}

const AddPlantDescription = ({ slug, children }: APDProps) =>
  <div className={"add-plant-description"}>
    <img className="crop-drag-info-image"
      src={findIcon(slug)}
      alt={t("plant icon")}
      width={100}
      height={100}
      onDragStart={setDragIcon(slug)} />
    <div className={"drop-icon-description"}>
      <b>{t("Drag and drop")}</b> {t("the icon onto the map or ")}
      <b>{t("CLICK anywhere within the grid")}</b> {t(`to add the plant
  to the map. Alternatively, you can plant a grid using the form below.`)}
    </div>
    {children}
  </div>;

export interface AddPlantProps {
  dispatch: Function;
  xy_swap: boolean;
  botPosition: BotPosition;
  designer: DesignerState;
}

export class RawAddPlant extends React.Component<AddPlantProps, {}> {
  render() {
    const panelName = "add-plant";
    const slug = Path.getCropSlug();
    const crop = findCrop(slug);
    const descElem = <AddPlantDescription slug={slug}>
      <PlantGrid
        xy_swap={this.props.xy_swap}
        dispatch={this.props.dispatch}
        openfarm_slug={slug}
        spread={crop.spread}
        botPosition={this.props.botPosition}
        designer={this.props.designer}
        itemName={crop.name} />
    </AddPlantDescription>;
    return <DesignerPanel panelName={panelName} panel={Panel.Plants}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Plants}
        title={crop.name}
        style={{
          background: findImage(slug),
          overflowY: "scroll",
          overflowX: "hidden"
        }}
        descriptionElement={descElem} />
    </DesignerPanel>;
  }
}

export const AddPlant = connect(mapStateToProps)(RawAddPlant);
// eslint-disable-next-line import/no-default-export
export default AddPlant;
