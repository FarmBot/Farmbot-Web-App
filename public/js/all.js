//= require farmbot_app/react/init
//= require farmbot_app/react/menus/crop_inventory
//= require farmbot_app/react/menus/plant_catalog
//= require farmbot_app/react/menus/crop_info
//= require farmbot_app/react/menus/calendar
//= require farmbot_app/react/menus/schedule_creation
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _redux = require('redux');

var _reactRedux = require('react-redux');

var Crop = function Crop(options) {
  _classCallCheck(this, Crop);

  this.name = options.name || "Untitled Crop";
  this.age = options.age || _.random(0, 5);
  this._id = options._id || _.random(0, 1000);
  this.imgUrl = options.imgUrl || "/designer_icons/unknown.svg";
};

fakeCrops = [new Crop({ name: "Blueberry", imgUrl: "/designer_icons/blueberry.svg" }), new Crop({ name: "Cabbage", imgUrl: "/designer_icons/cabbage.svg" }), new Crop({ name: "Pepper", imgUrl: "/designer_icons/pepper.svg" }), new Crop({ name: "Cilantro", imgUrl: "/designer_icons/cilantro.svg" })];

Fb.ToolTip = React.createClass({
  displayName: 'ToolTip',

  render: function render() {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { className: 'fb-tooltip' },
        React.createElement(
          'div',
          { className: 'tooltip-text' },
          this.props.desc
        )
      ),
      React.createElement('span', { className: (this.props.color || "") + " plus-circle",
        onClick: this.props.action })
    );
  }
});

Fb.DesignerApp = (function (_React$Component) {
  _inherits(_class, _React$Component);

  function _class() {
    _classCallCheck(this, _class);

    _get(Object.getPrototypeOf(_class.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(_class, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { className: 'farm-designer-body' },
        React.createElement(
          'p',
          null,
          Fb.store.getState().UI.inventoryTab
        ),
        React.createElement(
          'div',
          { className: 'farm-designer-left' },
          React.createElement(
            'div',
            { id: 'designer-left' },
            React.createElement(Fb.store.getState().UI.leftMenu)
          )
        ),
        React.createElement(
          'div',
          { className: 'farm-designer-middle' },
          React.createElement('div', null)
        ),
        React.createElement(
          'div',
          { className: 'farm-designer-right' },
          React.createElement(
            'div',
            { id: 'designer-right' },
            React.createElement(Fb.Calendar, null)
          )
        )
      );
    }
  }]);

  return _class;
})(React.Component);

Fb.wow = (0, _reactRedux.connect)(function (s) {
  return s;
})(Fb.DesignerApp);

Fb.initialState = {
  UI: {
    leftMenu: Fb.Inventory.Content, // Left side of screen
    inventoryTab: 'Zones' // Current tab selection in "Inventory"
  }
};

Fb.reducer = function (state, action) {
  if (action.type === "@@redux/INIT") {
    return state;
  } else {
    return (Fb.reducer[action.type] || Fb.reducer.UNKNOWN)(state, action.params);
  };
};

Fb.reducer.UNKNOWN = function (state, params) {
  console.warn("Unknown dispatcher");
  return state;
};

Fb.reducer.CLICK_INVENTORY_TAB = function (state, params) {
  return _.merge({}, state, { UI: { inventoryTab: params } });
};

Fb.store = (0, _redux.createStore)(Fb.reducer, Fb.initialState);

$(document).ready(function () {
  var dom = document.getElementById("farm-designer-app");
  var menu = React.createElement(
    _reactRedux.Provider,
    { store: Fb.store },
    function () {
      return React.createElement(Fb.wow, null);
    }
  );
  (0, _reactRedux.connect)()(menu);
  if (dom) {
    React.render(menu, dom);
  } else {
    console.info('Not loading designer.');
  };
});
"use strict";

Fb = window.Fb || {};
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Fb.CalendarMenu = (function (_React$Component) {
  _inherits(_class, _React$Component);

  function _class() {
    _classCallCheck(this, _class);

    _get(Object.getPrototypeOf(_class.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "search-box-wrapper purple-content" },
        React.createElement("input", { className: "search", placeholder: "Search" })
      );
    }
  }]);

  return _class;
})(React.Component);

Fb.CalendarContent = (function (_React$Component2) {
  _inherits(_class2, _React$Component2);

  function _class2() {
    _classCallCheck(this, _class2);

    _get(Object.getPrototypeOf(_class2.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class2, [{
    key: "render",
    value: function render() {
      var events = _(Fb.scheduledEvents).sortBy('time').map(function (s, k) {
        return React.createElement(Fb.ScheduleEventView, { scheduledEvent: s, key: k });
      }).value();
      return React.createElement(
        "div",
        { className: "calendar" },
        React.createElement(
          "div",
          { className: "widget-wrapper" },
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "div",
              { className: "small-12 columns" },
              React.createElement(
                "div",
                { className: "header-wrapper" },
                React.createElement(
                  "h5",
                  null,
                  "Calendar"
                )
              )
            )
          ),
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "div",
              { className: "small-12 columns" },
              React.createElement(
                "div",
                { className: "content-wrapper calendar-wrapper" },
                React.createElement(
                  "div",
                  { className: "row date-flipper" },
                  React.createElement(
                    "div",
                    { className: "small-2 columns" },
                    React.createElement("i", { className: "fa fa-arrow-left arrow-button radius" })
                  ),
                  React.createElement(
                    "div",
                    { className: "small-8 columns" },
                    React.createElement(
                      "h6",
                      { className: "date" },
                      "Feb 28"
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "small-2 columns" },
                    React.createElement("i", { className: "fa fa-arrow-right arrow-button radius right" })
                  )
                ),
                events
              )
            )
          )
        ),
        React.createElement(Fb.ToolTip, { action: Fb.renderScheduleCreation, desc: "Schedule new event", color: "dark-purple" })
      );
    }
  }]);

  return _class2;
})(React.Component);

Fb.ScheduledEvent = (function () {
  function _class3(options) {
    _classCallCheck(this, _class3);

    this.time = options.time || new Date();
    this.desc = options.desc || "Untitled Event";
    this.icon = options.icon || "fi-trees";
  }

  _createClass(_class3, [{
    key: "formatTime",
    value: function formatTime() {
      var hours = this.time.getHours();
      return hours + " " + (hours > 12 ? "AM" : "PM");
    }
  }, {
    key: "hasPassed",
    value: function hasPassed() {
      return this.time < new Date();
    }
  }]);

  return _class3;
})();

Fb.scheduledEvents = [new Fb.ScheduledEvent({ desc: "Photograph",
  time: new Date("02-28-2015 06:00") }), new Fb.ScheduledEvent({ desc: "Weed Crops",
  time: new Date("02-28-2015 07:00") }), new Fb.ScheduledEvent({ desc: "Spectral Rdg",
  time: new Date("02-28-2015 09:00") })];

Fb.ScheduleEventView = (function (_React$Component3) {
  _inherits(_class4, _React$Component3);

  function _class4() {
    _classCallCheck(this, _class4);

    _get(Object.getPrototypeOf(_class4.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class4, [{
    key: "render",
    value: function render() {
      var evnt = this.props.scheduledEvent;

      return React.createElement(
        "div",
        { className: "row event { this.hasPassed() ? 'past' : '' }" },
        React.createElement(
          "div",
          { className: "small-12 columns" },
          React.createElement(
            "div",
            { className: "event-time" },
            evnt.formatTime()
          ),
          React.createElement("i", { className: "event-icon fi-camera" }),
          React.createElement(
            "div",
            { className: "event-title" },
            evnt.desc
          ),
          React.createElement("i", { className: "edit-icon fi-pencil right" })
        )
      );
    }
  }]);

  return _class4;
})(React.Component);

Fb.Calendar = (function (_React$Component4) {
  _inherits(_class5, _React$Component4);

  function _class5() {
    _classCallCheck(this, _class5);

    _get(Object.getPrototypeOf(_class5.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class5, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        null,
        React.createElement(Fb.CalendarMenu, null),
        React.createElement(Fb.CalendarContent, null)
      );
    }
  }]);

  return _class5;
})(React.Component);

Fb.renderCalendar = function () {
  React.render(React.createElement(Fb.Calendar, null), Fb.rightMenu);
};
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapPoint = function MapPoint(x, y) {
  _classCallCheck(this, MapPoint);

  this.x = x || 0;
  this.y = y || 0;
};

Fb.MapPointView = (function (_React$Component) {
  _inherits(_class, _React$Component);

  function _class() {
    _classCallCheck(this, _class);

    _get(Object.getPrototypeOf(_class.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class, [{
    key: "render",
    value: function render() {
      var style = {
        position: 'absolute',
        left: this.props.point.x - 20,
        top: this.props.point.y - 40
      };
      return React.createElement("img", { style: style, src: "/designer_icons/pin.png" });
    }
  }]);

  return _class;
})(React.Component);

Fb.CropInfoContent = (function (_React$Component2) {
  _inherits(_class2, _React$Component2);

  _createClass(_class2, [{
    key: "move",
    value: function move() {
      Fb.renderInventory();
    }
  }, {
    key: "drop",
    value: function drop(e) {
      var data = this.state.data.concat(new MapPoint(e.clientX, e.clientY));
      this.setState({ data: data });
    }
  }]);

  function _class2() {
    _classCallCheck(this, _class2);

    _get(Object.getPrototypeOf(_class2.prototype), "constructor", this).call(this);
    this.render = this.render.bind(this);
    this.state = { data: [] };
  }

  _createClass(_class2, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "green-content" },
          React.createElement(
            "div",
            { className: "search-box-wrapper" },
            React.createElement(
              "p",
              null,
              React.createElement(
                "a",
                { href: "#", onClick: this.move },
                React.createElement("i", { className: "fa fa-arrow-left" })
              ),
              this.props.crop.name
            )
          )
        ),
        React.createElement(
          "div",
          { className: "designer-info" },
          React.createElement(
            "div",
            { className: "crop-drag-info-tile" },
            React.createElement(
              "h6",
              null,
              "Crop Image"
            ),
            React.createElement("img", { className: "crop-drag-info-image",
              src: this.props.crop.imgUrl,
              onDragEnd: this.drop.bind(this) }),
            React.createElement(
              "div",
              { className: "crop-info-overlay" },
              "To plant, drag and drop into map"
            )
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "h6",
              null,
              "Crop Info",
              React.createElement(
                "span",
                null,
                React.createElement(
                  "a",
                  { href: "#" },
                  "Edit"
                )
              )
            ),
            React.createElement(
              "ul",
              null,
              React.createElement(
                "li",
                null,
                " Expected height: 28 inches "
              ),
              React.createElement(
                "li",
                null,
                " Expected diameter: 44 inches "
              ),
              React.createElement(
                "li",
                null,
                " Life Expectancy: 8 years "
              )
            )
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "h6",
              null,
              "Planting Tips",
              React.createElement(
                "span",
                null,
                React.createElement(
                  "a",
                  { href: "#" },
                  "Edit"
                )
              )
            ),
            React.createElement(
              "ul",
              null,
              React.createElement(
                "li",
                null,
                " Plant in full sun "
              ),
              React.createElement(
                "li",
                null,
                " Fruits most in acidic soil "
              ),
              React.createElement(
                "li",
                null,
                " Plant near melons "
              )
            )
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "h6",
              null,
              "Default Regimens",
              React.createElement(
                "span",
                null,
                React.createElement(
                  "a",
                  { href: "#" },
                  "Edit"
                )
              )
            ),
            React.createElement(
              "ul",
              null,
              React.createElement(
                "li",
                null,
                " Blueberries by OpenFarm"
              ),
              React.createElement(
                "li",
                null,
                " Soil Acidifier "
              )
            )
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "h6",
              null,
              "Delete This Crop"
            ),
            React.createElement(
              "p",
              null,
              "Note: You will no longer be able to plant this crop."
            ),
            React.createElement(
              "span",
              null,
              React.createElement(
                "button",
                { className: "red" },
                "Delete"
              )
            ),
            React.createElement(
              "div",
              { id: "drop-area" },
              this.points
            )
          )
        )
      );
    }
  }, {
    key: "points",
    get: function get() {
      var points = this.state.data.map(function (p, k) {
        return React.createElement(Fb.MapPointView, { point: p, key: k });
      });
      return points;
    }
  }]);

  return _class2;
})(React.Component);

Fb.renderCropInfo = function (crop) {
  React.render(React.createElement(Fb.CropInfoContent, { crop: crop }), Fb.leftMenu);
};
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Fb.Inventory = {};

Fb.Inventory.Tab = (function (_React$Component) {
  _inherits(_class, _React$Component);

  function _class() {
    _classCallCheck(this, _class);

    _get(Object.getPrototypeOf(_class.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "li",
        { onClick: this.handleClick.bind(this) },
        React.createElement(
          "a",
          { href: "#",
            wow: this.store,
            className: this.props.active ? "active" : "" },
          this.props.name
        )
      );
    }
  }, {
    key: "handleClick",
    value: function handleClick() {
      debugger;
      Fb.store.dispatch({ type: "CLICK_INVENTORY_TAB", params: this.props.name });
    }
  }]);

  return _class;
})(React.Component);

Fb.Inventory.Plants = (function (_React$Component2) {
  _inherits(_class2, _React$Component2);

  function _class2() {
    _classCallCheck(this, _class2);

    _get(Object.getPrototypeOf(_class2.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class2, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        null,
        React.createElement(Fb.Inventory.List, { crops: fakeCrops }),
        React.createElement(Fb.ToolTip, { action: Fb.renderCatalog, desc: "Add a new plant", color: "dark-green" })
      );
    }
  }]);

  return _class2;
})(React.Component);

Fb.Inventory.Groups = (function (_React$Component3) {
  _inherits(_class3, _React$Component3);

  function _class3() {
    _classCallCheck(this, _class3);

    _get(Object.getPrototypeOf(_class3.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class3, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "designer-info" },
        React.createElement(
          "h6",
          null,
          "My Groups"
        ),
        React.createElement(
          "ul",
          null,
          React.createElement(
            "li",
            null,
            React.createElement(
              "a",
              { href: "#" },
              "Lucky Cabages"
            ),
            React.createElement(
              "p",
              null,
              "5 Plants"
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "a",
              { href: "#" },
              "Lucky Cabages"
            ),
            React.createElement(
              "p",
              null,
              "5 Plants"
            )
          )
        ),
        React.createElement(
          "h6",
          null,
          "Zone Auto-Groups"
        ),
        React.createElement(
          "ul",
          null,
          React.createElement(
            "li",
            null,
            React.createElement(
              "a",
              { href: "#" },
              "Plants in \"Broccoli Overlord\""
            ),
            React.createElement(
              "p",
              null,
              "10 Plants"
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "a",
              { href: "#" },
              "Plants in \"Flower Patch\""
            ),
            React.createElement(
              "p",
              null,
              "7 Plants"
            )
          )
        ),
        React.createElement(
          "h6",
          null,
          "Crop Auto-Groups"
        ),
        React.createElement(
          "ul",
          null,
          React.createElement(
            "li",
            null,
            React.createElement(
              "a",
              { href: "#" },
              "All Strawberries"
            ),
            React.createElement(
              "p",
              null,
              "1 plant"
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "a",
              { href: "#" },
              "All Flowers"
            ),
            React.createElement(
              "p",
              null,
              "42 plants"
            )
          )
        ),
        React.createElement(Fb.ToolTip, { action: Fb.renderCatalog,
          desc: "Add a new group",
          color: "dark-green" })
      );
    }
  }]);

  return _class3;
})(React.Component);

Fb.Inventory.Zones = (function (_React$Component4) {
  _inherits(_class4, _React$Component4);

  function _class4() {
    _classCallCheck(this, _class4);

    _get(Object.getPrototypeOf(_class4.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class4, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "designer-info" },
        React.createElement(
          "h6",
          null,
          "My Zones"
        ),
        React.createElement(
          "ul",
          null,
          React.createElement(
            "li",
            null,
            React.createElement(
              "a",
              { href: "#" },
              "Front area"
            ),
            React.createElement(
              "p",
              null,
              "18 Square Feet"
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "a",
              { href: "#" },
              "Needs Compost"
            ),
            React.createElement(
              "p",
              null,
              "5 Square Feet"
            )
          )
        ),
        React.createElement(
          "h6",
          null,
          "Auto-Zones"
        ),
        React.createElement(
          "ul",
          null,
          React.createElement(
            "li",
            null,
            React.createElement(
              "a",
              { href: "#" },
              "Broccoli Overlord"
            ),
            React.createElement(
              "p",
              null,
              "60 Square Feet"
            )
          )
        ),
        React.createElement(Fb.ToolTip, { action: Fb.renderCatalog,
          desc: "Add New Zone",
          color: "dark-green" })
      );
    }
  }]);

  return _class4;
})(React.Component);
Fb.Inventory.Item = (function (_React$Component5) {
  _inherits(_class5, _React$Component5);

  function _class5() {
    _classCallCheck(this, _class5);

    _get(Object.getPrototypeOf(_class5.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class5, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "li",
        null,
        React.createElement(
          "a",
          { href: "#" },
          " ",
          this.props.crop.name,
          " "
        ),
        React.createElement(
          "div",
          null,
          this.props.crop.age,
          " days old"
        )
      );
    }
  }]);

  return _class5;
})(React.Component);

Fb.Inventory.List = (function (_React$Component6) {
  _inherits(_class6, _React$Component6);

  function _class6() {
    _classCallCheck(this, _class6);

    _get(Object.getPrototypeOf(_class6.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class6, [{
    key: "render",
    value: function render() {
      var crops = this.props.crops.map(function (crop, k) {
        return React.createElement(Fb.Inventory.Item, { crop: crop, key: k });
      });

      return React.createElement(
        "ul",
        { className: "crop-inventory" },
        " ",
        crops,
        " "
      );
    }
  }]);

  return _class6;
})(React.Component);

Fb.Inventory.Content = (function (_React$Component7) {
  _inherits(_class7, _React$Component7);

  function _class7() {
    _classCallCheck(this, _class7);

    _get(Object.getPrototypeOf(_class7.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class7, [{
    key: "currentTab",
    value: function currentTab() {
      return Fb.Inventory[this.tabName];
    }
  }, {
    key: "isActive",
    value: function isActive(item) {
      return this.tabName === item;
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "green-content" },
          React.createElement(
            "div",
            { className: "search-box-wrapper" },
            React.createElement("input", { className: "search", placeholder: "Search" })
          ),
          React.createElement(
            "ul",
            { className: "tabs" },
            ["Plants", "Groups", "Zones"].map((function (item, i) {
              return React.createElement(Fb.Inventory.Tab, { key: i,
                name: item,
                active: this.isActive(item) });
            }).bind(this))
          )
        ),
        React.createElement(this.currentTab())
      );
    }
  }, {
    key: "tabName",
    get: function get() {
      return Fb.store.getState().UI.inventoryTab || "Plants";
    }
  }]);

  return _class7;
})(React.Component);

Fb.renderInventory = function () {
  React.render(React.createElement(Fb.Inventory.Content, null), Fb.leftMenu);
};
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Fb.PlantCatalogTile = (function (_React$Component) {
  _inherits(_class, _React$Component);

  function _class() {
    _classCallCheck(this, _class);

    _get(Object.getPrototypeOf(_class.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class, [{
    key: "render",
    value: function render() {
      var _this = this;

      return React.createElement(
        "div",
        { className: "plantCatalogTile", onClick: function (e) {
            Fb.renderCropInfo(_this.props.crop);
          } },
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "div",
            { className: "small-12 columns" },
            React.createElement(
              "div",
              { className: "small-header-wrapper" },
              React.createElement(
                "h5",
                null,
                this.props.crop.name
              )
            )
          )
        ),
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "div",
            { className: "small-12 columns" },
            React.createElement(
              "div",
              { className: "content-wrapper" },
              React.createElement(
                "p",
                null,
                " ",
                React.createElement("img", { src: this.props.crop.imgUrl }),
                " "
              )
            )
          )
        )
      );
    }
  }]);

  return _class;
})(React.Component);

Fb.PlantCatalog = (function (_React$Component2) {
  _inherits(_class2, _React$Component2);

  function _class2() {
    _classCallCheck(this, _class2);

    _get(Object.getPrototypeOf(_class2.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class2, [{
    key: "render",
    value: function render() {
      var crops = fakeCrops.map(function (crop, k) {
        return React.createElement(Fb.PlantCatalogTile, { crop: crop, key: k });
      });
      return React.createElement(
        "div",
        { id: "designer-left" },
        React.createElement(
          "div",
          { className: "green-content" },
          React.createElement(
            "div",
            { className: "search-box-wrapper" },
            React.createElement(
              "p",
              null,
              React.createElement(
                "a",
                { href: "#", onClick: "" },
                React.createElement("i", { className: "fa fa-arrow-left" })
              ),
              "Choose a Crop"
            )
          )
        ),
        React.createElement(
          "div",
          { crops: fakeCrops },
          React.createElement("br", null),
          crops
        )
      );
    }
  }]);

  return _class2;
})(React.Component);

Fb.renderCatalog = function () {
  alert('this is where you left off. Add a redux dispatcher here.');
};
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Fb.ScheduleCreation = (function (_React$Component) {
  _inherits(_class, _React$Component);

  function _class() {
    _classCallCheck(this, _class);

    _get(Object.getPrototypeOf(_class.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(_class, [{
    key: "back",
    value: function back() {
      Fb.renderCalendar();
    }
  }, {
    key: "render",
    value: function render() {
      var html = React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { className: "search-box-wrapper purple-content" },
            React.createElement(
              "p",
              null,
              React.createElement(
                "a",
                { href: "#", onClick: this.back },
                React.createElement("i", { className: "fa fa-arrow-left" })
              ),
              "Schedule Event"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "designer-info" },
          React.createElement(
            "h6",
            null,
            "Chose a Sequence or Regimen"
          ),
          React.createElement(
            "select",
            null,
            React.createElement(
              "option",
              { value: "volvo" },
              "Volvo"
            ),
            React.createElement(
              "option",
              { value: "saab" },
              "Saab"
            ),
            React.createElement(
              "option",
              { value: "mercedes" },
              "Mercedes"
            ),
            React.createElement(
              "option",
              { value: "audi" },
              "Audi"
            )
          ),
          React.createElement(
            "h6",
            null,
            "Starts"
          ),
          React.createElement(
            "div",
            { className: "flex" },
            React.createElement("input", { placeholder: "Today",
              type: "text",
              className: "flex3" }),
            React.createElement(
              "select",
              { className: "flex3" },
              React.createElement(
                "option",
                { value: "volvo" },
                "12:30"
              ),
              React.createElement(
                "option",
                { value: "saab" },
                "12:00"
              )
            )
          ),
          React.createElement(
            "h6",
            null,
            "Repeats"
          ),
          React.createElement(
            "div",
            { className: "flex" },
            React.createElement("input", { placeholder: "2",
              type: "text",
              className: "flex3" }),
            React.createElement(
              "select",
              { className: "flex3" },
              React.createElement(
                "option",
                { value: "volvo" },
                "days"
              ),
              React.createElement(
                "option",
                { value: "saab" },
                "hours"
              )
            ),
            React.createElement(
              "input",
              { type: "checkbox", name: "wow", value: "no" },
              "Does not repeat"
            )
          ),
          React.createElement(
            "h6",
            null,
            "Ends"
          ),
          React.createElement(
            "div",
            { className: "flex" },
            React.createElement("input", { placeholder: "Today",
              type: "text",
              className: "flex3" }),
            React.createElement(
              "select",
              { className: "flex3" },
              React.createElement(
                "option",
                { value: "volvo" },
                "12:30"
              ),
              React.createElement(
                "option",
                { value: "saab" },
                "12:00"
              )
            )
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "button",
              { className: "purple-content" },
              "Save"
            )
          )
        )
      );
      return html;
    }
  }]);

  return _class;
})(React.Component);

Fb.renderScheduleCreation = function () {
  React.render(React.createElement(Fb.ScheduleCreation, null), Fb.rightMenu);
};