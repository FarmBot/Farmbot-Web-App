import { Crop, fakeCrops } from '../crops';

export class PlantCatalogTile extends React.Component {
  render() {
    return(
      <div className="plantCatalogTile" onClick={ e => { renderCropInfo(this.props.crop); } }>
        <div className="row">
          <div className="small-12 columns">
            <div className="small-header-wrapper">
              <h5>{ this.props.crop.name }</h5>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="small-12 columns">
            <div className="content-wrapper">
              <p> <img src={this.props.crop.imgUrl} /> </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export class PlantCatalog extends React.Component {
  render() {
    var crops = Crop.fakeCrops.map(
       (crop, k) => <PlantCatalogTile crop={crop} key={ k } />
     );
    return <div id="designer-left">
            <div className="green-content">
              <div className="search-box-wrapper">
                <p>
                  <a href="#" onClick={ "" }>
                    <i className="fa fa-arrow-left"></i>
                  </a>
                  Choose a Crop
                </p>
              </div>
            </div>
            <div crops={ Crop.fakeCrops }>
              <br/>
              { crops }
            </div>
           </div>
  }
}

export function renderCatalog() {
  alert('this is where you left off. Add a redux dispatcher here.');
};
