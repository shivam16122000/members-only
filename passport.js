const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('./models/user');

passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({ username }, (err, user) => {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'Incorrect Email' });
            bcrypt.compare(password, user.password, (error, res) => {
                if (res) {
                    // passwords match
                    return done(null, user);
                }
                // passwords do not match
                return done(null, false, { message: 'Incorrect Password' });
            });
        });
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

module.exports = passport;