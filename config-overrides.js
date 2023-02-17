const rewireSourceMap = require('react-app-rewire-source-map-loader')

module.exports = function override(config, env) {

    rewireSourceMap(config, env);

    return config;
}
