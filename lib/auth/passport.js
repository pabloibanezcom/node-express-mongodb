// load all the things we need
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const util = require('../services/util.service');

// expose this function to our app using module.exports
module.exports = (passport, User, passportProfiles) => {

    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: '1234'
    }

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        (req, email, password, done) => {

            if (!util.validateEmail(email) || !util.validatePassword(password) || !util.validateUserBody(req.body)) {
                return done({ statusCode: 400 }, null);
            }

            User.findOne({ 'local.email': email }, (err, user) => {
                if (err)
                    return done(err);
                if (user) {
                    return done({ statusCode: 409 }, null);
                } else {
                    var newUser = new User();

                    newUser.local = {
                        email: email,
                        password: newUser.generateHash(password)
                    };
                    newUser.authLevel = '';
                    newUser.firstName = req.body.firstName;
                    newUser.lastName = req.body.lastName;
                    newUser.title = req.body.title;
                    newUser.genre = req.body.genre;
                    newUser.picture = req.body.picture;
                    newUser.registrationDate = Date.now();
                    newUser.lastAccessDate = newUser.registrationDate;

                    newUser.save(err => {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        }));

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password'
    },
        (email, password, done) => {
            User.findOne({ 'local.email': email }, (err, user) => {
                if (err)
                    return done(err);
                if (!user)
                    return done({ statusCode: 400 }, null);
                if (!user.validPassword(password))
                    return done({ statusCode: 400 }, null);

                const response = {
                    statusCode: 200,
                    result: {
                        user: user.local.email,
                        token: jwt.sign({
                            id: user.id,
                        }, jwtOptions.secretOrKey, {})
                    }
                };
                return done(null, response);
            });
        }));

    passport.use('local-user', new JwtStrategy(jwtOptions, (jwt_payload, done) => {
        User.findOne({ _id: jwt_payload.id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            return user ? done(null, user) : done(null, false);
        });
    }));

    passportProfiles.forEach(profile => {
        passport.use(profile.name, new JwtStrategy(jwtOptions, (jwt_payload, done) => {
            User.findOne({ _id: jwt_payload.id }, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                return user ? done(null, user) : done(null, false);
            }).populate(profile.populate);
        }));
    });

};