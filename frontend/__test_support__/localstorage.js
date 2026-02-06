// https://stackoverflow.com
//        /questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests

// https://github.com/facebook/jest/issues/2098
function Whatever() {
  var store = { items: {} };
  var preservedKeys = [
    "items",
    "clear",
    "getItem",
    "isFakeStore",
    "removeItem",
    "setItem",
  ];

  store.clear = jest.fn(() => {
    store.items = {};
    Object.keys(store).forEach(key => {
      if (!preservedKeys.includes(key)) {
        delete store[key];
      }
    });
  });
  store.getItem = (key) =>
    Object.prototype.hasOwnProperty.call(store.items, key)
      ? store.items[key]
      : store[key];
  store.isFakeStore = true;
  store.removeItem = (key) => {
    store.items[key] = undefined;
    delete store[key];
  };
  store.setItem = (key, value) => {
    store.items[key] = value;
    store[key] = value;
  };

  return store;
}

const setStorage = (key) => {
  const store = Whatever();
  try {
    Object.defineProperty(global, key, {
      configurable: true,
      writable: true,
      value: store,
    });
  } catch {
    global[key] = store;
  }
  return store;
};

setStorage("localStorage");
setStorage("sessionStorage");
