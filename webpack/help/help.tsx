import * as React from "react";
import { connect } from "react-redux";
import { t } from "i18next";
import { Widget, WidgetBody, WidgetHeader, Page, Col } from "../ui";
import { ToolTips, Actions } from "../constants";
import { Everything } from "../interfaces";
import { tourNames } from "./tours";

const TourList = ({ dispatch }: { dispatch: Function }) =>
  <div className="tour-list">
    {tourNames().map(tour => <div key={tour.name}>
      <label>{tour.description}</label>
      <button className="fb-button green"
        onClick={() =>
          dispatch({ type: Actions.START_TOUR, payload: tour.name })}>
        {t("Start tour")}
      </button>
    </div>)}
  </div>;

export function mapStateToProps(props: Everything): { dispatch: Function } {
  const { dispatch } = props;
  return { dispatch };
}

@connect(mapStateToProps)
export class Help extends React.Component<{ dispatch: Function }, {}> {

  componentDidMount() {
    this.props.dispatch({ type: Actions.START_TOUR, payload: undefined });
  }

  render() {
    return <Page className="help-page">
      <Col xs={12} sm={6} smOffset={3}>
        <Widget className="help-widget">
          <WidgetHeader helpText={ToolTips.TOURS} title={t("Tours")} />
          <WidgetBody>
            {t("What do you need help with?")}
            <TourList dispatch={this.props.dispatch} />
          </WidgetBody>
        </Widget>
      </Col>
    </Page>;
  }
}
