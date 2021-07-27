const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// ENV config
require('dotenv').config({path: path.join(__dirname, './.env')});

// Environment vars and defaults
const PORT = parseInt(process.env.PORT) || 3001;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = parseInt(process.env.DB_PORT);
const DB_COLLECTIONS_USERS = process.env.DB_COLLECTIONS_USERS;
const DB_COLLECTIONS_REFRESH = process.env.DB_COLLECTIONS_REFRESH;
const DB_COLLECTIONS_REQUESTS = process.env.DB_COLLECTIONS_REQUESTS;
const JWT_AUTH_SECRET = process.env.JWT_AUTH_SECRET;

// Mongodb connect string
const mongodbStr = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`;

// Setup Express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());
// Serve static react front-end
app.use(express.static(path.join(__dirname, '../client/build')));

// JWT auth callback
const authJWTCallback = (req, res, next) => {
  const header = req.headers.authorization;
  if (header) {
    // Pull token from header and verify it
    const token = header.split(' ')[1];
    const auth = jwt.verify(token, JWT_AUTH_SECRET, (err, data) => err ? false : data);

    // If verified, attach token body to req
    if (auth) {
      req.data = auth;
      next();
    }
    // Token invalid, likely expired, request refresh
    else {
      res.status(403).json({ status: 0, message: 'Invalid token' });
    }
  }
  else {
    res.status(401).json({ status: 0, message: 'No authorization token supplied' });
  }
}

// Only accessible if MongoDB is reachable
MongoClient.connect(mongodbStr, { useUnifiedTopology: true, connectTimeoutMS: 10000 })
  .then(client => {
    console.log('DB connection successful');
    const db = client.db(DB_NAME);

    // Database object to pass to route handlers
    const database = {
      usersCollection: db.collection(DB_COLLECTIONS_USERS),
      refreshCollection: db.collection(DB_COLLECTIONS_REFRESH),
      requestsCollection: db.collection(DB_COLLECTIONS_REQUESTS)
    }

    // Express routes
    const auth = require(path.join(__dirname, './routes/auth'))(database);
    const user = require(path.join(__dirname, './routes/user'))(database);
    const admin = require(path.join(__dirname, './routes/admin'))(database);
    
    // Router modules
    app.use('/auth', auth);
    app.use('/user', authJWTCallback, user);
    app.use('/admin', authJWTCallback, admin);

    // Get request wildcard, send index.html to allow react router routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });

    // 404 all undefined endpoints and methods that aren't GET
    app.all('*', (req, res) => {
      res.sendStatus(404);
    });

    app.listen(PORT, () => {
      console.log(`Listening on http://localhost:${PORT}`);
    });
  })
  .catch(err => { console.log(err); return process.exit(1) });

