import * as React from "react";
import { Everything } from "../../interfaces";
import { connect } from "react-redux";
import { svgToUrl } from "../../open_farm/icons";
import { CropLiveSearchResult, OpenfarmSearch } from "../interfaces";
import { setDragIcon } from "../actions";
import { getCropHeaderProps, searchForCurrentCrop } from "./crop_info";
import { DesignerPanel, DesignerPanelHeader } from "./designer_panel";
import { OFSearch } from "../util";
import { t } from "../../i18next_wrapper";
import { Panel } from "../panel_header";
import { PlantGrid } from "./grid/plant_grid";
import { getWebAppConfig } from "../../resources/getters";

export const mapStateToProps = (props: Everything): AddPlantProps =>
  ({
    cropSearchResults: props
      .resources
      .consumers
      .farm_designer
      .cropSearchResults,
    xy_swap: !!getWebAppConfig(props.resources.index)?.body.xy_swap,
    dispatch: props.dispatch,
    openfarmSearch: OFSearch,
  });

interface APDProps {
  svgIcon: string | undefined;
  children?: React.ReactChild;
}

const AddPlantDescription = ({ svgIcon, children }: APDProps) =>
  <div>
    <img className="crop-drag-info-image"
      src={svgToUrl(svgIcon)}
      alt={t("plant icon")}
      width={100}
      height={100}
      onDragStart={setDragIcon(svgIcon)} />
    <b>{t("Drag and drop")}</b> {t("the icon onto the map or ")}
    <b>{t("CLICK anywhere within the grid")}</b> {t(`to add the plant
  to the map. Alternatively, you can plant a grid using the form below.`)}
    {children}
  </div>;

export interface AddPlantProps {
  cropSearchResults: CropLiveSearchResult[];
  dispatch: Function;
  openfarmSearch: OpenfarmSearch;
  xy_swap: boolean;
}

export class RawAddPlant extends React.Component<AddPlantProps, {}> {

  componentDidMount() {
    this.props.dispatch(searchForCurrentCrop(this.props.openfarmSearch));
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
        cropName={result.crop.name} />
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
