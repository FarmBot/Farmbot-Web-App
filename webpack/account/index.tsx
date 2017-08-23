import * as React from "react";
import { connect } from "react-redux";
import { Settings, DeleteAccount, ChangePassword } from "./components";
import { Props } from "./interfaces";
import { Page, Row, Col } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { User } from "../auth/interfaces";
import { edit, save } from "../api/crud";
import { updateNO } from "../resources/actions";
import { deleteUser } from "./actions";
import { success } from "farmbot-toastr/dist";

type State = Partial<User>;

let KEYS: (keyof User)[] = ["id", "name", "email", "created_at", "updated_at"];

let isKey = (x: string): x is keyof User => KEYS.includes(x as keyof User);

@connect(mapStateToProps)
export class Account extends React.Component<Props, State> {
  state: State = {};

  onChange = (e: React.FormEvent<HTMLInputElement>) => {
    let { name, value } = e.currentTarget;
    if (isKey(name)) {
      this.setState({ [name]: value });
      this.props.dispatch(edit(this.props.user, this.state));
    } else {
      throw new Error("Bad key: " + name);
    }
  };

  onSave = () => this
    .props
    .dispatch(save(this.props.user.uuid))
    .then(() => success("saved"), updateNO);

  render() {
    return (
      <Page className="account">
        <Col xs={12} sm={6} smOffset={3}>
          <Row>
            <Settings
              user={this.props.user}
              onChange={this.onChange}
              onSave={this.onSave} />
          </Row>
          <Row>
            <ChangePassword />
          </Row>
          <Row>
            <DeleteAccount
              onClick={(password) => this
                .props
                .dispatch(deleteUser({ password }))} />
          </Row>
        </Col>
      </Page>
    );
  }
}
