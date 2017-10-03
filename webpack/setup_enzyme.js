// enzyme-adapter-react-15 is not important enough to import @types for.
var Enzyme = require('enzyme');
var configure = Enzyme.configure;
var Adapter = require('enzyme-adapter-react-15');

configure({ adapter: new Adapter() });
