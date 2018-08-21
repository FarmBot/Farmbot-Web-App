// https://stackoverflow.com
//        /questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests

// https://github.com/facebook/jest/issues/2098
function Whatever() {
  var store = {};

  store.isFakeStore = true;

  store.getItem = (key) => {
    return store[key];
  };

  store.setItem = (key, value) => {
    store[key] = value;
  };

  store.removeItem = (key) => {
    store[key] = undefined;
  };

  return store;
}

global.localStorage = Whatever();
global.sessionStorage = Whatever();
