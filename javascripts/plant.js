export class Plant {
  constructor(options) {
    this.name = (options.name || "Untitled Plant");
    this.age = (options.age || _.random(0, 5));
    this._id = (options._id || _.random(0, 1000));
    this.imgUrl = (options.imgUrl || "/designer_icons/unknown.svg");
    this.x = (options.x || 0);
    this.y = (options.y || 0);
  }
};

Plant.fakePlants = [
  new Plant({name: "Blueberry", imgUrl: "/designer_icons/blueberry.svg"}),
  new Plant({name: "Cabbage", imgUrl: "/designer_icons/cabbage.svg"}),
  new Plant({name: "Pepper", imgUrl: "/designer_icons/pepper.svg"}),
  new Plant({name: "Cilantro", imgUrl: "/designer_icons/cilantro.svg"})
  ];
