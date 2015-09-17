Fb.PlantCatalogContent = class extends React.Component {
  render() {
    var crops = fakeCrops.map(
       (crop, k) => <Fb.PlantCatalogTile crop={crop} key={ k } />
     );

    return(
      <div crops={ fakeCrops }>
        <br/>
        { crops }
      </div>
    );
  }
};

Fb.PlantCatalogMenu = class extends React.Component {
  render() {
    return(
      <div>
        <div className="search-box-wrapper">
          <p>
            <a href="#" onClick={Fb.renderInventory}>
              <i className="fa fa-arrow-left"></i>
            </a>
            Choose a Crop
          </p>
        </div>
      </div>
    );
  }
};

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


Fb.renderCatalog = function() {
    React.render(<Fb.PlantCatalogMenu />, Fb.leftMenu);
    React.render(<Fb.PlantCatalogContent />, Fb.leftMenuContent);
};
