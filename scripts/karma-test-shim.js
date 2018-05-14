Error.stackTraceLimit = Infinity;

var appContext = require.context('./src', true, /\.spec\.ts/);

appContext.keys().forEach(appContext);
