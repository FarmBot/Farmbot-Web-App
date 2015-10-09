export class MapPoint extends React.Component {
  select() {
    this.props.dispatch({type: "CROP_SELECT", payload: this.props.plant});
  }

  selected() {
    return (!!this.props.selected);
  }

  render() {
    var { length } = this.props.planting_area;
    var fill = this.selected() ? "red" : "black";
    return <circle cx={ this.props.plant.x }
                   cy={ (-1 * this.props.plant.y) + length  }
                   onClick={ this.select.bind(this) }
                   fill={ fill }
                   r="5" />;
  }
};

export class GardenMap extends React.Component {
  plants() {
    return this.props.plants.map(
      (p, k) => <MapPoint plant={ p }
                              key={ k }
                              planting_area={ this.props.planting_area }
                              selected={ (this.props.selectedPlant._id === p._id) }
                              dispatch={ this.props.dispatch }/>
    );
  }

  render() {
    var style = {
      fill:        'rgb(136, 119, 102)',
      strokeWidth: 1,
      stroke:      'rgb(0,0,0)'
    }
    var {width, length} = this.props.planting_area;

    return <div>
             <div id="drop-area" style={ {marginLeft: '10px', marginTop: '10px'} }>
              <svg width={ width }
                   height={ length } >
                <rect width={ width }
                      height={ length }
                      style={ style } />
                { this.plants() }
              </svg>
             </div>
           </div>;
  }
}
