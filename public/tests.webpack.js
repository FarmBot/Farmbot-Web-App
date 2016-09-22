var testsContext = require.context('./src', true, /pec\.(ts|tsx)$/);
testsContext.keys().forEach(testsContext);
