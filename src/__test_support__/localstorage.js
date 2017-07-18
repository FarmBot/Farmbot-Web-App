// https://stackoverflow.com
//        /questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests

// https://github.com/facebook/jest/issues/2098
var store1 = {};
var store2 = {};

window.localStorage = {
  getItem: function (key) {
    return store1[key] || null;
  },
  setItem: function (key, value) {
    store1[key] = value.toString();
  },
  clear: function () {
    store1 = {};
  }
};

window.sessionStorage = {
  getItem: function (key) {
    return store2[key] || null;
  },
  setItem: function (key, value) {
    store2[key] = value.toString();
  },
  clear: function () {
    store2 = {};
  }
};
