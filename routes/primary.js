/* eslint no-undef: "error" */
/* eslint-env node */

const { rethinkdb, mailService, domains, dataGovKey } = require('./../config');
const r = require('rethinkdbdash')(rethinkdb);
const User = require('./../models/user');
const passport = require('passport');
const router = require('express').Router();
const request = require('request');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');

router.get('/', (req, res) => {
  res.redirect('/notes');
});

router.get('/register', function (req, res) {
  request('https://api.nasa.gov/planetary/apod?api_key=' + dataGovKey + '&hd=true', function (err, body) {
    if (err) throw err;
    res.render('pages/register', {
      page: {
        title: 'Register',
        description: 'Registration page @ Notus',
        url: domains.base + '/register'
      },
      potd: JSON.parse(body.body)
    });
  });
});

router.post('/register', function (req, res) {
  if (!req.body.conPassword) return res.send({error: true, message: 'No confirmation password.'});
  if (req.body.conPassword !== req.body.password) return res.send({error: true, message: 'Confirmation password incorrect.'});

  User.register(new User({
    username: req.body.username,
    email: req.body.email
  }), req.body.password, function (err) {
    if (err) {
      return res.send({error: true, message: err.message});
    }

    res.send({success: true});
  });
});

router.get('/login', function (req, res) {
  request('https://api.nasa.gov/planetary/apod?api_key=' + dataGovKey + '&hd=true', function (err, body) {
    if (err) throw err;
    res.render('pages/login', {
      page: {
        title: 'Login',
        description: 'Login page @ Notus',
        url: domains.base + '/login'
      },
      potd: JSON.parse(body.body)
    });
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', function (error, user) {
    if (error) {
      console.log('error', error);
      return res.send({
        error: true,
        message: error
      });
    }
    if (!user) {
      return res.send({
        error: true,
        message: 'Invalid credentials.'
      });
    }

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.send({
        success: true
      });
    });
  })(req, res, next);
});

router.get('/logout', loggedIn, function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/me', loggedIn, function (req, res) {
  if (req.user) {
    res.json(req.user);
  } else {
    res.redirect('/login');
  }
});

router.post('/me/password', loggedIn, function (req, res) {
  User.authenticate(req.body.curPass, function (err, model, pErr) {
    if (err) throw err;

    if (pErr) {
      return res.send({
        success: false,
        message: 'Wrong password.'
      });
    }
  });

  if (req.body.newPass !== req.body.conPass) {
    return res.send({
      success: false,
      message: 'Confirm password does not match.'
    });
  }

  User.findByUsername(req.user.username).then(account => {
    if (!account) {
      return res.send({
        error: 'Account does not exist.'
      });
    }

    account.setPassword(req.body.newPass, function () {
      account.save();

      return res.json({
        success: true
      });
    });
  });
});

router.post('/forgot', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        if (err) throw err;
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (err) throw err;
        if (!user) {
          req.send({error: true, message: 'No account with that email address exists.'});
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.setPassword(req.body.password, function () {
          user.save(function (err) {
            done(err, token, user);
          });
        });
      });
    },
    function (token, user) {
      let transporter = nodemailer.createTransport(mailService);
      var mailOptions = {
        to: user.email,
        from: 'no-reply@' + domains.mail,
        subject: '[Notus] Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function (err) {
        if (err) throw err;
        req.send({success: true, message: 'An e-mail has been sent to ' + user.email + ' with further instructions.'});
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (err) throw err;
        if (!user) {
          res.send({error: true, message: 'Password reset token is invalid or has expired.'});
          return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function (err) {
          if (err) throw err;
          req.logIn(user, function (err) {
            done(err, user);
          });
        });
      });
    },
    function (user, done) {
      var smtpTransport = nodemailer.createTransport(mailService);
      var mailOptions = {
        to: user.email,
        from: 'no-reply@' + domains.mail,
        subject: '[Notus] Password Changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        res.send({success: true, message: 'Success! Your password has been changed.'});
        done(err);
      });
    }
  ], function () {
    res.redirect('/');
  });
});

// partial rendering
router.get('/partials/sidebar', loggedIn, (req, res) => {
  r.table('notus_notes').getAll(req.user.id, {
    index: 'userId'
  }).then(notes => {
    res.render('partials/sidebar', {
      layout: false,
      notes: notes
    });
  });
});

function loggedIn (req, res, next) {
  if (req.user) {
    next();
  }
  res.redirect('/login');
}

module.exports = router;
