import * as React from "react";
import { connect } from "react-redux";
import { Page, Col } from "../ui";
import { Actions } from "../constants";
import { Everything } from "../interfaces";
import { DocsWidget } from "./docs";
import { ToursWidget } from "./tour_list";

export function mapStateToProps(props: Everything): { dispatch: Function } {
  const { dispatch } = props;
  return { dispatch };
}

export class RawHelp extends React.Component<{ dispatch: Function }, {}> {

  componentDidMount() {
    this.props.dispatch({ type: Actions.START_TOUR, payload: undefined });
  }

  render() {
    return <Page className="help-page">
      <Col xs={12} sm={6} smOffset={3}>
        <ToursWidget dispatch={this.props.dispatch} />
        <DocsWidget />
      </Col>
    </Page>;
  }
}

export const Help = connect(mapStateToProps)(RawHelp);
