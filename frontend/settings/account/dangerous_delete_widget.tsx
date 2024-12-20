import React from "react";
import { Row } from "../../ui";
import { DangerousDeleteProps, DeletionRequest } from "./interfaces";
import { BlurablePassword } from "../../ui/blurable_password";
import { t } from "../../i18next_wrapper";

/** Widget for permanently deleting large amounts of user data. */
export class DangerousDeleteWidget extends
  React.Component<DangerousDeleteProps, DeletionRequest> {
  state: DeletionRequest = { password: "" };

  componentWillUnmount() {
    this.setState({ password: "" });
  }

  onClick = () =>
    this.props.dispatch(this.props.onClick({ password: this.state.password }));

  render() {
    return <div className="grid">
      <label>
        {t(this.props.title)}
      </label>
      <div className="settings-warning-banner">
        <p>
          {t(this.props.warning)}
          <br /><br />
          {t(this.props.confirmation)}
        </p>
      </div>
      <form>
        <Row className="grid-exp-1">
          <div className="grid half-gap">
            <label>
              {t("Enter Password")}
            </label>
            <BlurablePassword
              onCommit={e =>
                this.setState({ password: e.currentTarget.value })} />
          </div>
          <button
            onClick={this.onClick}
            className="red fb-button"
            title={t(this.props.title)}
            type="button">
            {t(this.props.title)}
          </button>
        </Row>
      </form>
    </div>;
  }
}
