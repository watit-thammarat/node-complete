const bcrypt = require('bcryptjs');
const _ = require('lodash');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  const messages = req.flash('error');
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: _.isEmpty(messages) ? null : messages[0]
  });
};

exports.getSignup = (req, res, next) => {
  const messages = req.flash('error');
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: _.isEmpty(messages) ? null : messages[0]
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }
      return bcrypt.compare(password, user.password).then(match => {
        if (!match) {
          req.flash('error', 'Invalid email or password');
          return res.redirect('/login');
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err => {
          if (err) {
            console.error(err);
          }
          res.redirect('/');
        });
      });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  User.findOne({ email })
    .then(userDoc => {
      if (userDoc) {
        req.flash(
          'error',
          'E-Mail exists already, please pick a different one.'
        );
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(password => {
          const user = new User({ email, password, cart: { items: [] } });
          return user.save();
        })
        .then(() => {
          res.redirect('/');
        });
    })
    .catch(err => console.error(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return console.error(err);
    }
    res.redirect('/');
  });
};
