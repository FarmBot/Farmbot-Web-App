// https://stackoverflow.com
//        /questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests

// https://github.com/facebook/jest/issues/2098
function Whatever() {
  var store = { items: {} };

  store.clear = jest.fn(() => store.items = {});
  store.getItem = (key) => store.items[key];
  store.isFakeStore = true;
  store.removeItem = (key) => store.items[key] = undefined;
  store.setItem = (key, value) => store.items[key] = value;

  return store;
}

global.localStorage = Whatever();
global.sessionStorage = Whatever();
