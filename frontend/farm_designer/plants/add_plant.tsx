import * as React from "react";
import { Everything } from "../../interfaces";
import { connect } from "react-redux";
import { history } from "../../history";
import { svgToUrl } from "../../open_farm/icons";
import { CropLiveSearchResult, OpenfarmSearch } from "../interfaces";
import { setDragIcon } from "../actions";
import { getCropHeaderProps, searchForCurrentCrop } from "./crop_info";
import { DesignerPanel, DesignerPanelHeader } from "./designer_panel";
import { OFSearch } from "../util";
import { t } from "../../i18next_wrapper";
import { Panel } from "../panel_header";
import { PlantGrid } from "./plant_grid";

export const mapStateToProps = (props: Everything): AddPlantProps =>
  ({
    cropSearchResults: props
      .resources
      .consumers
      .farm_designer
      .cropSearchResults,
    dispatch: props.dispatch,
    openfarmSearch: OFSearch,
  });

const AddPlantDescription = ({ svgIcon }: { svgIcon: string | undefined }) =>
  <div>
    <img className="crop-drag-info-image"
      src={svgToUrl(svgIcon)}
      alt={t("plant icon")}
      width={100}
      height={100}
      onDragStart={setDragIcon(svgIcon)} />
    <b>{t("Drag and drop")}</b> {t("the icon onto the map or ")}
    <b>{t("CLICK anywhere within the grid")}</b> {t(`to add the plant
  to the map. You can add the plant as many times as you need to
  before pressing DONE to finish.`)}
    <PlantGrid />
  </div>;

export interface AddPlantProps {
  cropSearchResults: CropLiveSearchResult[];
  dispatch: Function;
  openfarmSearch: OpenfarmSearch;
}

export class RawAddPlant extends React.Component<AddPlantProps, {}> {

  componentDidMount() {
    this.props.dispatch(searchForCurrentCrop(this.props.openfarmSearch));
  }

  render() {
    const { cropSearchResults } = this.props;
    const { crop, result, basePath, backgroundURL } =
      getCropHeaderProps({ cropSearchResults });
    const panelName = "add-plant";
    return <DesignerPanel panelName={panelName} panel={Panel.Plants}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Plants}
        title={result.crop.name}
        style={{ background: backgroundURL }}
        descriptionElement={<AddPlantDescription svgIcon={result.crop.svg_icon} />}>
        <a className="right-button"
          onClick={() => history.push(basePath + crop)}>
          {t("Done")}
        </a>
      </DesignerPanelHeader>
    </DesignerPanel>;
  }
}

export const AddPlant = connect(mapStateToProps)(RawAddPlant);
