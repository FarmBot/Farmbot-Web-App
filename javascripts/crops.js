export class Crop {
  constructor(options) {
    this.name = (options.name || "Untitled Crop");
    this.age = (options.age || _.random(0, 5));
    this._id = (options._id || _.random(0, 1000));
    this.imgUrl = (options.imgUrl || "/designer_icons/unknown.svg");
    this.x = (options.x || 0);
    this.y = (options.y || 0);
  }
};


Crop.fakeCrops = [
  new Crop({name: "Blueberry", imgUrl: "/designer_icons/blueberry.svg"}),
  new Crop({name: "Cabbage", imgUrl: "/designer_icons/cabbage.svg"}),
  new Crop({name: "Pepper", imgUrl: "/designer_icons/pepper.svg"}),
  new Crop({name: "Cilantro", imgUrl: "/designer_icons/cilantro.svg"}),
];
