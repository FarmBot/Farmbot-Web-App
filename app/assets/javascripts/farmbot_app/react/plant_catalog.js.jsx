Fb.PlantCatalogContent = React.createClass({
  render: function () {
    var crops = fakeCrops.map(
       (crop) => <Fb.PlantCatalogTile crop={crop} key={crop._id} />
     );

    return(
      <div crops={ fakeCrops }>
        <br/>
        { crops }
      </div>
    );
  }
})

Fb.PlantCatalogMenu = React.createClass({
  render: function () {
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
});

Fb.PlantCatalogTile = React.createClass({
  render: function(){
    return(
      <div>
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
})
