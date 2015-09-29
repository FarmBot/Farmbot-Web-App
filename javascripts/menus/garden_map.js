export class MapPointView extends React.Component {
  render() {
    var style = {
      position: 'absolute',
      left: (this.props.point.x - 20),
      top: (this.props.point.y - 40)
    };
    return  <img style={style} src="/designer_icons/pin.png"></img>;
  }
};

export class GardenMap extends React.Component {
  points() {
    return this.props.crops.map((p, k) => <MapPointView point={ p } key={k} />);
  }

  render() {
    return <div>
             <div id="drop-area">
              { this.points() }
             </div>
           </div>;
  }
}
