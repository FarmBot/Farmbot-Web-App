// enzyme-adapter-react-15 is not important enough to import @types for.
var Adapter = require('enzyme-adapter-react-15');
require('enzyme').configure({ adapter: new Adapter() });
