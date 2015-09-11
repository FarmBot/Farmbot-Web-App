class MapPoint {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;

  }
}

Fb.MapPointView = class extends React.Component {
  render() {
    var style = {
      position: 'absolute',
      left: (this.props.point.x - 20),
      top: (this.props.point.y - 40)
    };
    return  <img style={style}
                 src="/designer_icons/pin.png">
            </img>;
  }
};

Fb.CropInfoMenu = class extends React.Component {
  render() {
   return <div>
            <div className="search-box-wrapper">
              <p>
                <a href="#" onClick={Fb.renderInventory}>
                  <i className="fa fa-arrow-left"></i>
                </a>
                { this.props.crop.name }
              </p>
            </div>
          </div>
  }
};

Fb.CropInfoContent = class extends React.Component {
  // drop (e) {
  //   var style = {position: 'absolute', left: (e.clientX - 20), top: (e.clientY - 40)};
  //   var domnode = <img style={style} src="/designer_icons/pin.png"></img>;
  //   React.render(domnode, document.getElementById('drop-area'));
  // }
  drop (e) {
    this.setState({
      data: this.state.data.concat(new MapPoint(e.clientX, e.clientY))
    });
  }

  constructor() {
   super();
   this.render = this.render.bind(this);
   this.state = {data: []};
  }
  render() {
    var points = this.state.data.map(
      (p) => <Fb.MapPointView point={ p } />
    );
    return  <div className="designer-crop-info">
              <div className="crop-drag-info-tile">
                <h6>Crop Image</h6>
                <img className="crop-drag-info-image"
                     src={this.props.crop.imgUrl}
                     onDragEnd={ this.drop.bind(this) }/>
                <div className="crop-info-overlay">
                  To plant, drag and drop into map
                </div>
              </div>
              <div>
                <h6>
                  Crop Info
                  <span><a href="#">Edit</a></span>
                </h6>
                <ul>
                  <li> Expected height: 28 inches </li>
                  <li> Expected diameter: 44 inches </li>
                  <li> Life Expectancy: 8 years </li>
                </ul>
              </div>
              <div>
                <h6>
                  Planting Tips
                  <span><a href="#">Edit</a></span>
                </h6>
                <ul>
                  <li> Plant in full sun </li>
                  <li> Fruits most in acidic soil </li>
                  <li> Plant near melons </li>
                </ul>
              </div>
              <div>
                <h6>
                  Default Regimens
                  <span><a href="#">Edit</a></span>
                </h6>
                <ul>
                  <li> Blueberries by OpenFarm</li>
                  <li> Soil Acidifier </li>
                </ul>
              </div>
              <div>
                <h6>
                  Delete This Crop
                </h6>
                <p>
                  Note: You will no longer be able to plant this crop.
                </p>
                <span>
                  <button className="red">
                    Delete
                  </button>
                </span>
                <div id="drop-area">
                  { points }
                </div>
              </div>
            </div>
  }
}

Fb.renderCropInfo = function(crop) {
  React.render(<Fb.CropInfoMenu crop={crop} />, Fb.leftMenu);
  React.render(<Fb.CropInfoContent crop={crop} />, Fb.leftMenuContent);
};
// PLANTING TIPS    Edit
// • Plant in full sun
// • Fruits most in acidic soil
// • Plant near melons

// DEFAULT REGIMENS    Edit
// • Blueberries by OpenFarm
// • Soil acidifier

// DELETE THIS CROP
// Note: You will no longer be able to plant this crop
