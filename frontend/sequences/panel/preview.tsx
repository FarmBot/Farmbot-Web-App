import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { t } from "../../i18next_wrapper";
import { ResourceTitle } from "./editor";
import { BooleanSetting } from "../../session_keys";
import { Path } from "../../internal_urls";
import { mapStateToProps } from "../state_to_props";
import {
  SequencePreviewProps, loadSequenceVersion, SequencePreviewContent,
  ImportBanner, SequencePreviewState,
} from "./preview_support";

export class RawDesignerSequencePreview
  extends React.Component<SequencePreviewProps, SequencePreviewState> {
  state: SequencePreviewState = {
    sequence: undefined,
    viewSequenceCeleryScript: false,
    variablesCollapsed: false,
    descriptionCollapsed: false,
    stepsCollapsed: false,
    licenseCollapsed: true,
    error: false,
  };

  componentDidMount = () => {
    loadSequenceVersion({
      id: Path.getSlug(Path.sequenceVersion()),
      onSuccess: sequence => this.setState({
        sequence,
        descriptionCollapsed: !sequence.body.description,
      }),
      onError: () => this.setState({ error: true }),
    });
  };

  toggleSection = (key: keyof SequencePreviewState) => () =>
    this.setState({ ...this.state, [key]: !this.state[key] });

  render() {
    const panelName = "designer-sequence-editor";
    const { sequence } = this.state;
    const viewCeleryScript = this.props.getWebAppConfigValue(
      BooleanSetting.view_celery_script);
    return <DesignerPanel panelName={panelName} panel={Panel.Sequences}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Sequences}
        colorClass={sequence?.body.color}
        titleElement={<ResourceTitle
          key={sequence?.body.name}
          readOnly={true}
          resource={sequence}
          fallback={this.state.error ? t("Sequence not found") : t("Loading...")}
          dispatch={this.props.dispatch} />}
        backTo={Path.designerSequences()} />
      <DesignerPanelContent panelName={panelName}>
        <ImportBanner sequence={sequence} />
        <div className={"sequence-editor-content"}>
          <SequencePreviewContent
            viewCeleryScript={!!viewCeleryScript}
            dispatch={this.props.dispatch}
            resources={this.props.resources}
            toggleSection={this.toggleSection}
            sequencesState={this.props.sequencesState}
            showToolbar={true}
            {...this.state} />
        </div>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerSequencePreview =
  connect(mapStateToProps)(RawDesignerSequencePreview);
// eslint-disable-next-line import/no-default-export
export default DesignerSequencePreview;
