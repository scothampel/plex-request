require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const path = require('path');
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser');

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
    const auth = require('./routes/auth')(database);
    
    // Router modules
    app.use('/auth', auth);

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

