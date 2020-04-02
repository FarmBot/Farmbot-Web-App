import * as React from "react";
import { connect } from "react-redux";
import { PointInventoryItem } from "./point_inventory_item";
import { Everything } from "../../interfaces";
import { DesignerNavTabs, Panel } from "../panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../../ui/empty_state_wrapper";
import { Content } from "../../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../designer_panel";
import { selectAllGenericPointers } from "../../resources/selectors";
import { TaggedGenericPointer } from "farmbot";
import { t } from "../../i18next_wrapper";

export interface PointsProps {
  genericPoints: TaggedGenericPointer[];
  dispatch: Function;
  hoveredPoint: string | undefined;
}

interface PointsState {
  searchTerm: string;
}

export function mapStateToProps(props: Everything): PointsProps {
  const { hoveredPoint } = props.resources.consumers.farm_designer;
  return {
    genericPoints: selectAllGenericPointers(props.resources.index)
      .filter(x => !x.body.discarded_at),
    dispatch: props.dispatch,
    hoveredPoint,
  };
}

export class RawPoints extends React.Component<PointsProps, PointsState> {
  state: PointsState = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: currentTarget.value });
  }

  render() {
    return <DesignerPanel panelName={"point-inventory"} panel={Panel.Points}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Points}
        linkTo={"/app/designer/points/add"}
        title={t("Add point")}>
        <input type="text" onChange={this.update} name="searchTerm"
          placeholder={t("Search your points...")} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"points"}>
        <EmptyStateWrapper
          notEmpty={this.props.genericPoints.length > 0}
          graphic={EmptyStateGraphic.points}
          title={t("No points yet.")}
          text={Content.NO_POINTS}
          colorScheme={"points"}>
          {this.props.genericPoints
            .filter(p => p.body.name.toLowerCase()
              .includes(this.state.searchTerm.toLowerCase()))
            .map(p => <PointInventoryItem
              key={p.uuid}
              tpp={p}
              hovered={this.props.hoveredPoint === p.uuid}
              dispatch={this.props.dispatch} />)}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Points = connect(mapStateToProps)(RawPoints);
