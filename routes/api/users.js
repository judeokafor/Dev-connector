const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../../config/database');

// load user model
const User = require('../../models/User');

// load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

/**
 * @route GET api/users/test
 * @desc Tests users route
 * @access Public
 */

router.get('/test', (req, res) => {
   res.json({ msg: 'Users Works' });
});

/**
 * @route post api/users/register
 * @desc REGISTER users route
 * @access Public
 */
router.post('/register', (req, res) => {
   const { errors, isValid } = validateRegisterInput(req.body);
   // check validation
   if (!isValid) {
      return res.status(400).json(errors);
   }

   User.findOne({ email: req.body.email }).then(user => {
      if (user) {
         errors.email = `Email already exists`;
         return res.status(400).json(errors);
      } else {
         const avatar = gravatar.url(req.body.email, {
            s: '200', //size
            r: 'pg', // rating
            d: 'mm' // default
         });
         newUser = new User({
            name: req.body.name,
            email: req.body.email,
            avatar: avatar,
            password: req.body.password
         });

         bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
               if (err) throw err;
               newUser.password = hash;
               newUser
                  .save()
                  .then(user => {
                     res.json(user);
                  })
                  .catch(err => {
                     console.log(err);
                  });
            });
         });
      }
   });
});

/**
 * @route post api/users/login
 * @desc LOGIN returns token
 * @access Public
 */
router.post('/login', (req, res) => {
   const { errors, isValid } = validateLoginInput(req.body);
   // check validation
   if (!isValid) {
      return res.status(400).json(errors);
   }
   const email = req.body.email;
   const password = req.body.password;
   // find user by email
   User.findOne({ email }).then(user => {
      if (!user) {
         errors.email = 'User not found';
         return res.status(404).json(errors);
      } else {
         // check password
         bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
               // user matched

               // create jwt payload
               const payload = {
                  id: user.id,
                  name: user.name,
                  avatar: user.avatar
               };

               // sign the token
               jwt.sign(
                  payload,
                  keys.secret,
                  {
                     expiresIn: 3600 //expires in one hour
                  },
                  (err, token) => {
                     if (err) throw err;
                     res.status(201).json({
                        success: true,
                        token: `Bearer ${token}`
                     });
                  }
               );
            } else {
               errors.password = 'Password incorrect';
               return res.status(400).json(errors);
            }
         });
      }
   });
});

/**
 * @route GET api/users/current
 * @desc Get current user profile
 * @access Private
 */
router.get(
   '/current',
   passport.authenticate('jwt', { session: false }),
   (req, res) => {
      res.json({
         id: req.user.id,
         name: req.user.name,
         email: req.user.email
      });
   }
);

/**
 * @route post api/users/current
 * @desc To get current user profile value
 * @access Private
 */

router.get(
   '/current',
   passport.authenticate('jwt', { session: false }),
   (req, res) => {
      res.json({
         id: req.user.id,
         name: req.user.name,
         email: req.user.email
      });
   }
);

module.exports = router;
