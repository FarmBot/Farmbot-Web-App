import * as React from "react";
import * as axios from "axios";
import { t } from "i18next";
import { error as log, init as logInit } from "farmbot-toastr";
import { prettyPrintApiErrors } from "../util";
import { API } from "../api";
import { State, Props } from "./interfaces";
import { hardRefresh } from "../util";
hardRefresh()
export class PasswordReset extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      password: "",
      passwordConfirmation: "",
      serverURL: "",
      serverPort: ""
    };
  }

  componentDidMount() {
    logInit();
    API.setBaseUrl(API.fetchBrowserLocation());
    this.setState({
      serverURL: API.fetchHostName(),
      serverPort: API.inferPort()
    });
  }

  set = (name: string) => (event: React.FormEvent<HTMLInputElement>) => {
    let state: { [name: string]: string } = {};
    state[name] = (event.currentTarget).value;
    this.setState(state);
  };

  submit(e: React.SyntheticEvent<HTMLInputElement>) {
    e.preventDefault();
    let { password, passwordConfirmation } = this.state;
    let token = window.location.href.split("/").pop();
    axios.put<{}>(API.current.passwordResetPath, {
      id: token,
      password,
      password_confirmation: passwordConfirmation,
    }).then(resp => {
      window.location.href = "/";
    }).catch(error => {
      log(prettyPrintApiErrors(error));
    });
  }

  render() {
    return <div className="static-page">
      <h1>{t("Reset your password")}</h1>
      <div className="all-content-wrapper">
        <div className="row">
          <div className={`widget-wrapper col-md-6 col-md-offset-3
                        col-sm-6 col-sm-offset-3`}>
            <div className="row">
              <div className="col-sm-12">
                <div className="widget-header">
                  <h5>{t("Reset Password")}</h5>
                </div>
              </div>
            </div>
            <div className="row">
              <form onSubmit={this.submit.bind(this)}>
                <div className="col-sm-12">
                  <div className="widget-content">
                    <div className="input-group">
                      <label>{t("New Password")}</label>
                      <input type="password"
                        onChange={this.set("password")
                          .bind(this)}>
                      </input>
                      <label>
                        {t("Confirm Password")}
                      </label>
                      <input type="password"
                        onChange={this.set(
                          "passwordConfirmation")
                          .bind(this)}>
                      </input>
                    </div>
                    <div className="row">
                      <div className="col-xs-12">
                        <button className="fb-button green">
                          {t("Reset")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}
