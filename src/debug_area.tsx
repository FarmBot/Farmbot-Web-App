import * as React from "react";

interface DebugProps {
}

export function Debug(props: DebugProps) {
  return <div>
    Hello?
    <hr />
    Hello?
    <hr />
    <Wow />
  </div>;
}

let SIZE = 100;
let RED = { height: SIZE, width: SIZE, border: "2px solid red" };
let BLUE = { height: SIZE, width: SIZE, border: "2px solid blue" };

class Wow extends React.Component<{}, {}> {
  render() {
    return <div>
      <div style={RED} draggable={true}>
        Drag me
      </div>
      <div
        style={BLUE}
        onDrop={() => {
          console.log("DROP");
        }}
        onDropCapture={() => { console.log("DROP CAPTURE"); }} >
        Drop here
      </div>
    </div>;
  }
}
