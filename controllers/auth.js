const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_user:
        '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'
    }
  })
);

exports.getLogin = (req, res, next) => {
  const messages = req.flash('error');
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: _.isEmpty(messages) ? null : messages[0],
    input: {
      email: '',
      password: ''
    },
    errors: []
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: null,
    input: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    errors: []
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      input: { email, password },
      errors: errors.array()
    });
  }
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password',
          isAuthenticated: false,
          input: { email, password },
          errors: []
        });
      }
      return bcrypt.compare(password, user.password).then(match => {
        if (!match) {
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password',
            isAuthenticated: false,
            input: { email, password },
            errors: []
          });
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
    .catch(err => {
      next(err);
    });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      input: { email, password, confirmPassword },
      errors: errors.array()
    });
  }
  return bcrypt
    .hash(password, 12)
    .then(password => {
      const user = new User({ email, password, cart: { items: [] } });
      return user.save();
    })
    .then(() => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'shop@node-complete.com',
        subject: 'Signup succeeded',
        html: '<h1>You successfully signed up!</h1>'
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return console.error(err);
    }
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  const messages = req.flash('error');
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    isAuthenticated: false,
    errorMessage: _.isEmpty(messages) ? null : messages[0]
  });
};

exports.postReset = (req, res, next) => {
  const { email } = req.body;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        req.flash('error', 'No account with that email found');
        return res.redirect('/reset');
      }
      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          console.error(err);
          return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 1000 * 60 * 60;
        return user.save().then(() => {
          res.redirect('/');
          transporter.sendMail({
            to: email,
            from: 'shop@node-complete.com',
            subject: 'Password Reset',
            html: `
              <p>You requested password reset</p>
              <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
            `
          });
        });
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.getNewPassword = (req, res, next) => {
  const { token } = req.params;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      if (!user) {
      }
      const messages = req.flash('error');
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        isAuthenticated: false,
        errorMessage: _.isEmpty(messages) ? null : messages[0],
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const { password, confirmPassword, userId, passwordToken } = req.body;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      if (!user) {
      }
      return bcrypt.hash(password, 12).then(password => {
        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        return user.save().then(() => {
          res.redirect('/login');
        });
      });
    })
    .catch(err => {
      next(err);
    });
};
