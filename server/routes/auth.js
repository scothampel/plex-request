const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Environment vars and defaults
const JWT_AUTH_SECRET = process.env.JWT_AUTH_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS);

// JWT auth function
const authJWT = (token, secret) => jwt.verify(token, secret, (err, data) => err ? false : data);
// JWT auth callback
const authJWTCallback = (req, res, next) => {
  const header = req.headers.authorization;
  if (header) {
    // Pull token from header and verify it
    const token = header.split(' ')[1];
    const auth = authJWT(token, JWT_AUTH_SECRET);

    // If verified, attach token body to req
    if (auth) {
      req.data = auth;
      next();
    }
    else {
      res.sendStatus(403);
    }
  }
  else {
    res.sendStatus(401);
  }
}

module.exports = function (database) {
  // Destructure database object
  const { usersCollection, refreshCollection } = database;

  // login endpoint
  // Post request URL or JSON encoded
  // 401 for both user not found and incorrect password to prevent user enumeration
  // user: String
  // pass: String
  router.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (user && pass) {
      // Find user in user collegtion
      usersCollection.findOne({ user })
        .then(found => {
          // Return token if login details are correct
          if (found) {
            // Verify password
            const correctPass = bcrypt.compareSync(pass, found.pass);
            if (correctPass) {
              // Generate JWT auth
              const token = jwt.sign({
                user: found.user,
                role: found.role
              }, JWT_AUTH_SECRET, { expiresIn: '10m' });
              // Generate JWT refresh
              const refresh = jwt.sign({
                user: found.user,
                role: found.role,
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
              }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

              // Insert refresh token into refresh collection
              refreshCollection.insertOne({
                user: found.user,
                token: refresh
              })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({ status: -1, message: err });
                })

              // Store refresh token in HttpOnly cookie with 7d expiration, only send to /auth/refresh
              //res.header('Set-Cookie', `refresh=${refresh}; Max-Age=604800; path=/auth/refresh; SameSite=Lax; Secure; HttpOnly`)
              res.cookie('refresh', refresh, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/auth/refresh',
                sameSite: 'Lax',
                httpOnly: true,
                secure: true
              });
              res.json({ status: 1, message: token });
            }
            // Incorrect password
            else {
              res.status(401).json({ status: 0, message: "Incorrect username or password" });
            }
          }
          // User not found
          else {
            res.status(401).json({ status: 0, message: "Incorrect username or password" });
          }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ status: -1, message: err });
        })
    }
    else {
      res.status(400).json({ status: 0, message: "Not enough arguments" });
    }
  })

  // register endpoint
  // Post request URL or JSON encoded
  // name: String
  // user: String
  // pass: String
  router.post('/register', (req, res) => {
    const { name, user, pass } = req.body;
    // Check for required args
    if (name && user && pass) {
      usersCollection.findOne({ user })
        .then(found => {
          // Check for existing username
          if (!found) {
            // New user obj for collection insertion
            const newUser = {
              name,
              user,
              pass: bcrypt.hashSync(pass, BCRYPT_ROUNDS),
              role: 'unconfirmed'
            }

            // Insert into collection
            usersCollection.insertOne(newUser)
              .then(result => {
                res.json({ status: 1, message: result });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({ status: -1, message: err });
              })
          }
          else {
            res.status(400).json({ status: 0, message: "User already exists" });
          }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ status: -1, message: err });
        });
    }
    else {
      res.status(400).json({ status: 0, message: "Not enough arguments" });
    }
  });

  // refresh endpoint
  // Post request with refresh cookie set
  router.post('/refresh', (req, res) => {
    const token = req.cookies.refresh;
    if (token) {
      // Find token in refresh collegtion
      refreshCollection.findOne({ token })
        .then(found => {
          // Check if refresh token found
          if (found) {
            // Check if refresh token is valid
            const valid = authJWT(token, JWT_REFRESH_SECRET);
            if (valid) {
              // Generate JWT auth
              const token = jwt.sign({
                user: valid.user,
                role: valid.role
              }, JWT_AUTH_SECRET, { expiresIn: '10m' });

              res.json({ status: 1, message: token });
            }
            // Token is invalid or error verifying, likely expired, actual error is not important
            else {
              res.status(403).send({ status: 0, message: "Invalid refresh token" })
            }
          }
          // Token not found
          else {
            // Could respond with a 403, but 401 does not assume the input is a valid token
            // Could seperate into 400, 401, and 403, but it really is not important
            res.status(401).json({ status: 0, message: "Invalid refresh token" });
          }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ status: -1, message: err });
        })
    }
    else {
      res.status(400).json({ status: 0, message: "No refresh token provided" });
    }
  });

  return router;
}