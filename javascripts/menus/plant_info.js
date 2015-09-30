import { Crop } from '../crops';

export class PlantInfo extends React.Component {
  drop (e) {
    var crop = new Crop({x: e.clientX, y: e.clientY});
    this.props.dispatch({type: "CROP_ADD_REQUEST", payload: crop});
  }

  showCatalog(){
    this.props.dispatch({type: "CATALOG_SHOW"});
  }

  render() {
    return  <div>
              <div className="green-content">
                <div className="search-box-wrapper">
                  <p>
                    <a href="#" onClick={ this.showCatalog.bind(this) }>
                      <i className="fa fa-arrow-left"></i>
                    </a>
                    { this.props.crop.name }
                  </p>
                </div>
              </div>
              <div className="designer-info">
                <div className="crop-drag-info-tile">
                  <h6>Plant Image</h6>
                  <img className="crop-drag-info-image"
                       src={this.props.crop.imgUrl}
                       onDragEnd={ this.drop.bind(this) }/>
                  <div className="crop-info-overlay">
                    To plant, drag and drop into map
                  </div>
                </div>
                <div>
                  <h6>
                    Plant Info
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
                </div>
              </div>
            </div>
  }
}
