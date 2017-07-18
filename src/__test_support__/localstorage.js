// https://stackoverflow.com
//        /questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests

// https://github.com/facebook/jest/issues/2098
function whatever() {
  var store = {};

  return {
    clear() {
      store = {};
    },
    getItem(key) {
      return store[key];
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    }
  }
}

global.localStorage = whatever();
global.sessionStorage = whatever();
