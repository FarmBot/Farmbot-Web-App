import React from "react";
import { isUndefined } from "lodash";
import { Actions } from "../constants";
import { ToastProps, ToastsProps, ToastState } from "./interfaces";
import { store } from "../redux/store";
import { Markdown } from "../ui";
import { Path } from "../internal_urls";
import { Navigate } from "react-router";

export class Toast extends React.Component<ToastProps, ToastState> {
  state: ToastState = {
    timeout: 7,
    isHovered: false,
    detached: false,
    dismissed: false,
    intervalId: undefined,
  };

  get timed() { return !this.props.noTimer && !this.props.noDismiss; }

  componentDidMount() {
    this.timed &&
      this.setState({ intervalId: setInterval(this.advanceTimer, 100) });
  }

  componentWillUnmount() {
    !isUndefined(this.state.intervalId) && clearInterval(this.state.intervalId);
  }

  detach = () => {
    this.setState({ detached: true });
    setTimeout(() =>
      this.props.dispatch({ type: Actions.REMOVE_TOAST, payload: this.props.id }));
  };

  advanceTimer = () => {
    if (this.state.isHovered || !this.timed || this.state.detached) {
      return;
    }
    if (this.state.timeout <= 0.800) { this.dismiss(); }
    this.setState({ timeout: this.state.timeout - 0.100 });
    if (this.state.timeout <= 0) { this.detach(); }
  };

  dismiss = () => {
    if (this.props.noDismiss) { return; }
    this.setState({ dismissed: true });
    this.detach();
  };

  render() {
    const { color, redirect } = this.props;
    const style = {
      animationPlayState: this.state.isHovered ? "paused" : "running",
    };
    const classNames = [
      "toast",
      "active",
      color,
      !this.timed ? "no-timer" : "",
      this.state.dismissed ? "poof" : "",
      this.state.detached ? "gone" : "",
    ];
    return <div
      className={classNames.join(" ")}
      id={this.props.id}
      onClick={this.dismiss}
      onMouseEnter={() => this.setState({ isHovered: true })}
      onMouseLeave={() => this.setState({ isHovered: false })}>
      <h4 className={"toast-title"}>{this.props.title}</h4>
      <div className={"toast-message"}>
        <Markdown>
          {this.props.message.replace(/\s+/g, " ")}
        </Markdown>
      </div>
      <div className={"toast-loader"}>
        <div className={`toast-loader-left ${color}`} style={style}></div>
        <div className={"toast-loader-right"} style={style}></div>
        <div className={"toast-loader-spinner"} style={style}></div>
      </div>
      {redirect && !Path.equals(redirect) && <Navigate to={redirect} />}
    </div>;
  }
}

export const ToastContainer = () =>
  <div className={"toast-container"}>
    <Toasts
      toastMessages={store.getState().app.toasts}
      dispatch={store.dispatch} />
  </div>;

export const Toasts = (props: ToastsProps) =>
  <div className={"toasts"}>
    {Object.values(props.toastMessages).map(toastProps =>
      <Toast key={toastProps.id} dispatch={props.dispatch} {...toastProps} />)}
  </div>;
