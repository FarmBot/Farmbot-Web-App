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
    return <div>
             <div id="drop-area">
              { this.plants() }
             </div>
           </div>;
  }
}
