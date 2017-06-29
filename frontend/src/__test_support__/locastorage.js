// https://stackoverflow.com
//        /questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests

// https://github.com/facebook/jest/issues/2098

//browserMocks.js
var localStorageMock = (function () {
  var store = {};

  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    }
  };

})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
