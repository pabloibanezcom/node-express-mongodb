// load all the things we need
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// expose this function to our app using module.exports
module.exports = (passport, User, token_key) => {

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

            User.findOne({ 'local.email': email }, (err, user) => {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    var newUser = new User();

                    newUser.local.email = email;
                    newUser.local.password = newUser.generateHash(password);

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
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                const result = {
                    user: user.local.email,
                    token: jwt.sign({
                        id: user.id,
                    }, jwtOptions.secretOrKey, {})
                };
                return done(null, result);
            });
        }));

    passport.use('local-admin', new JwtStrategy(jwtOptions, (jwt_payload, done) => {
        User.findOne({ id: jwt_payload.sub }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            return user && user.isAdmin ? done(null, user) : done(null, false);
        });
    }));

    passport.use('local-user', new JwtStrategy(jwtOptions, (jwt_payload, done) => {
        User.findOne({ id: jwt_payload.sub }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            return user ? done(null, user) : done(null, false);
        });
    }));

};