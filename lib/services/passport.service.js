const service = {};

let passport;

service.storePassport = (pass) => {
    passport = pass;
}

service.getPassport = () => {
    return passport;
}

module.exports = service;