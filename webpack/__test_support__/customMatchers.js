const diff = require('jest-diff');
expect.extend({
  toBeSameTimeAs(received, expected) {
    const pass = received.isSame(expected);

    const message = pass
      ? () =>
        this.utils.matcherHint('.not.toBeSameTimeAs') +
        '\n\n' +
        `Expected time to not be (using moment.isSame):\n` +
        `  ${this.utils.printExpected(expected)}\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`
      : () => {
        const diffString = diff(expected, received, {
          expand: this.expand,
        });
        return (
          this.utils.matcherHint('.toBeSameTimeAs') +
          '\n\n' +
          `Expected time to be (using moment.isSame):\n` +
          `  ${this.utils.printExpected(expected)}\n` +
          `Received:\n` +
          `  ${this.utils.printReceived(received)}` +
          (diffString ? `\n\nDifference:\n\n${diffString}` : '')
        );
      };

    return { actual: received, message, pass };
  },
});
