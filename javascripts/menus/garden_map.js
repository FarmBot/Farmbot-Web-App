export class MapPointView extends React.Component {
  select() {
    this.props.dispatch({type: "CROP_SELECT", payload: this.props.crop});
  }
  render() {
    var style = {
      position: 'absolute',
      left: (this.props.crop.x - 20),
      top: (this.props.crop.y - 40)
    };
    if (!!this.props.selected) { style.border = "1px solid green"; };
    return <div onClick={ this.select.bind(this) }>
             <img style={style} src="/designer_icons/pin.png"></img>
           </div>
  }
};

export class GardenMap extends React.Component {
  crops() {
    return this.props.crops.map(
      (p, k) => <MapPointView crop={ p }
                              key={ k }
                              selected={ p._id && (this.props.selectedCrop._id === p._id) }
                              dispatch={ this.props.dispatch }/>
    );
  }

  render() {
    return <div>
             <div id="drop-area">
              { this.crops() }
             </div>
           </div>;
  }
}
