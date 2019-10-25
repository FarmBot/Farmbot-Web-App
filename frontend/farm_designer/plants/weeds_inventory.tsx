import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { DesignerNavTabs, Panel } from "../panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic
} from "../../ui/empty_state_wrapper";
import { Content } from "../../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop
} from "./designer_panel";
import { t } from "../../i18next_wrapper";
import { TaggedGenericPointer } from "farmbot";
import { selectAllGenericPointers } from "../../resources/selectors";
import { PointInventoryItem } from "./point_inventory_item";

export interface WeedsProps {
  points: TaggedGenericPointer[];
  dispatch: Function;
}

interface WeedsState {
  searchTerm: string;
}

export const mapStateToProps = (props: Everything): WeedsProps => ({
  points: selectAllGenericPointers(props.resources.index)
    .filter(x => !x.body.discarded_at)
    .filter(x => x.body.name.toLowerCase().includes("weed")),
  dispatch: props.dispatch,
});

export class RawWeeds extends React.Component<WeedsProps, WeedsState> {
  state: WeedsState = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: currentTarget.value });
  }

  render() {
    return <DesignerPanel panelName={"weeds-inventory"} panel={Panel.Weeds}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Weeds}
        linkTo={"/app/designer/weeds/add"}
        title={t("Add weed")}>
        <input type="text" onChange={this.update}
          placeholder={t("Search your weeds...")} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"weeds-inventory"}>
        <EmptyStateWrapper
          notEmpty={this.props.points.length > 0}
          graphic={EmptyStateGraphic.weeds}
          title={t("No weeds yet.")}
          text={Content.NO_WEEDS}
          colorScheme={"weeds"}>
          {this.props.points
            .filter(p => p.body.name.toLowerCase()
              .includes(this.state.searchTerm.toLowerCase()))
            .map(p => {
              return <PointInventoryItem
                key={p.uuid}
                tpp={p}
                dispatch={this.props.dispatch} />;
            })}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Weeds = connect(mapStateToProps)(RawWeeds);
