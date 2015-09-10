//= require farmbot_app/react/crop_inventory
//= require farmbot_app/react/plant_catalog
Fb = (window.Fb || {});

var fakeCrops = [
  {name: "Blueberry", age: 4, _id: 1, imgUrl: "/designer_icons/blueberry.svg"},
  {name: "Cabbage", age: 3,  _id: 2, imgUrl: "/designer_icons/cabbage.svg"},
  {name: "Pepper", age: 3,  _id: 3, imgUrl: "/designer_icons/pepper.svg"},
  {name: "Cilantro", age: 12, _id: 4, imgUrl: "/designer_icons/cilantro.svg"},
];

$(document).ready(function() {
  Fb.leftMenuContent = document.getElementById("designer-left-content");
  Fb.leftMenu        = document.getElementById("designer-left-menu-bar");
  Fb.renderInventory();
});

