// load all the things we need
const LocalStrategy = require('passport-local').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const jwt = require('jsonwebtoken');

// expose this function to our app using module.exports
module.exports = (passport, User) => {

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, email, password, done) {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email': email }, function (err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {

                    // if there is no user with that email
                    // create the user
                    var newUser = new User();

                    // set the user's local credentials
                    newUser.local.email = email;
                    newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model

                    // save the user
                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });

        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password'
    },
        function (email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email': email }, function (err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                const result = {
                    user: user.local.email,
                    token: jwt.sign({
                        id: user.id,
                    }, 'server secret', {})
                };
                return done(null, result);
            });

        }));

    passport.use('facebook-token', new FacebookTokenStrategy({
        clientID: process.env.FB_APP_KEY,
        clientSecret: process.env.FB_APP_SECRET
    },
        function (accessToken, refreshToken, profile, done) {

            User.find({}, (err, users) => {
                let authorizedUser;
                users.forEach(function (user) {
                    if (user._doc.facebookId === profile.id + '') {
                        authorizedUser = user._doc;
                    }
                });
                if (authorizedUser === undefined) {
                    createNewUser(profile);
                    authorizedUser = true;
                }
                return done(null, authorizedUser);
            });
        }
    ));

    passport.use('admin', new FacebookTokenStrategy({
        clientID: process.env.FB_APP_KEY,
        clientSecret: process.env.FB_APP_SECRET
    },
        function (accessToken, refreshToken, profile, done) {
            let isAdmin = false;
            User.find({}, function (err, users) {
                users.forEach(function (user) {
                    if (user._doc.facebookId === profile.id) {
                        isAdmin = user._doc.isAdmin;
                    }
                });
                return done(null, isAdmin);
            });
        }
    ));

    const createNewUser = function (profile) {
        const newUser = new User({
            name: profile.displayName,
            photo: profile.photos[0].value,
            facebookId: profile.id,
            authorised: false,
            registrationDate: new Date(),
            lastAccessDate: new Date()
        });
        newUser.save(function (err) {
            if (err) return handleError(err);
        });
    }

};