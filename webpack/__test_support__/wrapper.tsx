import * as React from "react";

export class Wrapper extends React.Component<{}, {}> {
  render() {
    return <div> {this.props.children} </div>;
  }
}
