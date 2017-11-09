const bcrypt = require('bcrypt-nodejs');

module.exports = class UserClass {
    // generating a hash
    generateHash(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    }

    // checking if password is valid
    validPassword(password) {
        return bcrypt.compareSync(password, this.local.password);
    }
}
