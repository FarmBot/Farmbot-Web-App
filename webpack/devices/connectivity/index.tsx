import * as React from "react";
import { Widget, WidgetHeader, WidgetBody, Row, Col } from "../../ui/index";
import { t } from "i18next";
import { CowardlyDictionary } from "../../util";

interface Props {
  rowData: StatusRowProps[];
  children?: React.ReactChild;
}

interface State {

}

export class ConnectivityPanel extends React.Component<Props, State> {
  state: State = {};

  render() {
    return <Widget className="device-widget">
      <WidgetHeader
        title={t("Connectivity")}
        helpText={t("Diagnose connectivity issues with FarmBot and the browser.")}>

      </WidgetHeader>
      <WidgetBody>
        <ConnectivityRow from="from" to="to" />
        {this
          .props
          .rowData
          .map((x, y) => <ConnectivityRow {...x} key={y} />)}
        <hr />
        <Row>
          <Col xs={12}>
            {this.props.children}
          </Col>
        </Row>
      </WidgetBody>
    </Widget>;
  }
}

/** Data model for a single row within the <ConnectivityPanel /> */
export interface StatusRowProps {
  connectionStatus?: boolean | undefined;
  from: string;
  to: string;
  children?: React.ReactChild;
}

const iconLookup: CowardlyDictionary<string> = {
  true: "fa fa-thumbs-up",
  false: "fa fa-thumbs-down"
};

function ConnectivityRow(props: StatusRowProps) {
  const className = iconLookup["" + props.connectionStatus] || "fa fa-question";
  return <Row>
    <Col xs={1}>
      <i className={className}></i>
    </Col>
    <Col xs={1}>
      <p>
        {props.from}
      </p>
    </Col>
    <Col xs={1}>
      <p>
        {props.to}
      </p>
    </Col>
    <Col xs={9}>
      <p>
        {props.children}
      </p>
    </Col>
  </Row>;
}

interface RetryBtnProps {
  flags: boolean[];
}
export function RetryBtn(props: RetryBtnProps) {
  const failures = props.flags.includes(false);
  const color = failures ? "red" : "green";

  return <button className={color + " fb-button"}>
    Run Again
</button>;
}
