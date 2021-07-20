require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const path = require('path');
const { MongoClient } = require('mongodb');

// Environment vars and defaults
const PORT = parseInt(process.env.PORT) || 3001;
const JWT_AUTH_SECRET = process.env.JWT_AUTH_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS);
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = parseInt(process.env.DB_PORT);
const DB_COLLECTIONS_USERS = process.env.DB_COLLECTIONS_USERS;
const DB_COLLECTIONS_REQS = process.env.DB_COLLECTIONS_REQS;

// Mongodb connect string
const mongodbStr = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`;

// Setup Express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(helmet());
// Serve static react front-end
app.use(express.static(path.join(__dirname, '../client/build')));

// JWT auth function
const authJWT = (req, res, next) => {
  const header = req.headers.authorization;
  if (header) {
    const token = header.split(' ')[1];
    jwt.verify(token, JWT_AUTH_SECRET, (err, data) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.data = data;
      next();
    });
  }
  else {
    res.sendStatus(401);
  }
}

// Only accessible if MongoDB is reachable
MongoClient.connect(mongodbStr, { useUnifiedTopology: true, connectTimeoutMS: 10000 })
  .then(client => {
    console.log('DB connection successful');
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(DB_COLLECTIONS_USERS);
    const requestsCollection = db.collection(DB_COLLECTIONS_REQS);

    // login endpoint
    // Post request URL or JSON encoded
    // 401 for both user not found and incorrect password to prevent user enumeration
    // user: String
    // pass: String
    app.post('/auth/login', (req, res) => {
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
                }, JWT_AUTH_SECRET, { expiresIn: '5m' });
                // Generate JWT refresh
                const refresh = jwt.sign({
                  user: found.user
                }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

                // Store refresh token in HttpOnly cookie with 7d expiration, only send to /auth/refresh
                res.header('Set-Cookie', `refresh=${refresh}; Max-Age=604800; path=/auth/refresh; SameSite=Lax; Secure; HttpOnly`)
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
    });

    // register endpoint
    // Post request URL or JSON encoded
    // name: String
    // user: String
    // pass: String
    app.post('/auth/register', (req, res) => {
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

    // Get request wildcard, send index.html to allow react router routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });

    // 404 all undefined endpoints and methods that aren't GET
    app.all('*', (req, res) => {
      res.sendStatus(404);
    });

    app.listen(PORT, () => {
      console.log(`Listening on http://localhost:${PORT}/api`);
    });
  })
  .catch(err => { console.log(err); return process.exit(1) });

