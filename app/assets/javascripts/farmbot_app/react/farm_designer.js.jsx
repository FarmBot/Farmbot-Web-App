Fb = (window.Fb || {});

var fakeCrops = [
  {name: "Cabbage", age: 4,  _id: 1},
  {name: "Cabbage", age: 3,  _id: 2},
  {name: "Pepper",  age: 3,  _id: 3},
  {name: "Dill",    age: 12, _id: 4},
];


Fb.CropList = React.createClass({
  render: function() {

    var crops = this.props.crops.map(
       (crop) => <Fb.CropListItem crop={crop} key={crop._id} />
     );

    return(<ul className="crop-inventory"> { crops } </ul>);
  }
});

Fb.CropListItem = React.createClass({
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
    React.render(<Fb.PlantStuffMenu />, Fb.leftMenu);
    React.render(<Fb.PlantStuff />, Fb.leftMenuContent);
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

Fb.CropInventory = React.createClass({
  render: function(){
    return(
      <div>
        <Fb.CropList crops={ fakeCrops } />
        <Fb.AddCrop />
      </div>
    );
  }
})

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

Fb.PlantStuff = React.createClass({
  render: function () {
    return <p> This is where a list of plantable crops will go </p>
  }
})

Fb.PlantStuffMenu = React.createClass({
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
    )
  }
})

Fb.renderInventory = function(){
  React.render(<Fb.InventoryMenu />, Fb.leftMenu);
  React.render(<Fb.CropInventory />, Fb.leftMenuContent);
};

$(document).ready(function() {
  Fb.leftMenuContent = document.getElementById("designer-left-content");
  Fb.leftMenu        = document.getElementById("designer-left-menu-bar");
  Fb.renderInventory();
});

