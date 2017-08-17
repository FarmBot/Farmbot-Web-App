import * as React from "react";
import { connect } from "react-redux";
import { Settings, DeleteAccount, ChangePassword } from "./components";
import { State, Props } from "./interfaces";
import { Page, Row, Col } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { User } from "../auth/interfaces";

@connect(mapStateToProps)
export class Account extends React.Component<Props, State> {
  state: State = {};

  set = (name: (keyof User)) =>
    (event: React.FormEvent<HTMLInputElement>) => {
      let { value } = event.currentTarget;
      this.setState({ [name]: value });
    }

  savePassword = () => {
    this.props.saveUser(this.props.dispatch, this.state as User);

    this.setState({
      password: "",
      new_password: "",
      new_password_confirmation: ""
    });
  }

  render() {
    return (
      <Page className="account">
        <Col xs={12} sm={6} smOffset={3}>
          <Row>
            <Settings
              user={this.props.user}
              onChange={this.set}
              onSave={() => this.props.saveUser(this.props.dispatch, this.state)} />
          </Row>
          <Row>
            <ChangePassword
              password={this.state.password || ""}
              new_password={this.state.new_password || ""}
              new_password_confirmation=
              {this.state.new_password_confirmation || ""}
              onChange={this.set}
              onClick={this.savePassword}
              user={this.props.user} />
          </Row>
          <Row>
            <DeleteAccount
              deletion_confirmation=
              {this.state.deletion_confirmation || ""}
              onChange={this.set}
              onClick={() => this
                .props
                .enactDeletion(this.props.dispatch,
                this.state.deletion_confirmation)} />
          </Row>
        </Col>
      </Page>
    );
  }
}
