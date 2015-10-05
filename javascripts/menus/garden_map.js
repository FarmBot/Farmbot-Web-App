export class MapPointView extends React.Component {
  select() {
    this.props.dispatch({type: "CROP_SELECT", payload: this.props.plant});
  }

  render() {
    var style = {
      position: 'absolute',
      left: (this.props.plant.x - 20),
      top: (this.props.plant.y - 40)
    };
    if (!!this.props.selected) { style.border = "1px solid green"; };
    return <div onClick={ this.select.bind(this) }>
             <img style={style} src="/designer_icons/pin.png"></img>
           </div>
  }
};

export class GardenMap extends React.Component {
  plants() {
    return this.props.plants.map(
      (p, k) => <MapPointView plant={ p }
                              key={ k }
                              selected={ (this.props.selectedPlant._id === p._id) }
                              dispatch={ this.props.dispatch }/>
    );
  }

  render() {
    var style = {
      fill: 'rgb(136, 119, 102)',
      'strokeWidth':3,
      stroke: 'rgb(0,0,0)'
    }
    var {width, length} = this.props.planting_area;

    return <div>
             <div id="drop-area">
              <svg width={ width + 20 }
                   height={ length + 20 } >
                <rect x="10"
                      y="10"
                      width={ width }
                      height={ length }
                      style={ style } />
              </svg>
              { this.plants() }
             </div>
           </div>;
  }
}
