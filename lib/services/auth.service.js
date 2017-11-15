const service = {};
let authLevels;

service.init = (customAuthLevels) => {
    authLevels = require('../auth/authLevels').concat(customAuthLevels);
}

service.getAuthLevels = () => {
    return authLevels;
}

module.exports = service;