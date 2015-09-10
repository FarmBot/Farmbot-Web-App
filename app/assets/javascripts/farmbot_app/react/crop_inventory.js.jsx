Fb = (window.Fb || {});

Fb.InventoryMenu = React.createClass({
  render: function(){
    return (
      <div>
        <div className="search-box-wrapper">
          <input className="search" placeholder="Search"/>
        </div>
        <ul className="tabs">
          <li className="active">
            <a href="#">Plants</a>
          </li>
          <li>
            <a href="#">Groups</a>
          </li>
          <li>
            <a href="#">Zones</a>
          </li>
        </ul>
      </div>
    )
  }
})
// used to be line
Fb.InventoryContent = React.createClass({
  render: function(){
    return(
      <div>
        <Fb.InventoryList crops={ fakeCrops } />
        <Fb.AddCrop />
      </div>
    );
  }
})

Fb.InventoryList = React.createClass({
  render: function() {

    var crops = this.props.crops.map(
       (crop) => <Fb.InventoryItem crop={crop} key={crop._id} />
     );

    return(<ul className="crop-inventory"> { crops } </ul>);
  }
});

Fb.InventoryItem = React.createClass({
  render: function() {
    return(
      <li>
        <a href="#"> {this.props.crop.name} </a>
        <div>{this.props.crop.age} days old</div>
      </li>);
  }
});

Fb.AddCrop = React.createClass({
  addCrop: function(e) {
    React.render(<Fb.PlantCatalogMenu />, Fb.leftMenu);
    React.render(<Fb.PlantCatalogContent />, Fb.leftMenuContent);
  },
  render: function(){
    return(
      <div>
        <div className="fb-tooltip">
          <div className="tooltip-text">
          Add a new plant
          </div>
        </div>
        <span className="plus-circle dark-green" onClick={this.addCrop}>
        </span>
      </div>
    );
  }
})

Fb.renderInventory = function(){
  React.render(<Fb.InventoryMenu />, Fb.leftMenu);
  React.render(<Fb.InventoryContent />, Fb.leftMenuContent);
};
