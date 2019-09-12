function Whatever() {
  return {
    log: jest.fn(function (x, y, z) {
      var fn = console[z] || console.log;
      fn(x)
      y && console.dir(y);
    })
  };
}

global.logStore = Whatever();
