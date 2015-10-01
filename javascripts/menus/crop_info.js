import { Plant } from '../plant';

export class CropInfo extends React.Component {
  goBack() {
    this.props.dispatch({type: "CATALOG_SHOW"});
  }

  removeCrop() {
   this.props.dispatch({type: "CROP_REMOVE_REQUEST",
                        payload: this.props.plant });
  }

  render() {
    return <div>
            <div className="green-content">
              <div className="search-box-wrapper">
                <p>
                  <a href="#" onClick={ this.goBack.bind(this) }>
                    <i className="fa fa-arrow-left"></i>
                  </a>
                  Crop { this.props.plant._id || "" }
                </p>
              </div>
            </div>
            <div className="designer-info">
              <div className="crop-drag-info-tile">
                <h6>Photos of this Crop</h6>
                <img className="crop-drag-info-image"
                     src={this.props.plant.imgUrl || '/designer_icons/placeholder_berries.jpg'} />
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
                  <button className="red" onClick={this.removeCrop.bind(this)}>
                    Delete
                  </button>
                </span>
              </div>
            </div>

  }
}
