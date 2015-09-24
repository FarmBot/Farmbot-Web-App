class MapPoint {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
}

MapPointView = class extends React.Component {
  render() {
    var style = {
      position: 'absolute',
      left: (this.props.point.x - 20),
      top: (this.props.point.y - 40)
    };
    return  <img style={style} src="/designer_icons/pin.png"></img>;
  }
};

CropInfoContent = class extends React.Component {
  move() { renderInventory() }

  drop (e) {
    var data = this.state.data.concat(new MapPoint(e.clientX, e.clientY));
    this.setState({data: data});
  }

  constructor() {
   super();
   this.render = this.render.bind(this);
   this.state = {data: []};
  }

  get points() {
    var points = this.state.data.map(
      (p, k) => <MapPointView point={ p } key={k} />
    );
    return points;
  }

  render() {
    return  <div>
              <div className="green-content">
                <div className="search-box-wrapper">
                  <p>
                    <a href="#" onClick={ this.move }>
                      <i className="fa fa-arrow-left"></i>
                    </a>
                    { this.props.crop.name }
                  </p>
                </div>
              </div>
              <div className="designer-info">
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
                    { this.points }
                  </div>
                </div>
              </div>
            </div>
  }
}

renderCropInfo = function(crop) {
  React.render(<CropInfoContent crop={crop} />, leftMenu);
};
