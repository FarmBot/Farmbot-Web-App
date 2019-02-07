function flunk() {
  // DO NOT USE i18next here.
  // IE Cannot handle it.
  const READ_THE_COMMENT_ABOVE = "This app only works with modern browsers.";
  alert(READ_THE_COMMENT_ABOVE);
  window.location.assign("https://www.google.com/chrome/");
}

const REQUIRED_GLOBALS = [
  "Promise",
  "console",
  "WebSocket",
  "Intl",
  "Set"
];

const REQUIRED_ARRAY_METHODS = [
  "includes",
  "map",
  "filter"
];

/** We don't support IE. This method stops users from trying to use the site.
 * It's unfortunate that we need to do this, but the site simply won't work on
 * old browsers and our error logs were getting full of IE related bugs. */
export function stopIE() {
  try {
    // Can't use Array.proto.map because IE.
    // Can't translate the text because IE (no promises)
    for (let i = 0; i < REQUIRED_GLOBALS.length; i++) {
      if (!window.hasOwnProperty(REQUIRED_GLOBALS[i])) {
        flunk();
      }
    }

    for (let i = 0; i < REQUIRED_ARRAY_METHODS.length; i++) {
      if (!Array.prototype.hasOwnProperty(REQUIRED_ARRAY_METHODS[i])) {
        flunk();
      }
    }

    if (!Object.entries) { flunk(); }
  } catch (error) {
    flunk();
  }
}
