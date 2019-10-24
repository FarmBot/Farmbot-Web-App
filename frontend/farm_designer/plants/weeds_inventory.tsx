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

export interface WeedsProps {
  dispatch: Function;
}

interface WeedsState {
  searchTerm: string;
}

export const mapStateToProps = (props: Everything): WeedsProps => ({
  dispatch: props.dispatch,
});

export class RawWeeds extends React.Component<WeedsProps, WeedsState> {
  state: WeedsState = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: currentTarget.value });
  }

  render() {
    return <DesignerPanel panelName={"weeds-inventory"} panelColor={"red"}>
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
          notEmpty={[].length > 0}
          graphic={EmptyStateGraphic.weeds}
          title={t("No weeds yet.")}
          text={Content.NO_WEEDS}
          colorScheme={"weeds"}>
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Weeds = connect(mapStateToProps)(RawWeeds);
