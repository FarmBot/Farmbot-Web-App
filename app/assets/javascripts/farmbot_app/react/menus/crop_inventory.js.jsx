Fb.InventoryTab = class extends React.Component {
  render() {
    return <li>
            <a href="#"
               className={this.props.active ? "active" : ""}>
              { this.props.name }
            </a>
           </li>
  }
}

Fb.InventoryTabList = class extends React.Component {
  handleClick(a,b,c,d) {
    debugger;
  }

  constructor() {
   super();
   this.state = {current_tab: "Plants"};
  }

  render() {
    return <ul className="tabs">
            {
              this.props.items.map(function(item, i) {
                return <Fb.InventoryTab key={i}
                                        name={item}
                                        active={this.state.current_tab === item}/>;
            }.bind(this))}
           </ul>
  }
}

Fb.InventoryMenu = class extends React.Component {
  render() {
    return (
      <div>
        <div className="search-box-wrapper">
          <input className="search" placeholder="Search"/>
        </div>
        <Fb.InventoryTabList items={["Plants", "Groups", "Zones"]} />
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
