Fb.InventoryMenu = class extends React.Component {
  render() {
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
};

Fb.InventoryContent = class extends React.Component {
  render() {
    return(
      <div>
        <Fb.InventoryList crops={ fakeCrops } />
        <Fb.ToolTip action={ Fb.renderCatalog } desc="Add a new plant" color="dark-green"/>
      </div>
    );
  }
};

Fb.InventoryList = class extends React.Component {
  render() {
    var crops = this.props.crops.map(
       (crop) => <Fb.InventoryItem crop={crop} key={crop._id} />
     );

    return(<ul className="crop-inventory"> { crops } </ul>);
  }
};

Fb.InventoryItem = class extends React.Component {
  render() {
    return(
      <li>
        <a href="#"> {this.props.crop.name} </a>
        <div>{this.props.crop.age} days old</div>
      </li>);
  }
};

Fb.renderInventory = function(){
  React.render(<Fb.InventoryMenu />, Fb.leftMenu);
  React.render(<Fb.InventoryContent />, Fb.leftMenuContent);
};
