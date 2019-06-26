const service = {};
let authLevels;

service.init = (customAuthLevels) => {
    authLevels = customAuthLevels ? require('../auth/authLevels').concat(customAuthLevels) : require('../auth/authLevels');
}

service.getAuthLevels = () => {
    return authLevels;
}

module.exports = service;