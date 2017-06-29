import * as React from "react";
import { render } from "react-dom";
import * as axios from "axios";
import { t, init } from "i18next";
import { fun as log, init as logInit } from "farmbot-toastr";
import { AuthState } from "../auth/interfaces";
import { Session } from "../session";
import { prettyPrintApiErrors } from "../util";
import { detectLanguage } from "../i18n";
import { API } from "../api";
import "../css/_index.scss";
import "../npm_addons";
import { hardRefresh } from "../util";
hardRefresh()
interface Props { };
interface State {
  hideServerSettings: boolean;
  email: string;
  password: string;
  agree_to_terms: boolean;
  serverHost: string;
  serverPort: string;
};

export class Wow extends React.Component<Props, Partial<State>> {
  constructor() {
    super();
    this.submit = this.submit.bind(this);
    this.toggleServerOpts = this.toggleServerOpts.bind(this);
    this.state = {
      hideServerSettings: true,
      agree_to_terms: true,
      serverHost: API.fetchHostName(),
      serverPort: API.inferPort()
    };
  }

  toggleServerOpts = () => {
    this.setState({ hideServerSettings: !this.state.hideServerSettings })
  }

  set = (name: keyof State) => (event: React.FormEvent<HTMLInputElement>) => {
    let state: { [name: string]: State[keyof State] } = {};
    state[name] = (event.currentTarget).value;
    this.setState(state);
  };

  submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    let { email, password, agree_to_terms } = this.state;
    let payload = { user: { email, password, agree_to_terms } };
    let url = `//${this.state.serverHost}:${this.state.serverPort}`;
    API.setBaseUrl(url);
    axios
      .post<AuthState>(API.current.tokensPath, payload)
      .then(resp => {
        Session.put(resp.data);
        window.location.href = "/app/controls";
      })
      .catch(error => {
        log(prettyPrintApiErrors(error));
      });
  }

  serverOpts() {
    if (this.state.hideServerSettings) {
      return <div />;
    } else {
      return <div>
        <label>{t("Server URL")}</label>
        <input type="text"
          onChange={this.set("serverHost").bind(this)}
          value={this.state.serverHost}>
        </input>
        <label>{t("Server Port")}</label>
        <input type="text"
          onChange={this.set("serverPort").bind(this)}
          value={this.state.serverPort}>
        </input>
      </div>;
    }
  }

  componentDidMount() {
    logInit();
    let body = t("Before logging in, you must agree to our latest Terms" +
      " of Service and Privacy Policy");
    log(body, "New Terms of Service");
  }

  render() {
    if (!process.env.TOS_URL && !process.env.PRIV_URL) {
      return <div className="static-page">
        <div className="all-content-wrapper">
          <div className="row">
            <div className={`widget-wrapper col-md-6 col-md-offset-3
                        col-sm-6 col-sm-offset-3`}>
              <div className="row">
                <div className="col-sm-12">
                  <div className="widget-header">
                    <h5>{t("Problem Loading Terms of Service")}</h5>
                  </div>
                </div>
              </div>
              <div className="row">
                <form onSubmit={this.submit}>
                  <div className="col-sm-12">
                    <div className="widget-content">
                      <div className="input-group">
                        <p>
                          {t("Something went wrong while rendering this page.")}
                        </p>
                        <p>
                          {t("Please send us an email at contact@farmbot.io or see")}
                          <a href="http://forum.farmbot.org/">
                            {t("the FarmBot forum.")}
                          </a>
                        </p>
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
    return <div className="static-page">
      <div className="all-content-wrapper">
        <div className="row">
          <div className={`widget-wrapper col-md-6 col-md-offset-3
                        col-sm-6 col-sm-offset-3`}>
            <div className="row">
              <div className="col-sm-12">
                <div className="widget-header">
                  <h5>{t("Agree to Terms of Service")}</h5>
                  <i className="fa fa-gear" onClick={this.toggleServerOpts}>
                  </i>
                </div>
              </div>
            </div>
            <div className="row">
              <form onSubmit={this.submit}>
                <div className="col-sm-12">
                  <div className="widget-content">
                    <div className="input-group">
                      <label> {t("Email")} </label>
                      <input type="email"
                        onChange={this.set("email").bind(this)}>
                      </input>
                      <label>{t("Password")}</label>
                      <input type="password"
                        onChange={this.set("password").bind(this)}>
                      </input>
                      <hr />
                      <ul>
                        <li>
                          <a href={process.env.TOS_URL}>
                            {t("Terms of Service")}
                          </a>
                          <span className="fa fa-external-link"></span>
                        </li>
                        <li>
                          <a href={process.env.PRIV_URL}>
                            {t("Privacy Policy")}
                          </a>
                          <span className="fa fa-external-link">
                          </span>
                        </li>
                      </ul>
                      <div className="row">
                        <div className="col-xs-12">
                          <button className="green fb-button">
                            {t("I Agree to the Terms of Service")}
                          </button>
                        </div>
                      </div>
                      {this.serverOpts()}
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

detectLanguage().then((config) => {
  init(config, (err, t) => {
    let node = document.createElement("DIV");
    node.id = "root";
    document.body.appendChild(node);

    let reactElem = React.createElement(Wow, {});
    let domElem = document.getElementById("root");

    if (domElem) {
      render(reactElem, domElem);
    } else {
      throw new Error(t("Add a div with id `root` to the page first."));
    };
  });
});
