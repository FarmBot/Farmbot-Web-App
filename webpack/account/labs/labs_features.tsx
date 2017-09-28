import * as React from "react";
import { WidgetHeader, Widget, WidgetBody } from "../../ui/index";
import { LabsFeaturesList } from "./labs_features_list_ui";
import { maybeToggleFeature } from "./labs_features_list_data";

interface Props {

}

interface State {

}

export class LabsFeatures extends React.Component<Props, State> {

  state: State = {};

  render() {
    return <Widget className="peripherals-widget">
      <WidgetHeader title={"Experimental Features"}
        helpText={"Unstable features to try out (beta)."}>
      </WidgetHeader>
      <WidgetBody>
        <LabsFeaturesList onToggle={(x) => {
          maybeToggleFeature(x);
          this.forceUpdate();
        }} />
      </WidgetBody>
    </Widget>;
  }
}
