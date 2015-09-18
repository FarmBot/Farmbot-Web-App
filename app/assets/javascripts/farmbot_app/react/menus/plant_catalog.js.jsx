Fb.PlantCatalogTile = class extends React.Component {
  render() {
    return(
      <div className="plantCatalogTile" onClick={ e => { Fb.renderCropInfo(this.props.crop); } }>
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

Fb.PlantCatalog = class extends React.Component {
  render() {
    var crops = fakeCrops.map(
       (crop, k) => <Fb.PlantCatalogTile crop={crop} key={ k } />
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
            <div crops={ fakeCrops }>
              <br/>
              { crops }
            </div>
           </div>
  }
}


Fb.renderCatalog = function() {
  console.log('wow');
  // React.render(<Fb.PlantCatalog/>, Fb.leftMenu);
  React.render(<p> Literally </p>, Fb.leftMenu);

};
